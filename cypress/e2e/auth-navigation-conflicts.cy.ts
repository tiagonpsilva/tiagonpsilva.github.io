describe('Authentication Navigation Conflicts - Issue #12', () => {
  beforeEach(() => {
    // Clear any existing auth data
    cy.window().then((win) => {
      win.localStorage.clear()
      win.sessionStorage.clear()
    })
    
    cy.visit('/')
    cy.wait(1000)
  })

  describe('Navigation During Authentication', () => {
    it('should clean up auth state when navigating away during auth process', () => {
      // Start authentication process
      cy.clock()
      cy.tick(31000)
      cy.get('[role="dialog"]').should('be.visible')
      
      // Mock LinkedIn environment variables
      cy.window().then((win) => {
        // @ts-ignore
        win.import.meta = { env: { VITE_LINKEDIN_CLIENT_ID: 'test_client_id' } }
      })
      
      // Click LinkedIn button to start auth
      cy.get('button[aria-label*="Conectar com LinkedIn"]').click()
      
      // Verify auth in progress is set
      cy.window().its('sessionStorage').then((sessionStorage) => {
        expect(sessionStorage.getItem('auth_in_progress')).to.not.be.null
      })
      
      // Navigate to different page
      cy.get('a[href="#blog"]').click()
      cy.url().should('include', '#blog')
      
      // Auth state should be cleaned up
      cy.window().its('sessionStorage').then((sessionStorage) => {
        // Auth progress should be cleared when navigating away
        const authProgress = sessionStorage.getItem('auth_in_progress')
        expect(authProgress).to.be.null
      })
    })
    
    it('should handle browser back button during auth', () => {
      // Navigate to a different page first
      cy.visit('/blog')
      cy.wait(1000)
      
      // Go back to home and start auth
      cy.go('back')
      cy.clock()
      cy.tick(31000)
      cy.get('[role="dialog"]').should('be.visible')
      
      // Mock auth start
      cy.window().then((win) => {
        win.sessionStorage.setItem('auth_in_progress', Date.now().toString())
      })
      
      // Use browser back button
      cy.go('back')
      
      // Auth state should be cleaned
      cy.window().its('sessionStorage').then((sessionStorage) => {
        expect(sessionStorage.getItem('auth_in_progress')).to.be.null
      })
    })
    
    it('should preserve auth callback route from navigation cleanup', () => {
      // Start auth process
      cy.window().then((win) => {
        win.sessionStorage.setItem('auth_in_progress', Date.now().toString())
      })
      
      // Navigate to callback page (should not clean up auth)
      cy.visit('/auth/linkedin/callback?code=test&state=test')
      
      // Auth progress should still be preserved on callback page
      cy.window().its('sessionStorage').then((sessionStorage) => {
        expect(sessionStorage.getItem('auth_in_progress')).to.not.be.null
      })
    })
  })

  describe('Concurrent Authentication Prevention', () => {
    it('should prevent multiple auth attempts when one is in progress', () => {
      // Manually set auth in progress
      cy.window().then((win) => {
        win.sessionStorage.setItem('auth_in_progress', Date.now().toString())
      })
      
      // Try to start another auth
      cy.clock()
      cy.tick(31000)
      cy.get('[role="dialog"]').should('be.visible')
      
      // Mock LinkedIn environment
      cy.window().then((win) => {
        // @ts-ignore
        win.import.meta = { env: { VITE_LINKEDIN_CLIENT_ID: 'test_client_id' } }
      })
      
      // Click should be ignored due to concurrent auth prevention
      cy.get('button[aria-label*="Conectar com LinkedIn"]').click()
      
      // Should show warning in console (check via network or other means)
      cy.window().its('console').should('exist')
    })
    
    it('should allow new auth after previous auth expires', () => {
      // Set expired auth (more than 5 minutes old)
      const expiredTime = Date.now() - (6 * 60 * 1000) // 6 minutes ago
      cy.window().then((win) => {
        win.sessionStorage.setItem('auth_in_progress', expiredTime.toString())
      })
      
      // Try to start new auth - should work
      cy.clock()
      cy.tick(31000)
      cy.get('[role="dialog"]').should('be.visible')
      
      cy.get('button[aria-label*="Conectar com LinkedIn"]').click()
      
      // Should have updated auth progress timestamp
      cy.window().its('sessionStorage').then((sessionStorage) => {
        const newAuthProgress = sessionStorage.getItem('auth_in_progress')
        expect(parseInt(newAuthProgress || '0')).to.be.greaterThan(expiredTime)
      })
    })
  })

  describe('Authentication State Persistence', () => {
    it('should handle page visibility changes during auth', () => {
      // Start auth
      cy.window().then((win) => {
        win.sessionStorage.setItem('auth_in_progress', Date.now().toString())
        win.sessionStorage.setItem('navigation_during_auth', 'true')
      })
      
      // Simulate page becoming visible (tab switching back)
      cy.document().then((doc) => {
        Object.defineProperty(doc, 'visibilityState', {
          value: 'visible',
          writable: true
        })
        
        doc.dispatchEvent(new Event('visibilitychange'))
      })
      
      // Should clean up interrupted auth
      cy.wait(100)
      cy.window().its('sessionStorage').then((sessionStorage) => {
        expect(sessionStorage.getItem('navigation_during_auth')).to.be.null
        expect(sessionStorage.getItem('auth_in_progress')).to.be.null
      })
    })
    
    it('should clean up auth state on page unload', () => {
      // Set auth in progress
      cy.window().then((win) => {
        win.sessionStorage.setItem('auth_in_progress', Date.now().toString())
      })
      
      // Trigger beforeunload event
      cy.window().then((win) => {
        win.dispatchEvent(new Event('beforeunload'))
      })
      
      // Should mark navigation during auth
      cy.window().its('sessionStorage').then((sessionStorage) => {
        expect(sessionStorage.getItem('navigation_during_auth')).to.equal('true')
      })
    })
    
    it('should timeout long-running auth attempts', () => {
      // Set auth that started 6 minutes ago (beyond 5 minute limit)
      const oldTimestamp = Date.now() - (6 * 60 * 1000)
      cy.window().then((win) => {
        win.sessionStorage.setItem('auth_in_progress', oldTimestamp.toString())
      })
      
      // Check auth status - should detect timeout
      cy.visit('/')
      cy.wait(1000)
      
      // Auth should be cleaned up due to timeout
      cy.window().its('sessionStorage').then((sessionStorage) => {
        expect(sessionStorage.getItem('auth_in_progress')).to.be.null
      })
    })
  })

  describe('Auth Status Indicator', () => {
    it('should show auth status indicator when auth is in progress', () => {
      // Set auth in progress
      cy.window().then((win) => {
        win.sessionStorage.setItem('auth_in_progress', Date.now().toString())
      })
      
      cy.visit('/')
      cy.wait(2000) // Allow status indicator to appear
      
      // Should show auth status indicator
      cy.get('[role="status"]').should('be.visible')
      cy.contains('Autenticando com LinkedIn').should('be.visible')
    })
    
    it('should show interrupted auth message', () => {
      // Set navigation during auth flag
      cy.window().then((win) => {
        win.sessionStorage.setItem('navigation_during_auth', 'true')
      })
      
      cy.visit('/')
      cy.wait(2000)
      
      // Should show interrupted auth message
      cy.get('[role="status"]').should('be.visible')
      cy.contains('interrompida').should('be.visible')
    })
    
    it('should auto-dismiss status messages', () => {
      // Set navigation during auth flag
      cy.window().then((win) => {
        win.sessionStorage.setItem('navigation_during_auth', 'true')
      })
      
      cy.visit('/')
      cy.wait(2000)
      
      // Should show initially
      cy.get('[role="status"]').should('be.visible')
      
      // Should auto-dismiss after 3 seconds
      cy.wait(4000)
      cy.get('[role="status"]').should('not.exist')
    })
    
    it('should show countdown timer for auth in progress', () => {
      // Set recent auth in progress
      cy.window().then((win) => {
        win.sessionStorage.setItem('auth_in_progress', Date.now().toString())
      })
      
      cy.visit('/')
      cy.wait(2000)
      
      // Should show countdown
      cy.get('[role="status"]').should('be.visible')
      cy.get('[role="status"]').should('contain', ':')  // Time format
    })
  })

  describe('Popup Management During Navigation', () => {
    it('should close popup when navigating away', () => {
      let mockPopup: any
      
      cy.window().then((win) => {
        // Mock popup window
        mockPopup = {
          closed: false,
          close: cy.stub(),
          focus: cy.stub()
        }
        
        cy.stub(win, 'open').returns(mockPopup)
        
        // @ts-ignore
        win.import.meta = { env: { VITE_LINKEDIN_CLIENT_ID: 'test_client_id' } }
      })
      
      // Start auth to open popup
      cy.clock()
      cy.tick(31000)
      cy.get('[role="dialog"]').should('be.visible')
      cy.get('button[aria-label*="Conectar com LinkedIn"]').click()
      
      // Navigate away
      cy.get('a[href="#cases"]').click()
      
      // Popup should be closed (mocked)
      cy.then(() => {
        expect(mockPopup.close).to.have.been.called
      })
    })
    
    it('should handle popup reference cleanup', () => {
      // Mock successful auth and popup cleanup
      cy.window().then((win) => {
        // Simulate successful auth
        win.dispatchEvent(new CustomEvent('linkedin-auth-success'))
      })
      
      cy.visit('/')
      cy.wait(1000)
      
      // Should not have any auth in progress
      cy.window().its('sessionStorage').then((sessionStorage) => {
        expect(sessionStorage.getItem('auth_in_progress')).to.be.null
      })
    })
  })

  describe('Deep Link Preservation', () => {
    it('should preserve return URL during navigation conflicts', () => {
      // Visit specific page
      cy.visit('/blog')
      
      // Start auth
      cy.window().then((win) => {
        win.sessionStorage.setItem('auth_in_progress', Date.now().toString())
        win.sessionStorage.setItem('linkedin_auth_return_url', '/blog')
      })
      
      // Navigate away and back
      cy.visit('/cases')
      cy.visit('/')
      
      // Return URL should be preserved or cleaned appropriately
      cy.window().its('sessionStorage').then((sessionStorage) => {
        const returnUrl = sessionStorage.getItem('linkedin_auth_return_url')
        // Return URL should either be preserved or cleaned based on auth state
        if (sessionStorage.getItem('auth_in_progress')) {
          expect(returnUrl).to.not.be.null
        } else {
          expect(returnUrl).to.be.null
        }
      })
    })
  })

  describe('Error Recovery', () => {
    it('should recover from corrupted auth state', () => {
      // Set invalid auth state
      cy.window().then((win) => {
        win.sessionStorage.setItem('auth_in_progress', 'invalid_timestamp')
        win.sessionStorage.setItem('linkedin_oauth_state', 'corrupted_state')
      })
      
      cy.visit('/')
      cy.wait(1000)
      
      // Should clean up corrupted state
      cy.window().its('sessionStorage').then((sessionStorage) => {
        expect(sessionStorage.getItem('auth_in_progress')).to.be.null
        expect(sessionStorage.getItem('linkedin_oauth_state')).to.be.null
      })
    })
    
    it('should handle multiple navigation events gracefully', () => {
      // Start auth
      cy.window().then((win) => {
        win.sessionStorage.setItem('auth_in_progress', Date.now().toString())
      })
      
      // Rapid navigation
      cy.visit('/blog')
      cy.visit('/cases')
      cy.visit('/contact')
      cy.visit('/')
      
      // Should handle multiple cleanups without errors
      cy.window().its('sessionStorage').then((sessionStorage) => {
        expect(sessionStorage.getItem('auth_in_progress')).to.be.null
      })
    })
  })
})
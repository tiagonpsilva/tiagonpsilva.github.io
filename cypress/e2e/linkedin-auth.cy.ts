describe('LinkedIn Authentication Flow', () => {
  beforeEach(() => {
    // Clear auth data before each test
    cy.clearAuthData()
    cy.visit('/')
  })

  describe('Successful Authentication', () => {
    it('should complete LinkedIn OAuth flow successfully', () => {
      // Load user fixture
      cy.fixture('users').then((users) => {
        const testUser = users.validUser

        // Setup successful auth mock
        cy.simulateLinkedInAuthSuccess(testUser)

        // Click auth button to trigger login
        cy.get('[data-testid="auth-button"]').click()

        // Wait for LinkedIn auth window/modal
        cy.get('[data-testid="linkedin-auth-button"]').click()

        // Wait for auth state to change
        cy.waitForAuthStateChange()

        // Verify user is authenticated
        cy.get('[data-testid="user-profile"]').should('be.visible')
        cy.get('[data-testid="user-name"]').should('contain.text', testUser.name)
        cy.get('[data-testid="user-email"]').should('contain.text', testUser.email)

        // Verify localStorage contains user data
        cy.window().then((win) => {
          const savedUser = JSON.parse(win.localStorage.getItem('linkedin_user') || '{}')
          expect(savedUser.id).to.equal(testUser.id)
          expect(savedUser.name).to.equal(testUser.name)
          expect(savedUser.email).to.equal(testUser.email)
        })

        // Verify Mixpanel tracking
        cy.verifyMixpanelEvent('User Authenticated')
      })
    })

    it('should handle user without email gracefully', () => {
      cy.fixture('users').then((users) => {
        const testUser = users.userWithoutEmail

        cy.simulateLinkedInAuthSuccess(testUser)
        
        cy.get('[data-testid="auth-button"]').click()
        cy.get('[data-testid="linkedin-auth-button"]').click()

        cy.waitForAuthStateChange()

        // Should still show user profile even without email
        cy.get('[data-testid="user-profile"]').should('be.visible')
        cy.get('[data-testid="user-name"]').should('contain.text', testUser.name)
        
        // Email field should not be displayed or show fallback
        cy.get('[data-testid="user-email"]').should('not.exist')
      })
    })

    it('should handle special characters in user data', () => {
      cy.fixture('users').then((users) => {
        const testUser = users.userWithSpecialChars

        cy.simulateLinkedInAuthSuccess(testUser)
        
        cy.get('[data-testid="auth-button"]').click()
        cy.get('[data-testid="linkedin-auth-button"]').click()

        cy.waitForAuthStateChange()

        cy.get('[data-testid="user-name"]').should('contain.text', testUser.name)
        cy.get('[data-testid="user-headline"]').should('contain.text', testUser.headline)
      })
    })
  })

  describe('Authentication Failures', () => {
    it('should handle popup blocked scenario', () => {
      cy.simulateLinkedInAuthFailure('popup_blocked')

      cy.get('[data-testid="auth-button"]').click()
      cy.get('[data-testid="linkedin-auth-button"]').click()

      // Should show error message or fallback
      cy.get('[data-testid="auth-error"]').should('be.visible')
      cy.get('[data-testid="auth-error"]').should('contain.text', 'popup')

      // User should remain unauthenticated
      cy.get('[data-testid="user-profile"]').should('not.exist')
    })

    it('should handle network errors during token exchange', () => {
      cy.simulateLinkedInAuthFailure('network_error')

      cy.get('[data-testid="auth-button"]').click()
      cy.get('[data-testid="linkedin-auth-button"]').click()

      // Should show network error
      cy.get('[data-testid="auth-error"]').should('be.visible')
      cy.get('[data-testid="auth-error"]').should('contain.text', 'network')
    })

    it('should handle invalid token errors', () => {
      cy.simulateLinkedInAuthFailure('invalid_token')

      cy.get('[data-testid="auth-button"]').click()
      cy.get('[data-testid="linkedin-auth-button"]').click()

      // Should show token error
      cy.get('[data-testid="auth-error"]').should('be.visible')
      cy.get('[data-testid="auth-error"]').should('contain.text', 'token')
    })
  })

  describe('Authentication State Management', () => {
    it('should persist user session across page reloads', () => {
      cy.fixture('users').then((users) => {
        const testUser = users.validUser

        // Complete auth flow
        cy.simulateLinkedInAuthSuccess(testUser)
        cy.get('[data-testid="auth-button"]').click()
        cy.get('[data-testid="linkedin-auth-button"]').click()
        cy.waitForAuthStateChange()

        // Reload page
        cy.reload()

        // User should still be authenticated
        cy.get('[data-testid="user-profile"]').should('be.visible')
        cy.get('[data-testid="user-name"]').should('contain.text', testUser.name)
      })
    })

    it('should handle sign out correctly', () => {
      cy.fixture('users').then((users) => {
        const testUser = users.validUser

        // Complete auth flow
        cy.simulateLinkedInAuthSuccess(testUser)
        cy.get('[data-testid="auth-button"]').click()
        cy.get('[data-testid="linkedin-auth-button"]').click()
        cy.waitForAuthStateChange()

        // Sign out
        cy.get('[data-testid="sign-out-button"]').click()

        // Should return to unauthenticated state
        cy.get('[data-testid="user-profile"]').should('not.exist')
        cy.get('[data-testid="auth-button"]').should('be.visible')

        // localStorage should be cleared
        cy.window().then((win) => {
          expect(win.localStorage.getItem('linkedin_user')).to.be.null
        })
      })
    })
  })

  describe('Auth Modal Behavior', () => {
    it('should show auth modal after 30 seconds for unauthenticated users', () => {
      // Set faster timeout for testing
      cy.clock()
      
      cy.visit('/')
      
      // Fast forward 30 seconds
      cy.tick(30000)
      
      cy.get('[data-testid="auth-modal"]').should('be.visible')
      cy.get('[data-testid="auth-modal-title"]').should('contain.text', 'conectar')
    })

    it('should show auth modal after 3 page views', () => {
      // Visit multiple pages to trigger page view counter
      cy.visit('/')
      cy.visit('/cases')
      cy.visit('/blog')
      cy.visit('/contact') // 4th page view should trigger modal

      cy.get('[data-testid="auth-modal"]').should('be.visible')
    })

    it('should not show auth modal if recently dismissed', () => {
      cy.clock()
      
      cy.visit('/')
      cy.tick(30000)
      
      // Dismiss modal
      cy.get('[data-testid="auth-modal"]').should('be.visible')
      cy.get('[data-testid="dismiss-auth-modal"]').click()
      
      // Modal should be hidden
      cy.get('[data-testid="auth-modal"]').should('not.exist')
      
      // Even after another 30 seconds, should not show again
      cy.tick(30000)
      cy.get('[data-testid="auth-modal"]').should('not.exist')
    })
  })

  describe('Cross-browser Compatibility', () => {
    it('should work on different viewport sizes', () => {
      // Test mobile viewport
      cy.viewport(375, 667)
      
      cy.fixture('users').then((users) => {
        const testUser = users.validUser
        
        cy.simulateLinkedInAuthSuccess(testUser)
        cy.get('[data-testid="auth-button"]').click()
        cy.get('[data-testid="linkedin-auth-button"]').click()
        cy.waitForAuthStateChange()

        cy.get('[data-testid="user-profile"]').should('be.visible')
      })

      // Test tablet viewport
      cy.viewport(768, 1024)
      cy.reload()
      cy.get('[data-testid="user-profile"]').should('be.visible')

      // Test desktop viewport
      cy.viewport(1280, 720)
      cy.reload()
      cy.get('[data-testid="user-profile"]').should('be.visible')
    })
  })

  describe('Performance and Analytics', () => {
    it('should track authentication events in Mixpanel', () => {
      cy.fixture('users').then((users) => {
        const testUser = users.validUser

        // Setup Mixpanel spy
        cy.window().then((win) => {
          if (win.mixpanel) {
            cy.spy(win.mixpanel, 'track').as('mixpanelTrack')
          }
        })

        cy.simulateLinkedInAuthSuccess(testUser)
        cy.get('[data-testid="auth-button"]').click()
        
        // Should track OAuth initiation
        cy.get('@mixpanelTrack').should('have.been.calledWith', 'LinkedIn OAuth Initiated')
        
        cy.get('[data-testid="linkedin-auth-button"]').click()
        cy.waitForAuthStateChange()

        // Should track successful authentication
        cy.get('@mixpanelTrack').should('have.been.calledWith', 'User Authenticated')
      })
    })

    it('should complete auth flow within acceptable time limits', () => {
      const startTime = Date.now()

      cy.fixture('users').then((users) => {
        const testUser = users.validUser

        cy.simulateLinkedInAuthSuccess(testUser)
        cy.get('[data-testid="auth-button"]').click()
        cy.get('[data-testid="linkedin-auth-button"]').click()
        cy.waitForAuthStateChange()

        cy.then(() => {
          const endTime = Date.now()
          const duration = endTime - startTime
          
          // Auth flow should complete within 5 seconds
          expect(duration).to.be.lessThan(5000)
        })
      })
    })
  })
})
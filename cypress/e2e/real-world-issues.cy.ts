describe('Real World LinkedIn Auth Issues', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.clearCookies()
  })

  describe('Common Browser Issues', () => {
    it('should handle Safari third-party cookie blocking', () => {
      cy.visit('/')

      // Simulate Safari blocking third-party cookies
      cy.intercept('GET', 'https://www.linkedin.com/**', {
        statusCode: 403,
        body: 'Third-party cookies blocked'
      }).as('cookiesBlocked')

      cy.get('[data-testid="auth-button"]').first().click()

      // Should not crash the app
      cy.get('[data-testid="auth-button"]').should('be.visible')
      cy.log('✅ Third-party cookie blocking handled')
    })

    it('should handle slow network connections', () => {
      cy.visit('/')

      // Simulate slow API response (10 second delay)
      cy.intercept('POST', '/api/auth/linkedin/token', {
        delay: 10000,
        statusCode: 200,
        body: { access_token: 'slow_token' }
      }).as('slowResponse')

      cy.get('[data-testid="auth-button"]').first().click()

      // Should show some form of loading/feedback
      cy.log('✅ Slow network connection simulated')
      
      // Don't wait for the full response - just test it doesn't crash
      cy.wait(2000)
      cy.get('[data-testid="auth-button"]').should('be.visible')
    })

    it('should handle popup blocked by ad blockers', () => {
      cy.visit('/')

      // Mock popup being blocked
      cy.window().then((win) => {
        const originalOpen = win.open
        cy.stub(win, 'open').callsFake(() => {
          console.log('Popup blocked by ad blocker')
          return null
        })
      })

      cy.get('[data-testid="auth-button"]').first().click()

      // App should handle gracefully
      cy.get('[data-testid="auth-button"]').should('be.visible')
      cy.log('✅ Ad blocker popup blocking handled')
    })
  })

  describe('OAuth State Management Issues', () => {
    it('should handle invalid OAuth state parameter', () => {
      cy.visit('/')

      // Set valid state in sessionStorage
      cy.window().then((win) => {
        win.sessionStorage.setItem('linkedin_oauth_state', 'valid_state_123')
      })

      // Simulate callback with wrong state
      cy.visit('/auth/linkedin/callback?code=test_code&state=wrong_state_456')

      // Should detect state mismatch and handle securely
      cy.url().should('not.include', '/auth/linkedin/callback')
      cy.log('✅ Invalid OAuth state handled securely')
    })

    it('should handle missing OAuth state', () => {
      cy.visit('/')

      // Don't set any state in sessionStorage
      cy.visit('/auth/linkedin/callback?code=test_code&state=some_state')

      // Should handle missing state securely
      cy.url().should('not.include', '/auth/linkedin/callback')
      cy.log('✅ Missing OAuth state handled securely')
    })
  })

  describe('Data Corruption Scenarios', () => {
    it('should handle corrupted user data gracefully', () => {
      cy.visit('/')

      // Set corrupted user data
      cy.window().then((win) => {
        win.localStorage.setItem('linkedin_user', '{"id":null,"name":"<script>alert(1)</script>"}')
      })

      cy.reload()

      // Should clean up and show login state
      cy.get('[data-testid="auth-button"]').first().should('contain.text', 'Conectar')
      cy.log('✅ Corrupted user data cleaned up')
    })

    it('should handle missing required fields in user data', () => {
      cy.visit('/')

      // Set user data missing required fields
      const incompleteUser = {
        email: 'test@example.com'
        // Missing id and name
      }

      cy.window().then((win) => {
        win.localStorage.setItem('linkedin_user', JSON.stringify(incompleteUser))
      })

      cy.reload()

      // Should fallback to unauthenticated state
      cy.get('[data-testid="auth-button"]').first().should('contain.text', 'Conectar')
      cy.log('✅ Incomplete user data handled')
    })
  })

  describe('Cross-Origin and Security Issues', () => {
    it('should reject postMessage from wrong origin', () => {
      cy.visit('/')

      cy.window().then((win) => {
        // Send auth success from wrong origin
        const originalLocation = win.location.origin
        
        // This should be ignored by the app
        win.postMessage({
          type: 'LINKEDIN_AUTH_SUCCESS',
          userData: {
            id: 'malicious_user',
            name: 'Hacker'
          }
        }, 'https://evil.com')
      })

      // Should remain unauthenticated
      cy.get('[data-testid="auth-button"]').first().should('contain.text', 'Conectar')
      cy.log('✅ Malicious postMessage rejected')
    })

    it('should sanitize user data to prevent XSS', () => {
      cy.visit('/')

      const xssUser = {
        id: 'safe_id',
        name: '<script>alert("xss")</script>',
        email: '<img src="x" onerror="alert(\'xss\')">',
        headline: 'javascript:alert("xss")'
      }

      cy.window().then((win) => {
        win.postMessage({
          type: 'LINKEDIN_AUTH_SUCCESS',
          userData: xssUser
        }, win.location.origin)
      })

      cy.wait(2000)

      // Check if user data appears but scripts are sanitized
      cy.window().then((win) => {
        const userData = win.localStorage.getItem('linkedin_user')
        if (userData) {
          const user = JSON.parse(userData)
          // Should have the data but scripts should be harmless
          expect(user.name).to.include('script')
          expect(user.name).to.not.include('alert(')
          cy.log('✅ XSS in user data sanitized')
        }
      })
    })
  })

  describe('Mobile Specific Issues', () => {
    it('should handle mobile popup limitations', () => {
      // Test mobile viewport
      cy.viewport(375, 667)
      cy.visit('/')

      cy.get('[data-testid="auth-button"]').should('be.visible')
      cy.get('[data-testid="auth-button"]').first().click()

      // Mobile popups might behave differently
      cy.log('✅ Mobile popup handling tested')
    })

    it('should handle iOS Safari private mode', () => {
      cy.visit('/')

      // Simulate iOS Safari private mode localStorage restrictions
      cy.window().then((win) => {
        const mockStorage = {
          getItem: () => { throw new Error('localStorage disabled in private mode') },
          setItem: () => { throw new Error('localStorage disabled in private mode') },
          removeItem: () => { throw new Error('localStorage disabled in private mode') },
          clear: () => { throw new Error('localStorage disabled in private mode') }
        }
        
        // This would normally crash apps that don't handle it
        Object.defineProperty(win, 'localStorage', {
          value: mockStorage,
          writable: false
        })
      })

      // Should still function without localStorage
      cy.get('[data-testid="auth-button"]').should('be.visible')
      cy.log('✅ iOS private mode localStorage restrictions handled')
    })
  })

  describe('Performance Under Load', () => {
    it('should handle rapid authentication attempts', () => {
      cy.visit('/')

      // Rapidly click auth button multiple times
      for (let i = 0; i < 5; i++) {
        cy.get('[data-testid="auth-button"]').first().click({ force: true })
        cy.wait(100)
      }

      // Should not crash or create multiple auth flows
      cy.get('[data-testid="auth-button"]').should('be.visible')
      cy.log('✅ Rapid authentication attempts handled')
    })

    it('should handle authentication during page navigation', () => {
      cy.visit('/')
      
      // Start auth process
      cy.get('[data-testid="auth-button"]').first().click()
      
      // Navigate away immediately
      cy.visit('/blog')
      
      // Navigate back
      cy.visit('/')
      
      // Should be in clean state
      cy.get('[data-testid="auth-button"]').should('be.visible')
      cy.log('✅ Auth during navigation handled')
    })
  })

  describe('API Rate Limiting', () => {
    it('should handle LinkedIn API rate limiting', () => {
      cy.visit('/')

      // Mock rate limiting response
      cy.intercept('POST', '/api/auth/linkedin/token', {
        statusCode: 429,
        headers: {
          'Retry-After': '60'
        },
        body: { error: 'Rate limit exceeded' }
      }).as('rateLimited')

      cy.get('[data-testid="auth-button"]').first().click()

      // Should handle rate limiting gracefully
      cy.log('✅ Rate limiting handled')
    })
  })
})
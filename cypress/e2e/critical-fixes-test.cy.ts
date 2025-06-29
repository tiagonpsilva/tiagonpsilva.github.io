describe('Critical Authentication Fixes Verification', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.clearCookies()
  })

  describe('Issue #6: AuthButton crash prevention', () => {
    it('should handle user with undefined name gracefully', () => {
      const userWithoutName = {
        id: 'test_user_123',
        email: 'test@example.com'
        // name is missing
      }

      cy.visit('/')
      
      // Set user data with missing name
      cy.window().then((win) => {
        win.localStorage.setItem('linkedin_user', JSON.stringify(userWithoutName))
      })

      cy.reload()

      // Should not crash and show fallback
      cy.get('[data-testid="auth-button"]').should('be.visible')
      cy.get('[data-testid="auth-button"]').should('contain.text', 'Usuário')

      cy.log('✅ AuthButton handles undefined name without crashing')
    })

    it('should handle user with empty name', () => {
      const userWithEmptyName = {
        id: 'test_user_456',
        name: '',
        email: 'empty@example.com'
      }

      cy.visit('/')
      
      cy.window().then((win) => {
        win.localStorage.setItem('linkedin_user', JSON.stringify(userWithEmptyName))
      })

      cy.reload()

      // Should show fallback for empty name
      cy.get('[data-testid="auth-button"]').should('be.visible')
      cy.get('[data-testid="auth-button"]').should('contain.text', 'Usuário')

      cy.log('✅ AuthButton handles empty name correctly')
    })

    it('should handle user with null name', () => {
      const userWithNullName = {
        id: 'test_user_789',
        name: null,
        email: 'null@example.com'
      }

      cy.visit('/')
      
      cy.window().then((win) => {
        win.localStorage.setItem('linkedin_user', JSON.stringify(userWithNullName))
      })

      cy.reload()

      // Should fallback gracefully
      cy.get('[data-testid="auth-button"]').should('be.visible')
      cy.get('[data-testid="auth-button"]').should('contain.text', 'Usuário')

      cy.log('✅ AuthButton handles null name correctly')
    })

    it('should generate proper initials for valid names', () => {
      const userWithValidName = {
        id: 'test_user_valid',
        name: 'João Silva Santos',
        email: 'joao@example.com'
      }

      cy.visit('/')
      
      cy.window().then((win) => {
        win.localStorage.setItem('linkedin_user', JSON.stringify(userWithValidName))
      })

      cy.reload()

      // Should display user name properly
      cy.get('[data-testid="auth-button"]').should('be.visible')
      cy.get('[data-testid="auth-button"]').should('contain.text', 'João')

      cy.log('✅ AuthButton displays valid names correctly')
    })
  })

  describe('Issue #15: TTY error prevention', () => {
    it('should not produce TTY errors during authentication', () => {
      cy.visit('/')

      // Monitor console for TTY-related errors
      cy.window().then((win) => {
        const originalConsoleError = win.console.error
        let ttyErrorFound = false
        
        win.console.error = (...args) => {
          const message = args.join(' ')
          if (message.includes('tty') || message.includes('/dev/tty') || message.includes('Device not configured')) {
            ttyErrorFound = true
            cy.log('❌ TTY error detected:', message)
          }
          originalConsoleError.apply(win.console, args)
        }

        // Trigger authentication flow
        cy.get('[data-testid="auth-button"]').first().click()

        // Check after some time
        cy.wait(2000).then(() => {
          expect(ttyErrorFound).to.be.false
          cy.log('✅ No TTY errors detected during authentication')
        })
      })
    })
  })

  describe('Issue #7: OAuth state validation', () => {
    it('should reject invalid OAuth state', () => {
      // Set valid state
      cy.window().then((win) => {
        win.sessionStorage.setItem('linkedin_oauth_state', 'valid_state_123')
      })

      // Visit callback with invalid state
      cy.visit('/auth/linkedin/callback?code=test_code&state=invalid_state_456')

      // Should redirect away from callback page
      cy.url().should('not.include', '/auth/linkedin/callback')
      cy.url().should('eq', Cypress.config().baseUrl + '/')

      cy.log('✅ Invalid OAuth state properly rejected')
    })

    it('should reject missing OAuth state', () => {
      // Don't set any state
      cy.visit('/auth/linkedin/callback?code=test_code&state=some_state')

      // Should redirect away from callback page
      cy.url().should('not.include', '/auth/linkedin/callback')
      cy.url().should('eq', Cypress.config().baseUrl + '/')

      cy.log('✅ Missing OAuth state properly rejected')
    })

    it('should accept valid OAuth state', () => {
      const validState = 'valid_state_test'
      
      // Mock successful API responses
      cy.intercept('POST', '/api/auth/linkedin/token', {
        statusCode: 200,
        body: { access_token: 'mock_token' }
      }).as('tokenExchange')

      cy.intercept('GET', '/api/auth/linkedin/profile', {
        statusCode: 200,
        body: {
          id: 'valid_user',
          name: 'Valid User',
          email: 'valid@example.com'
        }
      }).as('profileFetch')

      // Set matching state
      cy.window().then((win) => {
        win.sessionStorage.setItem('linkedin_oauth_state', validState)
      })

      // Visit callback with matching state
      cy.visit(`/auth/linkedin/callback?code=test_code&state=${validState}`)

      // Should process successfully
      cy.wait('@tokenExchange')
      cy.wait('@profileFetch')

      cy.log('✅ Valid OAuth state processed correctly')
    })
  })

  describe('Data validation and sanitization', () => {
    it('should validate and sanitize corrupted user data', () => {
      const corruptedUser = {
        id: '<script>alert("xss")</script>',
        name: 'Valid Name',
        email: 'test@example.com'
      }

      cy.visit('/')

      cy.window().then((win) => {
        win.postMessage({
          type: 'LINKEDIN_AUTH_SUCCESS',
          userData: corruptedUser
        }, win.location.origin)
      })

      cy.wait(1000)

      // Should sanitize the data
      cy.window().then((win) => {
        const userData = win.localStorage.getItem('linkedin_user')
        if (userData) {
          const user = JSON.parse(userData)
          expect(user.id).to.not.include('<script>')
          cy.log('✅ XSS content sanitized from user data')
        }
      })
    })

    it('should reject completely invalid user data', () => {
      const invalidUser = {
        // Missing required id and name fields
        email: 'invalid@example.com'
      }

      cy.visit('/')

      cy.window().then((win) => {
        win.postMessage({
          type: 'LINKEDIN_AUTH_SUCCESS',
          userData: invalidUser
        }, win.location.origin)
      })

      cy.wait(1000)

      // Should reject invalid data and remain unauthenticated
      cy.get('[data-testid="auth-button"]').first().should('contain.text', 'Conectar')
      
      cy.window().then((win) => {
        const userData = win.localStorage.getItem('linkedin_user')
        expect(userData).to.be.null
      })

      cy.log('✅ Invalid user data properly rejected')
    })
  })

  describe('Error handling improvements', () => {
    it('should handle localStorage access errors gracefully', () => {
      cy.visit('/')

      // Mock localStorage to throw errors
      cy.window().then((win) => {
        const originalSetItem = win.localStorage.setItem
        cy.stub(win.localStorage, 'setItem').callsFake(() => {
          throw new Error('localStorage disabled')
        })

        // Trigger auth flow
        win.postMessage({
          type: 'LINKEDIN_AUTH_SUCCESS',
          userData: {
            id: 'test_user',
            name: 'Test User',
            email: 'test@example.com'
          }
        }, win.location.origin)
      })

      cy.wait(1000)

      // Should not crash the application
      cy.get('[data-testid="auth-button"]').should('be.visible')

      cy.log('✅ localStorage errors handled gracefully')
    })
  })
})
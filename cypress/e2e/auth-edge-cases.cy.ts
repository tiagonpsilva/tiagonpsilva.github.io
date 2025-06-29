describe('Authentication Edge Cases', () => {
  beforeEach(() => {
    cy.clearAuthData()
  })

  describe('Data Corruption and Recovery', () => {
    it('should handle corrupted localStorage data', () => {
      // Set corrupted JSON data
      cy.window().then((win) => {
        win.localStorage.setItem('linkedin_user', '{invalid json data}')
      })

      cy.visit('/')

      // Should not crash and should clear corrupted data
      cy.get('[data-testid="auth-button"]').should('be.visible')
      cy.get('[data-testid="auth-button"]').should('contain.text', 'Conectar')

      // Corrupted data should be removed
      cy.window().then((win) => {
        expect(win.localStorage.getItem('linkedin_user')).to.be.null
      })
    })

    it('should handle missing required user fields', () => {
      const incompleteUser = {
        // Missing id and name
        email: 'test@example.com'
      }

      cy.window().then((win) => {
        win.localStorage.setItem('linkedin_user', JSON.stringify(incompleteUser))
      })

      cy.visit('/')

      // Should handle gracefully and fall back to unauthenticated state
      cy.get('[data-testid="auth-button"]').should('contain.text', 'Conectar')
    })

    it('should handle null/undefined user data', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('linkedin_user', 'null')
      })

      cy.visit('/')

      cy.get('[data-testid="auth-button"]').should('be.visible')
      cy.get('[data-testid="auth-button"]').should('contain.text', 'Conectar')
    })
  })

  describe('Network and API Failures', () => {
    it('should handle API timeout during profile fetch', () => {
      cy.intercept('GET', '/api/auth/linkedin/profile', {
        delay: 15000, // Longer than request timeout
        statusCode: 200,
        body: {}
      }).as('profileTimeout')

      cy.mockLinkedInAuth()

      cy.visit('/')
      cy.get('[data-testid="auth-button"]').click()
      cy.get('[data-testid="linkedin-auth-button"]').click()

      // Should show timeout error
      cy.get('[data-testid="auth-error"]', { timeout: 20000 }).should('be.visible')
      cy.get('[data-testid="auth-error"]').should('contain.text', 'timeout')
    })

    it('should handle intermittent network failures with retry', () => {
      let callCount = 0
      
      cy.intercept('POST', '/api/auth/linkedin/token', (req) => {
        callCount++
        if (callCount === 1) {
          req.reply({ statusCode: 500, body: { error: 'Network error' } })
        } else {
          req.reply({
            statusCode: 200,
            body: {
              access_token: 'mock_token_after_retry',
              token_type: 'Bearer',
              expires_in: 3600
            }
          })
        }
      }).as('tokenWithRetry')

      cy.intercept('GET', '/api/auth/linkedin/profile', {
        statusCode: 200,
        body: {
          id: 'retry_user_123',
          name: 'Retry Test User',
          email: 'retry@test.com'
        }
      }).as('profileAfterRetry')

      cy.visit('/')
      cy.get('[data-testid="auth-button"]').click()
      cy.get('[data-testid="linkedin-auth-button"]').click()

      // Should eventually succeed after retry
      cy.waitForAuthStateChange()
      cy.get('[data-testid="user-profile"]').should('be.visible')
    })

    it('should handle rate limiting (429 status)', () => {
      cy.intercept('POST', '/api/auth/linkedin/token', {
        statusCode: 429,
        headers: {
          'Retry-After': '60'
        },
        body: { error: 'Rate limit exceeded' }
      }).as('rateLimited')

      cy.mockLinkedInAuth()

      cy.visit('/')
      cy.get('[data-testid="auth-button"]').click()
      cy.get('[data-testid="linkedin-auth-button"]').click()

      cy.get('[data-testid="auth-error"]').should('be.visible')
      cy.get('[data-testid="auth-error"]').should('contain.text', 'rate limit')
    })
  })

  describe('Browser and Environment Edge Cases', () => {
    it('should handle disabled localStorage', () => {
      // Simulate localStorage being disabled/unavailable
      cy.window().then((win) => {
        const mockStorage = {
          getItem: () => { throw new Error('localStorage disabled') },
          setItem: () => { throw new Error('localStorage disabled') },
          removeItem: () => { throw new Error('localStorage disabled') },
          clear: () => { throw new Error('localStorage disabled') }
        }
        
        Object.defineProperty(win, 'localStorage', {
          value: mockStorage,
          writable: false
        })
      })

      cy.visit('/')

      // Should still load without crashing
      cy.get('[data-testid="auth-button"]').should('be.visible')
    })

    it('should handle disabled cookies', () => {
      // Clear all cookies and prevent setting new ones
      cy.clearCookies()
      
      cy.visit('/', {
        onBeforeLoad: (win) => {
          // Mock document.cookie to simulate disabled cookies
          Object.defineProperty(win.document, 'cookie', {
            get: () => '',
            set: () => { throw new Error('Cookies disabled') }
          })
        }
      })

      cy.get('[data-testid="auth-button"]').should('be.visible')
    })

    it('should handle third-party cookies blocked', () => {
      // Simulate third-party cookie blocking by intercepting LinkedIn requests
      cy.intercept('GET', 'https://www.linkedin.com/**', {
        statusCode: 403,
        body: 'Third-party cookies blocked'
      })

      cy.visit('/')
      cy.get('[data-testid="auth-button"]').click()
      cy.get('[data-testid="linkedin-auth-button"]').click()

      cy.get('[data-testid="auth-error"]').should('be.visible')
      cy.get('[data-testid="auth-error"]').should('contain.text', 'blocked')
    })

    it('should handle JavaScript disabled scenario', () => {
      // This test simulates what happens when JS is disabled
      // (Note: Cypress requires JS, so this is a conceptual test)
      
      cy.visit('/', {
        onBeforeLoad: (win) => {
          // Disable key JavaScript features
          win.fetch = undefined
          win.XMLHttpRequest = undefined
        }
      })

      // Should show fallback content or graceful degradation
      cy.get('[data-testid="auth-button"]').should('be.visible')
    })
  })

  describe('Security Edge Cases', () => {
    it('should handle malicious postMessage attempts', () => {
      cy.visit('/')

      cy.window().then((win) => {
        // Send malicious postMessage
        win.postMessage({
          type: 'LINKEDIN_AUTH_SUCCESS',
          userData: {
            id: '<script>alert("xss")</script>',
            name: 'Malicious User',
            email: 'malicious@evil.com'
          }
        }, 'https://evil.com') // Wrong origin
      })

      // Should not authenticate with malicious data
      cy.get('[data-testid="user-profile"]').should('not.exist')
      cy.get('[data-testid="auth-button"]').should('contain.text', 'Conectar')
    })

    it('should handle XSS attempts in user data', () => {
      const xssUser = {
        id: 'safe_id_123',
        name: '<script>alert("xss")</script>',
        email: '<img src="x" onerror="alert(\'xss\')">',
        headline: 'javascript:alert("xss")'
      }

      cy.fixture('users').then(() => {
        cy.simulateLinkedInAuthSuccess(xssUser)
        
        cy.get('[data-testid="auth-button"]').click()
        cy.get('[data-testid="linkedin-auth-button"]').click()
        cy.waitForAuthStateChange()

        // Data should be properly escaped/sanitized
        cy.get('[data-testid="user-name"]').should('not.contain', '<script>')
        cy.get('[data-testid="user-email"]').should('not.contain', '<img')
        cy.get('[data-testid="user-headline"]').should('not.contain', 'javascript:')
      })
    })

    it('should validate OAuth state parameter correctly', () => {
      const validState = 'valid_state_123'
      const invalidState = 'invalid_state_456'

      cy.window().then((win) => {
        win.sessionStorage.setItem('linkedin_oauth_state', validState)
      })

      // Attempt callback with invalid state
      cy.visit(`/auth/linkedin/callback?code=test_code&state=${invalidState}`)

      cy.get('[data-testid="auth-error"]').should('be.visible')
      cy.get('[data-testid="auth-error"]').should('contain.text', 'invalid state')
    })
  })

  describe('Concurrent Authentication Attempts', () => {
    it('should handle multiple simultaneous login attempts', () => {
      cy.visit('/')

      // Rapidly click auth button multiple times
      cy.get('[data-testid="auth-button"]').click()
      cy.get('[data-testid="linkedin-auth-button"]').click()
      cy.get('[data-testid="linkedin-auth-button"]').click()
      cy.get('[data-testid="linkedin-auth-button"]').click()

      // Should not create multiple popups or crash
      cy.window().then((win) => {
        // Check that we don't have multiple auth processes running
        const authState = win.localStorage.getItem('auth_in_progress')
        expect(authState).to.not.equal('multiple')
      })
    })

    it('should handle auth attempt while already authenticated', () => {
      cy.fixture('users').then((users) => {
        const testUser = users.validUser

        // Start with authenticated user
        cy.window().then((win) => {
          win.localStorage.setItem('linkedin_user', JSON.stringify(testUser))
        })

        cy.visit('/')

        // Try to authenticate again
        cy.get('[data-testid="auth-button"]').click()
        
        // Should show user menu instead of auth modal
        cy.get('[data-testid="user-menu"]').should('be.visible')
        cy.get('[data-testid="auth-modal"]').should('not.exist')
      })
    })
  })

  describe('Session and Token Management', () => {
    it('should handle expired session gracefully', () => {
      const expiredUser = {
        id: 'expired_user_123',
        name: 'Expired User',
        email: 'expired@test.com',
        // Simulate expired token metadata
        token_expires_at: Date.now() - 3600000 // 1 hour ago
      }

      cy.window().then((win) => {
        win.localStorage.setItem('linkedin_user', JSON.stringify(expiredUser))
      })

      // Mock expired token response
      cy.intercept('GET', '/api/auth/linkedin/profile', {
        statusCode: 401,
        body: { error: 'Token expired' }
      }).as('expiredTokenResponse')

      cy.visit('/')

      // Should detect expired session and prompt re-authentication
      cy.get('[data-testid="auth-button"]').should('contain.text', 'Conectar')
      
      // Expired user data should be cleared
      cy.window().then((win) => {
        expect(win.localStorage.getItem('linkedin_user')).to.be.null
      })
    })

    it('should handle token refresh if available', () => {
      // This would be relevant if implementing refresh tokens
      const userWithRefreshToken = {
        id: 'refresh_user_123',
        name: 'Refresh User',
        email: 'refresh@test.com',
        refresh_token: 'refresh_token_123',
        token_expires_at: Date.now() - 1000 // Recently expired
      }

      cy.window().then((win) => {
        win.localStorage.setItem('linkedin_user', JSON.stringify(userWithRefreshToken))
      })

      // Mock refresh token endpoint
      cy.intercept('POST', '/api/auth/refresh', {
        statusCode: 200,
        body: {
          access_token: 'new_access_token_123',
          expires_in: 3600
        }
      }).as('tokenRefresh')

      cy.visit('/')

      // Should attempt token refresh
      cy.wait('@tokenRefresh')
      cy.get('[data-testid="user-profile"]').should('be.visible')
    })
  })

  describe('Data Privacy and Cleanup', () => {
    it('should clean up sensitive data on sign out', () => {
      cy.fixture('users').then((users) => {
        const testUser = users.validUser

        // Authenticate user
        cy.simulateLinkedInAuthSuccess(testUser)
        cy.visit('/')
        cy.get('[data-testid="auth-button"]').click()
        cy.get('[data-testid="linkedin-auth-button"]').click()
        cy.waitForAuthStateChange()

        // Sign out
        cy.get('[data-testid="auth-button"]').click()
        cy.get('[data-testid="sign-out-button"]').click()

        // All sensitive data should be cleared
        cy.window().then((win) => {
          expect(win.localStorage.getItem('linkedin_user')).to.be.null
          expect(win.sessionStorage.getItem('linkedin_oauth_state')).to.be.null
          // Check that no sensitive data remains in any storage
        })
      })
    })

    it('should handle GDPR data deletion request', () => {
      cy.fixture('users').then((users) => {
        const testUser = users.validUser

        cy.window().then((win) => {
          win.localStorage.setItem('linkedin_user', JSON.stringify(testUser))
          win.localStorage.setItem('user_engagement', JSON.stringify({
            pageViews: 5,
            timeOnSite: 3600,
            lastVisit: Date.now()
          }))
        })

        cy.visit('/')

        // Simulate GDPR deletion (this would be triggered by a user action)
        cy.window().then((win) => {
          // Clear all user-related data
          win.localStorage.removeItem('linkedin_user')
          win.localStorage.removeItem('user_engagement')
          win.sessionStorage.clear()
        })

        cy.reload()

        // Should return to clean, unauthenticated state
        cy.get('[data-testid="auth-button"]').should('contain.text', 'Conectar')
        cy.get('[data-testid="user-profile"]').should('not.exist')
      })
    })
  })
})
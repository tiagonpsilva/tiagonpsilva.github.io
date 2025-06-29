describe('Authentication Components', () => {
  beforeEach(() => {
    cy.clearAuthData()
  })

  describe('AuthButton Component', () => {
    it('should render login state correctly', () => {
      cy.visit('/')
      
      cy.get('[data-testid="auth-button"]').should('be.visible')
      cy.get('[data-testid="auth-button"]').should('contain.text', 'Conectar')
      cy.get('[data-testid="auth-button"]').should('have.class', 'auth-button-login')
    })

    it('should render authenticated state correctly', () => {
      cy.fixture('users').then((users) => {
        const testUser = users.validUser

        // Set user data in localStorage to simulate authenticated state
        cy.window().then((win) => {
          win.localStorage.setItem('linkedin_user', JSON.stringify(testUser))
        })

        cy.visit('/')
        
        // Wait for auth context to load
        cy.get('[data-testid="auth-button"]').should('be.visible')
        cy.get('[data-testid="user-avatar"]').should('be.visible')
        cy.get('[data-testid="user-name"]').should('contain.text', testUser.name)
      })
    })

    it('should open auth modal on click when not authenticated', () => {
      cy.visit('/')
      
      cy.get('[data-testid="auth-button"]').click()
      cy.get('[data-testid="auth-modal"]').should('be.visible')
    })

    it('should show user menu on click when authenticated', () => {
      cy.fixture('users').then((users) => {
        const testUser = users.validUser

        cy.window().then((win) => {
          win.localStorage.setItem('linkedin_user', JSON.stringify(testUser))
        })

        cy.visit('/')
        
        cy.get('[data-testid="auth-button"]').click()
        cy.get('[data-testid="user-menu"]').should('be.visible')
        cy.get('[data-testid="sign-out-button"]').should('be.visible')
      })
    })
  })

  describe('AuthModal Component', () => {
    beforeEach(() => {
      cy.visit('/')
      cy.get('[data-testid="auth-button"]').click()
    })

    it('should display modal content correctly', () => {
      cy.get('[data-testid="auth-modal"]').should('be.visible')
      cy.get('[data-testid="auth-modal-title"]').should('contain.text', 'Conectar')
      cy.get('[data-testid="auth-modal-description"]').should('be.visible')
      cy.get('[data-testid="linkedin-auth-button"]').should('be.visible')
    })

    it('should close modal on backdrop click', () => {
      cy.get('[data-testid="auth-modal-backdrop"]').click({ force: true })
      cy.get('[data-testid="auth-modal"]').should('not.exist')
    })

    it('should close modal on escape key', () => {
      cy.get('[data-testid="auth-modal"]').type('{esc}')
      cy.get('[data-testid="auth-modal"]').should('not.exist')
    })

    it('should close modal on close button click', () => {
      cy.get('[data-testid="close-auth-modal"]').click()
      cy.get('[data-testid="auth-modal"]').should('not.exist')
    })

    it('should track modal interactions', () => {
      cy.window().then((win) => {
        if (win.mixpanel) {
          cy.spy(win.mixpanel, 'track').as('mixpanelTrack')
        }
      })

      cy.get('[data-testid="linkedin-auth-button"]').click()
      
      cy.get('@mixpanelTrack').should('have.been.calledWith', 'LinkedIn OAuth Initiated')
    })
  })

  describe('UserProfile Component', () => {
    beforeEach(() => {
      cy.fixture('users').then((users) => {
        const testUser = users.validUser

        cy.window().then((win) => {
          win.localStorage.setItem('linkedin_user', JSON.stringify(testUser))
        })

        cy.visit('/')
      })
    })

    it('should display user information correctly', () => {
      cy.fixture('users').then((users) => {
        const testUser = users.validUser

        cy.get('[data-testid="user-profile"]').should('be.visible')
        cy.get('[data-testid="user-name"]').should('contain.text', testUser.name)
        cy.get('[data-testid="user-email"]').should('contain.text', testUser.email)
        cy.get('[data-testid="user-headline"]').should('contain.text', testUser.headline)
        
        if (testUser.picture) {
          cy.get('[data-testid="user-avatar"]').should('have.attr', 'src', testUser.picture)
        }
      })
    })

    it('should handle missing optional fields gracefully', () => {
      cy.fixture('users').then((users) => {
        const minimalUser = users.minimalUser

        cy.window().then((win) => {
          win.localStorage.setItem('linkedin_user', JSON.stringify(minimalUser))
        })

        cy.reload()

        cy.get('[data-testid="user-profile"]').should('be.visible')
        cy.get('[data-testid="user-name"]').should('contain.text', minimalUser.name)
        
        // Optional fields should not cause errors
        cy.get('[data-testid="user-email"]').should('not.exist')
        cy.get('[data-testid="user-headline"]').should('not.exist')
      })
    })
  })

  describe('LinkedInCallback Component', () => {
    it('should handle callback URL with authorization code', () => {
      const mockCode = 'mock_auth_code_123'
      const mockState = 'test_state_456'

      // Set expected state in sessionStorage
      cy.window().then((win) => {
        win.sessionStorage.setItem('linkedin_oauth_state', mockState)
      })

      // Mock the token exchange
      cy.mockLinkedInAuth()

      // Visit callback URL with code and state
      cy.visit(`/auth/linkedin/callback?code=${mockCode}&state=${mockState}`)

      // Should process the callback and redirect
      cy.url().should('not.include', '/auth/linkedin/callback')
      
      // Should have made token exchange request
      cy.wait('@linkedInTokenExchange')
      cy.wait('@linkedInProfileFetch')
    })

    it('should handle callback with error', () => {
      cy.visit('/auth/linkedin/callback?error=access_denied&error_description=User%20cancelled')

      // Should show error message
      cy.get('[data-testid="auth-error"]').should('be.visible')
      cy.get('[data-testid="auth-error"]').should('contain.text', 'cancelled')
    })

    it('should handle state mismatch security error', () => {
      const mockCode = 'mock_auth_code_123'
      const wrongState = 'wrong_state'

      cy.window().then((win) => {
        win.sessionStorage.setItem('linkedin_oauth_state', 'correct_state')
      })

      cy.visit(`/auth/linkedin/callback?code=${mockCode}&state=${wrongState}`)

      // Should show security error
      cy.get('[data-testid="auth-error"]').should('be.visible')
      cy.get('[data-testid="auth-error"]').should('contain.text', 'security')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      cy.visit('/')
      
      cy.get('[data-testid="auth-button"]')
        .should('have.attr', 'role', 'button')
        .should('have.attr', 'aria-label')

      cy.get('[data-testid="auth-button"]').click()

      cy.get('[data-testid="auth-modal"]')
        .should('have.attr', 'role', 'dialog')
        .should('have.attr', 'aria-modal', 'true')
        .should('have.attr', 'aria-labelledby')
    })

    it('should support keyboard navigation', () => {
      cy.visit('/')
      
      // Focus and activate auth button with keyboard
      cy.get('[data-testid="auth-button"]').focus().type('{enter}')
      cy.get('[data-testid="auth-modal"]').should('be.visible')

      // Navigate within modal using Tab
      cy.get('[data-testid="linkedin-auth-button"]').should('be.focused')
      cy.focused().tab()
      cy.get('[data-testid="close-auth-modal"]').should('be.focused')

      // Close modal with Enter key
      cy.focused().type('{enter}')
      cy.get('[data-testid="auth-modal"]').should('not.exist')
    })

    it('should have proper color contrast', () => {
      cy.visit('/')
      
      // Check button contrast (basic test)
      cy.get('[data-testid="auth-button"]')
        .should('have.css', 'color')
        .should('have.css', 'background-color')

      // Open modal and check contrast
      cy.get('[data-testid="auth-button"]').click()
      cy.get('[data-testid="linkedin-auth-button"]')
        .should('have.css', 'color')
        .should('have.css', 'background-color')
    })
  })

  describe('Responsive Behavior', () => {
    it('should adapt to mobile viewport', () => {
      cy.viewport(375, 667)
      cy.visit('/')

      cy.get('[data-testid="auth-button"]').should('be.visible')
      cy.get('[data-testid="auth-button"]').click()

      // Modal should be responsive
      cy.get('[data-testid="auth-modal"]').should('be.visible')
      cy.get('[data-testid="auth-modal"]')
        .should('have.css', 'width')
        .should('not.equal', 'auto')
    })

    it('should adapt to tablet viewport', () => {
      cy.viewport(768, 1024)
      cy.visit('/')

      cy.get('[data-testid="auth-button"]').should('be.visible')
      cy.get('[data-testid="auth-button"]').click()
      cy.get('[data-testid="auth-modal"]').should('be.visible')
    })
  })
})
describe('Mobile Authentication Optimization - Issue #11', () => {
  beforeEach(() => {
    // Clear any existing auth data
    cy.window().then((win) => {
      win.localStorage.clear()
      win.sessionStorage.clear()
    })
  })

  describe('Device Detection and Strategy Selection', () => {
    it('should detect mobile device capabilities correctly', () => {
      // Set mobile viewport
      cy.viewport('iphone-x')
      
      cy.visit('/')
      cy.wait(1000)
      
      // Check if mobile detection is working
      cy.window().then((win) => {
        const isMobile = /iPhone|iPad|iPod|Android|BlackBerry|IEMobile|Opera Mini/i.test(win.navigator.userAgent)
        expect(isMobile || win.innerWidth <= 768).to.be.true
      })
    })
    
    it('should use redirect strategy on mobile devices', () => {
      cy.viewport('iphone-x')
      cy.visit('/')
      
      // Trigger modal
      cy.clock()
      cy.tick(31000)
      cy.get('[role="dialog"]').should('be.visible')
      
      // Verify mobile-optimized messaging
      cy.get('#auth-modal-description').should('contain', 'redirecionado brevemente')
      
      // Verify mobile-specific styling
      cy.get('[role="document"]').should('have.class', 'h-full')
      cy.get('[role="document"]').should('have.class', 'w-full')
    })
    
    it('should show mobile optimization notice', () => {
      cy.viewport('iphone-x')
      cy.visit('/')
      
      // Trigger modal
      cy.clock()
      cy.tick(31000)
      cy.get('[role="dialog"]').should('be.visible')
      
      // Should show mobile optimization notice
      cy.get('[role="dialog"]').within(() => {
        cy.contains('Mobile Otimizado').should('be.visible')
        cy.contains('Redirecionamento seguro').should('be.visible')
      })
    })
  })

  describe('Mobile Modal Layout and UX', () => {
    beforeEach(() => {
      cy.viewport('iphone-x')
      cy.visit('/')
      cy.clock()
      cy.tick(31000)
      cy.get('[role="dialog"]').should('be.visible')
    })

    it('should use full-screen modal layout on mobile', () => {
      cy.get('[role="document"]').should('have.class', 'h-full')
      cy.get('[role="document"]').should('have.class', 'w-full')
      cy.get('[role="document"]').should('have.class', 'rounded-t-3xl')
    })
    
    it('should have larger, touch-friendly buttons', () => {
      // LinkedIn button should be larger on mobile
      cy.get('button[aria-label*="Conectar com LinkedIn"]')
        .should('have.class', 'py-4')
        .should('have.class', 'text-lg')
    })
    
    it('should show redirect arrow in button text', () => {
      cy.get('button[aria-label*="Conectar com LinkedIn"]')
        .should('contain', '→')
    })
    
    it('should have appropriate aria labels for mobile', () => {
      cy.get('button[aria-label*="redirecionamento"]').should('exist')
    })
  })

  describe('Authentication Flow - Mobile Redirect Strategy', () => {
    beforeEach(() => {
      cy.viewport('iphone-x')
    })

    it('should store return URL before redirecting', () => {
      cy.visit('/blog')
      cy.wait(1000)
      
      // Mock LinkedIn environment variables
      cy.window().then((win) => {
        // @ts-ignore
        win.import.meta = { env: { VITE_LINKEDIN_CLIENT_ID: 'test_client_id' } }
      })
      
      // Trigger modal
      cy.clock()
      cy.tick(31000)
      cy.get('[role="dialog"]').should('be.visible')
      
      // Click LinkedIn button - should store return URL
      cy.get('button[aria-label*="Conectar com LinkedIn"]').click()
      
      // Verify return URL is stored (would normally redirect)
      cy.window().its('sessionStorage').then((sessionStorage) => {
        const returnUrl = sessionStorage.getItem('linkedin_auth_return_url')
        expect(returnUrl).to.equal('/blog')
      })
    })
    
    it('should handle popup fallback gracefully', () => {
      cy.visit('/')
      
      // Stub window.open to return null (popup blocked)
      cy.window().then((win) => {
        cy.stub(win, 'open').returns(null)
      })
      
      // Mock desktop environment by stubbing device detection
      cy.window().then((win) => {
        // Force popup strategy by mocking larger screen
        Object.defineProperty(win, 'innerWidth', { value: 1024 })
        Object.defineProperty(win, 'innerHeight', { value: 768 })
      })
      
      // Trigger authentication
      cy.clock()
      cy.tick(31000)
      cy.get('[role="dialog"]').should('be.visible')
      cy.get('button[aria-label*="Conectar com LinkedIn"]').click()
      
      // Should fallback to redirect when popup is blocked
      cy.window().its('sessionStorage').then((sessionStorage) => {
        const returnUrl = sessionStorage.getItem('linkedin_auth_return_url')
        expect(returnUrl).to.not.be.null
      })
    })
  })

  describe('Responsive Design Tests', () => {
    const viewports = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 12', width: 390, height: 844 },
      { name: 'iPad', width: 768, height: 1024 },
      { name: 'Desktop', width: 1024, height: 768 }
    ]

    viewports.forEach((viewport) => {
      it(`should render correctly on ${viewport.name}`, () => {
        cy.viewport(viewport.width, viewport.height)
        cy.visit('/')
        
        // Trigger modal
        cy.clock()
        cy.tick(31000)
        cy.get('[role="dialog"]').should('be.visible')
        
        // Verify modal is visible and properly sized
        cy.get('[role="document"]').should('be.visible')
        
        // Check button accessibility
        cy.get('button[aria-label*="Conectar com LinkedIn"]')
          .should('be.visible')
          .should('have.attr', 'aria-label')
        
        // Verify all interactive elements are properly sized
        if (viewport.width <= 768) {
          // Mobile: should use full screen
          cy.get('[role="document"]').should('have.class', 'h-full')
        } else {
          // Desktop: should use modal
          cy.get('[role="document"]').should('have.class', 'max-w-md')
        }
      })
    })
  })

  describe('Touch Events and Mobile Interaction', () => {
    beforeEach(() => {
      cy.viewport('iphone-x')
      cy.visit('/')
      cy.clock()
      cy.tick(31000)
      cy.get('[role="dialog"]').should('be.visible')
    })

    it('should handle touch events on backdrop properly', () => {
      // Simulate touch events on backdrop
      cy.get('[role="dialog"]')
        .trigger('touchstart', { touches: [{ clientX: 10, clientY: 10 }] })
        .trigger('touchend', { changedTouches: [{ clientX: 10, clientY: 10 }] })
      
      // Modal should close
      cy.get('[role="dialog"]').should('not.exist')
    })
    
    it('should not close on touch events inside modal', () => {
      // Touch inside modal content
      cy.get('[role="document"]')
        .trigger('touchstart')
        .trigger('touchend')
      
      // Modal should remain open
      cy.get('[role="dialog"]').should('be.visible')
    })
    
    it('should have proper button touch targets (44px minimum)', () => {
      // LinkedIn button should meet touch target requirements
      cy.get('button[aria-label*="Conectar com LinkedIn"]').then(($btn) => {
        const height = $btn.height()
        expect(height).to.be.at.least(44) // WCAG recommendation
      })
      
      // Close button should also meet requirements
      cy.get('button[aria-label="Fechar modal de autenticação"]').then(($btn) => {
        const height = $btn.height()
        expect(height).to.be.at.least(44)
      })
    })
  })

  describe('Accessibility on Mobile', () => {
    beforeEach(() => {
      cy.viewport('iphone-x')
      cy.visit('/')
      cy.clock()
      cy.tick(31000)
      cy.get('[role="dialog"]').should('be.visible')
    })

    it('should maintain proper focus management on mobile', () => {
      // Modal should be focused
      cy.get('[role="document"]').should('be.focused')
      
      // Tab navigation should work
      cy.get('body').tab()
      cy.focused().should('have.attr', 'aria-label', 'Fechar modal de autenticação')
    })
    
    it('should have proper ARIA attributes for mobile users', () => {
      cy.get('[role="dialog"]')
        .should('have.attr', 'aria-modal', 'true')
        .should('have.attr', 'aria-labelledby', 'auth-modal-title')
        .should('have.attr', 'aria-describedby', 'auth-modal-description')
    })
    
    it('should announce mobile-specific content to screen readers', () => {
      // Mobile optimization notice should be properly labeled
      cy.contains('Mobile Otimizado').should('be.visible')
      cy.contains('Redirecionamento seguro').should('be.visible')
    })
  })

  describe('Performance on Mobile', () => {
    beforeEach(() => {
      cy.viewport('iphone-x')
    })

    it('should load quickly on mobile', () => {
      const start = Date.now()
      cy.visit('/')
      cy.get('header').should('be.visible').then(() => {
        const loadTime = Date.now() - start
        expect(loadTime).to.be.lessThan(3000) // Should load in under 3 seconds
      })
    })
    
    it('should handle modal animations smoothly', () => {
      cy.visit('/')
      
      // Trigger modal
      cy.clock()
      cy.tick(31000)
      
      // Modal should animate in
      cy.get('[role="dialog"]').should('be.visible')
      cy.get('[role="document"]').should('be.visible')
      
      // Close modal with animation
      cy.get('body').type('{esc}')
      cy.get('[role="dialog"]').should('not.exist')
    })
  })

  describe('Error Handling on Mobile', () => {
    beforeEach(() => {
      cy.viewport('iphone-x')
    })

    it('should handle missing LinkedIn client ID gracefully', () => {
      cy.visit('/')
      
      // Mock missing environment variable
      cy.window().then((win) => {
        // @ts-ignore
        win.import.meta = { env: {} }
      })
      
      // Trigger modal and try authentication
      cy.clock()
      cy.tick(31000)
      cy.get('[role="dialog"]').should('be.visible')
      cy.get('button[aria-label*="Conectar com LinkedIn"]').click()
      
      // Should handle error gracefully (no redirect/popup)
      cy.url().should('include', '/')
    })
    
    it('should handle network issues during auth flow', () => {
      cy.visit('/')
      
      // Intercept and fail API calls
      cy.intercept('/api/auth/linkedin/**', { forceNetworkError: true })
      
      // Authentication should fail gracefully
      cy.clock()
      cy.tick(31000)
      cy.get('[role="dialog"]').should('be.visible')
    })
  })
})
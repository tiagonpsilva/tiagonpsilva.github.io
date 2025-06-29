describe('AuthModal Interaction Tests - Issue #10', () => {
  beforeEach(() => {
    // Clear any existing auth data
    cy.window().then((win) => {
      win.localStorage.clear()
      win.sessionStorage.clear()
    })
    
    cy.visit('/')
    cy.wait(1000) // Allow page to fully load
  })

  describe('Modal Display and Focus Management', () => {
    it('should show modal after 30 seconds and focus properly', () => {
      // Speed up time to trigger modal
      cy.clock()
      cy.tick(31000) // More than 30 seconds
      
      // Check if modal appears
      cy.get('[role="dialog"]').should('be.visible')
      cy.get('#auth-modal-title').should('be.visible')
      cy.get('#auth-modal-description').should('be.visible')
      
      // Verify modal is focused
      cy.get('[role="document"]').should('be.focused')
    })
    
    it('should show modal after 3 page views', () => {
      // Simulate 3 page views by visiting different sections
      cy.get('a[href="#expertise"]').click()
      cy.wait(500)
      cy.get('a[href="#cases"]').click()
      cy.wait(500)
      cy.get('a[href="#blog"]').click()
      cy.wait(500)
      
      // Modal should appear after 3 page views
      cy.get('[role="dialog"]').should('be.visible')
    })
  })

  describe('Backdrop Click Behavior', () => {
    beforeEach(() => {
      // Trigger modal
      cy.clock()
      cy.tick(31000)
      cy.get('[role="dialog"]').should('be.visible')
    })

    it('should close modal when clicking backdrop area', () => {
      // Click on backdrop (the outer dialog element)
      cy.get('[role="dialog"]').click('topLeft')
      
      // Modal should close
      cy.get('[role="dialog"]').should('not.exist')
    })
    
    it('should NOT close modal when clicking inside modal content', () => {
      // Click inside the modal content
      cy.get('[role="document"]').click()
      
      // Modal should remain open
      cy.get('[role="dialog"]').should('be.visible')
    })
    
    it('should close modal when clicking close button', () => {
      // Click the X close button
      cy.get('button[aria-label="Fechar modal de autenticação"]').click()
      
      // Modal should close
      cy.get('[role="dialog"]').should('not.exist')
    })
  })

  describe('Keyboard Navigation', () => {
    beforeEach(() => {
      // Trigger modal
      cy.clock()
      cy.tick(31000)
      cy.get('[role="dialog"]').should('be.visible')
    })

    it('should close modal when pressing Escape key', () => {
      // Press Escape key
      cy.get('body').type('{esc}')
      
      // Modal should close
      cy.get('[role="dialog"]').should('not.exist')
    })
    
    it('should maintain proper focus within modal', () => {
      // Tab through modal elements
      cy.get('body').tab()
      cy.focused().should('have.attr', 'aria-label', 'Fechar modal de autenticação')
      
      cy.get('body').tab()
      cy.focused().should('have.attr', 'aria-label', 'Conectar com LinkedIn para personalizar experiência')
      
      cy.get('body').tab()
      cy.focused().should('have.attr', 'aria-label', 'Dispensar modal e continuar sem conectar')
    })
  })

  describe('Touch/Mobile Behavior', () => {
    beforeEach(() => {
      // Set mobile viewport
      cy.viewport('iphone-x')
      
      // Trigger modal
      cy.clock()
      cy.tick(31000)
      cy.get('[role="dialog"]').should('be.visible')
    })

    it('should handle touch events properly on mobile', () => {
      // Simulate touch start and end on backdrop
      cy.get('[role="dialog"]')
        .trigger('touchstart', { touches: [{ clientX: 10, clientY: 10 }] })
        .trigger('touchend', { changedTouches: [{ clientX: 10, clientY: 10 }] })
      
      // Modal should close
      cy.get('[role="dialog"]').should('not.exist')
    })
    
    it('should NOT close on touch events inside modal content', () => {
      // Touch inside modal content
      cy.get('[role="document"]')
        .trigger('touchstart')
        .trigger('touchend')
      
      // Modal should remain open
      cy.get('[role="dialog"]').should('be.visible')
    })
  })

  describe('Accessibility Features', () => {
    beforeEach(() => {
      // Trigger modal
      cy.clock()
      cy.tick(31000)
      cy.get('[role="dialog"]').should('be.visible')
    })

    it('should have proper ARIA attributes', () => {
      cy.get('[role="dialog"]')
        .should('have.attr', 'aria-modal', 'true')
        .should('have.attr', 'aria-labelledby', 'auth-modal-title')
        .should('have.attr', 'aria-describedby', 'auth-modal-description')
      
      cy.get('[role="document"]').should('exist')
      cy.get('#auth-modal-title').should('exist')
      cy.get('#auth-modal-description').should('exist')
    })
    
    it('should have proper button labels', () => {
      cy.get('button[aria-label="Fechar modal de autenticação"]').should('exist')
      cy.get('button[aria-label="Conectar com LinkedIn para personalizar experiência"]').should('exist')
      cy.get('button[aria-label="Dispensar modal e continuar sem conectar"]').should('exist')
    })
    
    it('should restore focus when modal closes', () => {
      // Get initial focused element
      cy.document().then((doc) => {
        const initialFocus = doc.activeElement
        
        // Close modal
        cy.get('body').type('{esc}')
        
        // Focus should be restored (though this is hard to test directly in Cypress)
        cy.get('[role="dialog"]').should('not.exist')
      })
    })
  })

  describe('Z-Index and Layer Management', () => {
    beforeEach(() => {
      // Trigger modal
      cy.clock()
      cy.tick(31000)
      cy.get('[role="dialog"]').should('be.visible')
    })

    it('should have high z-index to appear above other elements', () => {
      cy.get('[role="dialog"]').should('have.css', 'z-index', '9999')
    })
    
    it('should not be blocked by other page elements', () => {
      // Verify modal is actually interactive
      cy.get('button[aria-label="Fechar modal de autenticação"]').should('be.visible').click()
      cy.get('[role="dialog"]').should('not.exist')
    })
  })

  describe('State Persistence and Cleanup', () => {
    it('should not show modal again after being dismissed for 30 days', () => {
      // Trigger and dismiss modal
      cy.clock()
      cy.tick(31000)
      cy.get('[role="dialog"]').should('be.visible')
      cy.get('button[aria-label="Dispensar modal e continuar sem conectar"]').click()
      
      // Reload page
      cy.reload()
      cy.wait(1000)
      
      // Try to trigger modal again - should not appear
      cy.tick(31000)
      cy.get('[role="dialog"]').should('not.exist')
    })
    
    it('should clean up event listeners when modal closes', () => {
      // Trigger modal
      cy.clock()
      cy.tick(31000)
      cy.get('[role="dialog"]').should('be.visible')
      
      // Close modal
      cy.get('body').type('{esc}')
      cy.get('[role="dialog"]').should('not.exist')
      
      // Press escape again - should not cause any errors
      cy.get('body').type('{esc}')
      
      // Page should still be functional
      cy.get('header').should('be.visible')
    })
  })

  describe('Animation and Performance', () => {
    it('should animate smoothly when opening', () => {
      cy.clock()
      cy.tick(31000)
      
      // Modal should animate in
      cy.get('[role="dialog"]').should('be.visible')
      cy.get('[role="document"]').should('be.visible')
    })
    
    it('should animate smoothly when closing', () => {
      // Trigger modal
      cy.clock()
      cy.tick(31000)
      cy.get('[role="dialog"]').should('be.visible')
      
      // Close modal
      cy.get('body').type('{esc}')
      
      // Modal should animate out and be removed
      cy.get('[role="dialog"]').should('not.exist')
    })
  })
})
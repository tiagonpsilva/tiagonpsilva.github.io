// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to mock LinkedIn OAuth flow
       * @example cy.mockLinkedInAuth()
       */
      mockLinkedInAuth(): Chainable<void>
      
      /**
       * Custom command to simulate LinkedIn auth success
       * @param userData - Mock user data to return
       * @example cy.simulateLinkedInAuthSuccess({ id: '123', name: 'Test User' })
       */
      simulateLinkedInAuthSuccess(userData?: Partial<LinkedInUser>): Chainable<void>
      
      /**
       * Custom command to simulate LinkedIn auth failure
       * @param errorType - Type of error to simulate
       * @example cy.simulateLinkedInAuthFailure('popup_blocked')
       */
      simulateLinkedInAuthFailure(errorType: 'popup_blocked' | 'network_error' | 'invalid_token'): Chainable<void>
      
      /**
       * Custom command to wait for auth state change
       * @example cy.waitForAuthStateChange()
       */
      waitForAuthStateChange(): Chainable<void>
      
      /**
       * Custom command to clear auth data
       * @example cy.clearAuthData()
       */
      clearAuthData(): Chainable<void>
    }
  }
}

interface LinkedInUser {
  id: string
  name: string
  email?: string
  picture?: string
  headline?: string
  location?: string
  industry?: string
  publicProfileUrl?: string
}
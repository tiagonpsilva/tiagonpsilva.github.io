/// <reference types="cypress" />

// LinkedIn OAuth Mock Commands
Cypress.Commands.add('mockLinkedInAuth', () => {
  // Mock LinkedIn OAuth authorization endpoint
  cy.intercept('GET', 'https://www.linkedin.com/oauth/v2/authorization*', {
    statusCode: 200,
    body: '<!DOCTYPE html><html><body>LinkedIn Auth Mock</body></html>'
  }).as('linkedInAuthRequest')

  // Mock token exchange endpoint
  cy.intercept('POST', '/api/auth/linkedin/token', {
    statusCode: 200,
    body: {
      access_token: 'mock_access_token_123',
      token_type: 'Bearer',
      expires_in: 3600
    }
  }).as('linkedInTokenExchange')

  // Mock profile endpoint
  cy.intercept('GET', '/api/auth/linkedin/profile', {
    statusCode: 200,
    body: {
      id: 'test_user_123',
      name: 'Test User',
      email: 'test@example.com',
      headline: 'Software Engineer',
      location: 'São Paulo, Brazil',
      picture: 'https://media.licdn.com/dms/image/test/profile-pic',
      publicProfileUrl: 'https://linkedin.com/in/testuser'
    }
  }).as('linkedInProfileFetch')
})

Cypress.Commands.add('simulateLinkedInAuthSuccess', (userData = {}) => {
  const defaultUserData = {
    id: 'test_user_123',
    name: 'Test User',
    email: 'test@example.com',
    headline: 'Software Engineer',
    location: 'São Paulo, Brazil',
    picture: 'https://media.licdn.com/dms/image/test/profile-pic',
    publicProfileUrl: 'https://linkedin.com/in/testuser'
  }

  const mockUserData = { ...defaultUserData, ...userData }

  // Setup successful auth flow
  cy.mockLinkedInAuth()
  
  // Override profile endpoint with custom user data
  cy.intercept('GET', '/api/auth/linkedin/profile', {
    statusCode: 200,
    body: mockUserData
  }).as('linkedInProfileFetch')

  // Simulate the popup auth flow by directly posting the success message
  cy.window().then((win) => {
    // Simulate what the popup would send via postMessage
    setTimeout(() => {
      win.postMessage({
        type: 'LINKEDIN_AUTH_SUCCESS',
        userData: mockUserData
      }, win.location.origin)
    }, 1000)
  })
})

Cypress.Commands.add('simulateLinkedInAuthFailure', (errorType) => {
  cy.mockLinkedInAuth()

  switch (errorType) {
    case 'popup_blocked':
      // Mock window.open to return null (popup blocked)
      cy.window().then((win) => {
        cy.stub(win, 'open').returns(null)
      })
      break

    case 'network_error':
      // Mock network failure on token exchange
      cy.intercept('POST', '/api/auth/linkedin/token', {
        statusCode: 500,
        body: { error: 'Network error' }
      }).as('linkedInTokenExchangeError')
      break

    case 'invalid_token':
      // Mock invalid token response
      cy.intercept('GET', '/api/auth/linkedin/profile', {
        statusCode: 401,
        body: { error: 'Invalid token' }
      }).as('linkedInProfileError')
      break
  }
})

Cypress.Commands.add('waitForAuthStateChange', () => {
  // Wait for auth context to update
  cy.get('[data-testid="auth-status"]', { timeout: 10000 }).should('exist')
})

Cypress.Commands.add('clearAuthData', () => {
  cy.clearLocalStorage()
  cy.clearCookies()
  cy.window().then((win) => {
    win.sessionStorage.clear()
  })
})

// Custom command to check Mixpanel tracking
Cypress.Commands.add('verifyMixpanelEvent', (eventName: string) => {
  cy.window().then((win) => {
    // Check if Mixpanel is loaded and event was tracked
    expect(win.mixpanel).to.exist
    // Note: In a real implementation, you might want to stub mixpanel.track
    // and verify it was called with the correct parameters
  })
})

declare global {
  namespace Cypress {
    interface Chainable {
      verifyMixpanelEvent(eventName: string): Chainable<void>
    }
  }
}
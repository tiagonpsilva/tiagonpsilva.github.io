// Import commands.js using ES2015 syntax:
import './commands'

// Import global styles or themes
import '../../src/index.css'

import { mount } from 'cypress/react18'

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount
    }
  }
}

Cypress.Commands.add('mount', mount)
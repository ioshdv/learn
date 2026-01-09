# E-commerce E2E with Cypress

End-to-end (E2E) testing project for an E-commerce web application.
Includes Cypress test suites that validate critical user flows using QA Automation best practices.

### Purpose
Validate full business flows end-to-end in a stable, maintainable and repeatable way.

### Tech Stack
- Node.js
- Cypress 9.7.0
- cypress-file-upload
- @cypress/code-coverage
- JavaScript.

### Requirements
- Node.js 14+  
- npm

1. Installation

### Install Cypress:
npm install --save-dev cypress

### Install required plugins:
npm install --save-dev cypress-file-upload @cypress/code-coverage

2. Testing

### Execute tests using Cypress UI
npm run cypress:open

### Execute tests in headless mode
npm run test:e2e

### Available Scripts
npm run cypress:open
npm run cypress:run
npm run test:e2e

### Testing Strategy
- Page Object Model for UI abstraction
- Centralized selectors
- Critical user flow coverage
- Custom Commands for login and API setup
- End-to-End testing on running application

3. UI Testability Contract
### Main rule
The UI exposes dedicated test attributes (`data-cy`)
used by Cypress tests to interact with the application.

Examples:

data-cy="login-submit"
data-cy="add-to-cart"
data-cy="place-order"

This avoids dependency on:
- CSS classes
- IDs
- visible text
- DOM structure

4. Structure

.
├── cypress.json
├── cypress/
│   ├── integration/
│   ├── support/
│   │   ├── pageObjects/
│   │   ├── selectors.js
│   │   └── commands.js

5. Additional Notes
- Selectors are centralized in cypress/support/selectors.js
- baseUrl is configured in cypress.json
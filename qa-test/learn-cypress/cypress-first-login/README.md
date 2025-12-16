# Cypress - First Login Test

## Description
This repository contains the **first automation exercise with Cypress**, testing a **successful login flow** in the application.

**Test URL:** https://ecommerce-js-test.vercel.app/

The test automates:

1. Visit the main page.
2. Click on the **Login** link.
3. Fill in the login form with valid credentials.
4. Submit the form.
5. Verify that the **Products** page is visible after login.

### Best practices applied
- Use of **assertions** (should('be.visible')) to ensure elements are ready before interacting.
- Clear comments separated by **logical blocks**.
- Selection of elements using **stable selectors**.
- Clean project structure with consistent package.json and package-lock.json.
- Professional commit messages (chore: improve metadata, test: add first login test).

### Requirements
- Node.js installed
- Dependencies installed via npm install
- Cypress 15.7.1 (devDependency)

### Useful commands
Open Cypress UI (interactive mode): npx cypress open  
Run tests headless: npx cypress run

### Notes
This is the **first level** of Cypress practice, focused on a **basic login E2E test**.

### Project Structure
cypress-first-login/  
├── cypress/  
│   ├── e2e/  
│   │   └── hola.mundo.spec.cy.js  
│   └── support/  
├── package.json  
├── package-lock.json  
└── README.md

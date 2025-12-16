/// <reference types="cypress" /> // Enables Cypress types and autocomplete

describe('My first test', () => {

  it('should validate successful login', () => {

    // 1️⃣ Visit the website
    cy.visit('https://ecommerce-js-test.vercel.app/')

    // 2️⃣ Access the login form (with assertion)
    cy.get('a[href="/login"]')   // "Login" link
      .should('be.visible')      // Wait until it is visible
      .click()                   // Click on Login

    // 3️⃣ Fill in login credentials
    cy.get('#email')             // Email input
      .should('be.visible')
      .type('admin@example.com')

    cy.get('#password')          // Password input
      .should('be.visible')
      .type('adm123')

    // 4️⃣ Submit the login form
    cy.get('button[type="submit"]') // Submit button
      .should('be.visible')
      .click()

    // 5️⃣ Post-login validation
    cy.contains('Products')      // Element visible only after successful login
      .should('be.visible')

  })
})

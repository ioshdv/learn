import 'cypress-file-upload';
import '@cypress/code-coverage/support';
import { selectors } from './selectors';

Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get(selectors.login.email).clear().type(email);
  cy.get(selectors.login.password).clear().type(password);
  cy.get(selectors.login.submit).click();
});

Cypress.Commands.add('createUserAPI', ({ email, password }) => {
  return cy.request({
    method: 'POST',
    url: '/api/users',
    body: { email, password },
    failOnStatusCode: false
  });
});

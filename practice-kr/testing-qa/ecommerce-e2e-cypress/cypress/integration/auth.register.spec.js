import { selectors } from '../support/selectors';
import { uniqueEmail } from '../support/utils';

describe('User Registration', () => {
  it('registers a new user successfully', () => {
    const email = uniqueEmail('new');
    const password = 'Test1234!';

    cy.visit('/register');
    cy.get(selectors.register.email).type(email);
    cy.get(selectors.register.password).type(password);
    cy.get(selectors.register.confirmPassword).type(password);
    cy.get(selectors.register.submit).click();

    cy.get(selectors.register.success).should('be.visible');
  });

  it('shows error on duplicate email', () => {
    const email = uniqueEmail('dup');
    const password = 'Test1234!';

    cy.createUserAPI({ email, password }).then((res) => {
      expect([200, 201, 409]).to.include(res.status);
    });

    cy.visit('/register');
    cy.get(selectors.register.email).type(email);
    cy.get(selectors.register.password).type(password);
    cy.get(selectors.register.confirmPassword).type(password);
    cy.get(selectors.register.submit).click();

    cy.get(selectors.register.error).should('be.visible');
  });
});

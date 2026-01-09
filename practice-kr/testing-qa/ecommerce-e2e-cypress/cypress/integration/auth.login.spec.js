import { selectors } from '../support/selectors';
import { uniqueEmail } from '../support/utils';

describe('Login and Logout', () => {
  const password = 'Test1234!';
  let email;

  beforeEach(() => {
    email = uniqueEmail('login');
    cy.createUserAPI({ email, password }).then((res) => {
      expect([200, 201]).to.include(res.status);
    });
  });

  it('logs in successfully', () => {
    cy.login(email, password);
    cy.get(selectors.login.success).should('be.visible');
  });

  it('logs out and redirects', () => {
    cy.login(email, password);
    cy.get(selectors.nav.accountMenu).click();
    cy.get(selectors.nav.logoutBtn).click();
    cy.url().should('include', '/login');
  });
});

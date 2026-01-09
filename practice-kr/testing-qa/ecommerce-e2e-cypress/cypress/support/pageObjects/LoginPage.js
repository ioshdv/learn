import { selectors } from '../selectors';

export class LoginPage {
  visit() {
    cy.visit('/login');
  }

  fillEmail(email) {
    cy.get(selectors.login.email).clear().type(email);
  }

  fillPassword(password) {
    cy.get(selectors.login.password).clear().type(password);
  }

  submit() {
    cy.get(selectors.login.submit).click();
  }

  login(email, password) {
    this.fillEmail(email);
    this.fillPassword(password);
    this.submit();
  }
}

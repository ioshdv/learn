import { selectors } from '../selectors';

export class CheckoutPage {
  visit() {
    cy.visit('/checkout');
  }

  fillShipping({ fullName, address, city, zip }) {
    cy.get(selectors.checkout.fullName).clear().type(fullName);
    cy.get(selectors.checkout.address).clear().type(address);
    cy.get(selectors.checkout.city).clear().type(city);
    cy.get(selectors.checkout.zip).clear().type(zip);
  }

  placeOrder() {
    cy.get(selectors.checkout.submit).click();
  }

  assertConfirmationVisible() {
    cy.get(selectors.checkout.confirmation).should('be.visible');
  }
}

import { selectors } from '../selectors';

export class ProductPage {
  visit() {
    cy.visit('/products');
  }

  search(productName) {
    cy.get(selectors.products.searchInput).clear().type(productName);
  }

  addFirstResultToCart() {
    cy.get(selectors.products.productCard).first().within(() => {
      cy.get(selectors.products.addToCartBtn).click();
    });
  }

  openCart() {
    cy.get(selectors.cart.openCart).click();
  }

  goToCheckout() {
    cy.get(selectors.cart.checkoutBtn).click();
  }
}

import { LoginPage } from '../support/pageObjects/LoginPage';
import { ProductPage } from '../support/pageObjects/ProductPage';
import { CheckoutPage } from '../support/pageObjects/CheckoutPage';
import { uniqueEmail } from '../support/utils';

describe('Purchase Happy Path', () => {
  const loginPage = new LoginPage();
  const productPage = new ProductPage();
  const checkoutPage = new CheckoutPage();

  const password = 'Test1234!';
  const productToBuy = 'Laptop';

  let email;

  beforeEach(() => {
    email = uniqueEmail('buyer');
    cy.createUserAPI({ email, password }).then((res) => {
      expect([200, 201]).to.include(res.status);
    });
  });

  it('completes an order end-to-end', () => {
    loginPage.visit();
    loginPage.login(email, password);

    productPage.visit();
    productPage.search(productToBuy);
    productPage.addFirstResultToCart();
    productPage.openCart();
    productPage.goToCheckout();

    checkoutPage.fillShipping({
      fullName: 'Test Buyer',
      address: 'Fake Street 123',
      city: 'Santiago',
      zip: '8320000'
    });

    checkoutPage.placeOrder();
    checkoutPage.assertConfirmationVisible();
  });
});

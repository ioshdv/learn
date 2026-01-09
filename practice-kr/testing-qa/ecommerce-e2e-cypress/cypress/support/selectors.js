export const selectors = {
  nav: {
    accountMenu: '[data-cy=nav-account]',
    logoutBtn: '[data-cy=logout]'
  },
  register: {
    email: '[data-cy=register-email]',
    password: '[data-cy=register-password]',
    confirmPassword: '[data-cy=register-confirm-password]',
    submit: '[data-cy=register-submit]',
    error: '[data-cy=register-error]',
    success: '[data-cy=register-success]'
  },
  login: {
    email: '[data-cy=login-email]',
    password: '[data-cy=login-password]',
    submit: '[data-cy=login-submit]',
    success: '[data-cy=login-success]'
  },
  products: {
    searchInput: '[data-cy=product-search]',
    productCard: '[data-cy=product-card]',
    addToCartBtn: '[data-cy=add-to-cart]'
  },
  cart: {
    openCart: '[data-cy=open-cart]',
    checkoutBtn: '[data-cy=go-checkout]'
  },
  checkout: {
    fullName: '[data-cy=shipping-fullname]',
    address: '[data-cy=shipping-address]',
    city: '[data-cy=shipping-city]',
    zip: '[data-cy=shipping-zip]',
    submit: '[data-cy=place-order]',
    confirmation: '[data-cy=order-confirmation]'
  }
};

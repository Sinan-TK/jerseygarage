export const personalInfoEdit = Object.freeze({
  USER_NOT_FOUND: {
    code: 404,
    message: "User not found!",
  },
  PASSWORD_NOT_MATCH: {
    code: 401,
    message: "Invalid password!",
  },
  EMAIL_EXIST: {
    code: 409,
    message: "An account with this email already exists.",
  },
  EMAIL_CHANGE: {
    code: 200,
    message: "Email change",
    redirectToFrontend: "/user/email/otp-verify",
  },
});

export const addAddress = Object.freeze({
  ADDRESS_ADDED: {
    code: 201,
    message: "Address added successfully!!",
  },
});

export const editAddress = Object.freeze({
  ADDRESS_EDITED: {
    code: 201,
    message: "Address edited successfully!!",
  },
});

export const removeAddress = Object.freeze({
  REMOVED: {
    code: 201,
    message: "Address removed successfully!!",
  },
});

export const addWishlist = Object.freeze({
  ALREADY_EXIST: {
    code: 201,
    message: "Product removed from wishlist!!",
    data: false,
  },
  PRODUCT_ADDED: {
    code: 200,
    message: "Product added to wishlist!!",
    data: true,
  },
});

export const removeWishlist = Object.freeze({
  REMOVED: {
    code: 201,
    message: "Product removed from wishlist!!",
  },
});

export const buyNowRes = Object.freeze({
  NO_USER: {
    code: 400,
    message: "Login Required!",
  },
  INVALID: {
    code: 400,
    message: "Invalid Request!!",
  },
  SUCCESS: {
    code: 200,
    message: "Buy now successfull!!",
    redirectToFrontend: "/user/checkout",
  },
});

export const addToCart = Object.freeze({
  INVALID: {
    code: 400,
    message: "Invalid cart data",
  },
  // NO_VARIANT: {
  //   code: 404,
  //   message: "Variant not available",
  // },
  // SUCCESS: {
  //   code: 200,
  //   message: "Item added to cart",
  // },
});

export const cartQuantity = Object.freeze({
  INVALID: {
    code: 400,
    message: "Invalid quantity update request",
  },
  CART_NOT_FOUND: {
    code: 404,
    message: "Cart not found",
  },
  ITEM_NOT_FOUND: {
    code: 404,
    message: "Item not found in cart",
  },
  QUANTITY_ZERO: {
    code: 400,
    message: "Quantity can't be zero",
  },
  STOCK_OUT: {
    code: 400,
    message: "The stock is out!!",
  },
});

export const cartCheck = Object.freeze({
  EMPTY_CART: {
    code: 400,
    message: "Your cart is empty",
  },
  SUCCESS: {
    code: 200,
    message: "All items are in stock. Proceed to checkout.",
    redirectToFrontend: "/user/checkout",
  },
});

export const placeOrder = Object.freeze({
  EMPTY_CART: {
    code: 400,
    message: "Your cart is empty",
  },
  SUCCESS: {
    code: 200,
    message: "All items are in stock. Proceed to checkout.",
    redirectToFrontend: "/user/checkout",
  },
});
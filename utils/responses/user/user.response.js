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

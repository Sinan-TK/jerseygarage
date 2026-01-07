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

export const addWishlist = Object.freeze({
  ALREADY_EXIST: {
    code: 201,
    message: "Item already added!!",
  },
  
});

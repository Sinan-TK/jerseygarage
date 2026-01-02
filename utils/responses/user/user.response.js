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
  
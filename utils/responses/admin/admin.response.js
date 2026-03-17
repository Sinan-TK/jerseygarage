// utils/responses.js

export const adminLogin = Object.freeze({
  ADMIN_NOT_FOUND: {
    code: 404,
    message: "Admin not found!",
  },
  INVALID_PASSWORD: {
    code: 401,
    message: "Invalid password!",
  },
  LOGIN_SUCCESS: {
    code: 200,
    message: "Login successful!",
    redirectToFrontend: "/admin/dashboard",
  },
  OTP_GENERATED: {
    code: 200,
    message: "OTP generated!",
    redirectToFrontend: "/admin/verify-otp",
  },
});

export const userStatus = Object.freeze({
  USER_BLOCK: {
    code: 200,
    message: "User blocked successfully!",
  },
  USER_UNBLOCK: {
    code: 200,
    message: "user unblocked successfully!",
  },
});

export const dashboard = Object.freeze({
  INVALID_FILTER: {
    code: 400,
    message: "Invalid filter",
  },
  FUTURE_FROM: {
    code: 400,
    message: "From date cannot be in the future",
  },
  TO_FROM: {
    code: 400,
    message: "To date cannot be in the future",
  },
});

export const otpVerify = Object.freeze({
  DATA_NOT_FOUND: {
    code: 409,
    message: "Session expired. Please try again!",
  },
  OTP_EXPIRED: {
    code: 410,
    message: "OTP expired. Please resend OTP!",
    redirectToFrontend: "/admin/verify-otp",
  },
  INCORRECT_OTP: {
    code: 401,
    message: "Incorrect OTP. Please try again!",
  },
  NEWPASSWORD: {
    code: 200,
    message: "OTP verified successfully!",
    redirectToFrontend: "/admin/reset-password",
  },
});

export const resendOtp = Object.freeze({
  DATA_NOT_FOUND: {
    code: 409,
    message: "Session expired. Please try again!",
  },
  RESEND_OTP: {
    code: 200,
    message: "OTP resended successfully!",
  },
});

export const forgetPass = Object.freeze({
  NOT_FOUND: {
    code: 409,
    message: "No account found with this email!",
  },
  DATA_NOT_FOUND: {
    code: 409,
    message: "Session expired. Please try again!",
  },
  PASS_CHANGE: {
    code: 200,
    message: "Password changed successfully!",
    redirectToFrontend: "/admin/login",
  },
});

export const userRes = Object.freeze({
  INVALID: {
    code: 400,
    message: "Invalid request",
  },
  INVALID_ACTION: {
    code: 400,
    message: "Invalid action",
  },
  USER_NOT_FOUND: {
    code: 404,
    message: "User not found",
  },
  ALREADY_BLOCKED: {
    code: 400,
    message: "User is Already Blocked",
  },
});

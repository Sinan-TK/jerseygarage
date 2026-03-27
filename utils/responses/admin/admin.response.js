// utils/responses.js
import statusCode from "../../../constants/statusCode.js";

export const adminLogin = Object.freeze({
  ADMIN_NOT_FOUND: {
    code: statusCode.CLIENT.NOT_FOUND,
    message: "Admin not found!",
  },
  INVALID_PASSWORD: {
    code: statusCode.CLIENT.UNAUTHORIZED,
    message: "Invalid password!",
  },
  LOGIN_SUCCESS: {
    code: statusCode.SUCCESS.OK,
    message: "Login successful!",
    redirectToFrontend: "/admin/dashboard",
  },
  OTP_GENERATED: {
    code: statusCode.SUCCESS.OK,
    message: "OTP generated!",
    redirectToFrontend: "/admin/verify-otp",
  },
});

export const userStatus = Object.freeze({
  USER_BLOCK: {
    code: statusCode.SUCCESS.OK,
    message: "User blocked successfully!",
  },
  USER_UNBLOCK: {
    code: statusCode.SUCCESS.OK,
    message: "user unblocked successfully!",
  },
});

export const dashboard = Object.freeze({
  INVALID_FILTER: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Invalid filter",
  },
  FUTURE_FROM: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "From date cannot be in the future",
  },
  TO_FROM: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "To date cannot be in the future",
  },
});

export const otpVerify = Object.freeze({
  DATA_NOT_FOUND: {
    code: statusCode.CLIENT.CONFLICT,
    message: "Session expired. Please try again!",
  },
  OTP_EXPIRED: {
    code: 410,
    message: "OTP expired. Please resend OTP!",
    redirectToFrontend: "/admin/verify-otp",
  },
  INCORRECT_OTP: {
    code: statusCode.CLIENT.UNAUTHORIZED,
    message: "Incorrect OTP. Please try again!",
  },
  NEWPASSWORD: {
    code: statusCode.SUCCESS.OK,
    message: "OTP verified successfully!",
    redirectToFrontend: "/admin/reset-password",
  },
});

export const resendOtp = Object.freeze({
  DATA_NOT_FOUND: {
    code: statusCode.CLIENT.CONFLICT,
    message: "Session expired. Please try again!",
  },
  RESEND_OTP: {
    code: statusCode.SUCCESS.OK,
    message: "OTP resended successfully!",
  },
});

export const forgetPass = Object.freeze({
  NOT_FOUND: {
    code: statusCode.CLIENT.CONFLICT,
    message: "No account found with this email!",
  },
  DATA_NOT_FOUND: {
    code: statusCode.CLIENT.CONFLICT,
    message: "Session expired. Please try again!",
  },
  PASS_CHANGE: {
    code: statusCode.SUCCESS.OK,
    message: "Password changed successfully!",
    redirectToFrontend: "/admin/login",
  },
});

export const userRes = Object.freeze({
  INVALID: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Invalid request",
  },
  INVALID_ACTION: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Invalid action",
  },
  USER_NOT_FOUND: {
    code: statusCode.CLIENT.NOT_FOUND,
    message: "User not found",
  },
  ALREADY_BLOCKED: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "User is Already Blocked",
  },
});

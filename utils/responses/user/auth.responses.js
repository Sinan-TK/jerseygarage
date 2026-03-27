import statusCode from "../../../constants/statusCode.js";

export const loginUser = Object.freeze({
  USER_NOT_FOUND: {
    code: statusCode.CLIENT.NOT_FOUND,
    message: "User not found!",
  },
  PASSWORD_NOT_MATCH: {
    code: statusCode.CLIENT.UNAUTHORIZED,
    message: "Invalid password!",
  },
  USER_BLOCKED: {
    code: statusCode.CLIENT.FORBIDDEN,
    message: "Your account has been blocked. Please contact support.",
  },
  LOGIN: {
    code: statusCode.SUCCESS.OK,
    message: "Login successful!",
    redirectToFrontend: "/",
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
    redirectToFrontend: "/verify-otp",
  },
  INCORRECT_OTP: {
    code: statusCode.CLIENT.UNAUTHORIZED,
    message: "Incorrect OTP. Please try again!",
  },
  REGISTER: {
    code: statusCode.SUCCESS.OK,
    message: "Account created successfully!",
    redirectToFrontend: "/login",
  },
  NEWPASSWORD: {
    code: statusCode.SUCCESS.OK,
    message: "OTP verified successfully!",
    redirectToFrontend: "/newpassword",
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

export const registerLogic = Object.freeze({
  USER_FOUND: {
    code: statusCode.CLIENT.CONFLICT,
    message: "Email already registered!",
  },
  DATA_NOT_FOUND: {
    code: statusCode.CLIENT.CONFLICT,
    message: "Session expired. Please try again!",
  },
  INVALID_REF_CODE: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Invalid referral code",
  },
  ACCOUNT_CREATED: {
    code: statusCode.SUCCESS.OK,
    message: "OTP sended successfully!",
    redirectToFrontend: "/verify-otp",
  },
});

export const forgetPass = Object.freeze({
  NOT_FOUND: {
    code: statusCode.CLIENT.CONFLICT,
    message: "No account found with this email!",
  },
  OTP_GENERATED: {
    code: statusCode.SUCCESS.OK,
    message: "OTP generated!",
    redirectToFrontend: "/verify-otp",
  },
  PASS_CHANGE: {
    code: statusCode.SUCCESS.OK,
    message: "Password changed successfully!",
    redirectToFrontend: "/login",
  },
});

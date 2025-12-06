import bcrypt from "bcrypt";
import User from "../../models/userModel.js";
import Otp from "../../models/otpModel.js";
import otpGenerator from "otp-generator"; //remove
import sendOTP from "../../utils/sendOtp.js";
import { generateOtp } from "../../utils/GenerateOtp.js";
import * as Responses from "../../utils/responses/user/auth.responses.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { wrapAsync } from "../../utils/wrapAsync.js";
import * as userValidators from "../../validators/userValidators.js";
import { paginate } from "../../utils/pagination.js";

// ======================================================================
// 1. LOGIN PAGE
// ======================================================================

export const loginPage = wrapAsync((req, res) => {
  res.render("user/pages/login", {
    title: "Login",
    pageCSS: "login",
    showHeader: true,
    showFooter: true,
    pageJS: "login.js",
  });
});

// ======================================================================
// 2. GOOGLE AUTHENTICATION TRUE
// ======================================================================

export const googleCallback = wrapAsync((req, res) => {
  req.session.user = true;
  // User logged in successfully
  res.redirect("/");
});

// ======================================================================
// 3. USER LOGIN VERIFICATION
// ======================================================================

export const userVerification = wrapAsync(async (req, res) => {
  const { error } = userValidators.userSchema.validate(req.body);

  if (error) {
    return sendResponse(res, {
      code: 400,
      message: error.details[0].message,
    });
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return sendResponse(res, Responses.loginUser.USER_NOT_FOUND);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return sendResponse(res, Responses.loginUser.PASSWORD_NOT_MATCH);
  }

  // Store session
  req.session.user = {
    id: user._id,
    email: user.email,
  };

  return sendResponse(res, Responses.loginUser.LOGIN);
});

// ======================================================================
// 4. SIGNUP PAGE (EMAIL PAGE)
// ======================================================================

export const signUpPage = wrapAsync((req, res) => {
  res.render("user/pages/signup", {
    title: "Email SignUp",
    pageCSS: "signup",
    showHeader: true,
    showFooter: true,
    pageJS: "signup.js",
  });
});

// ======================================================================
// 5. USER SUBMITS EMAIL (SIGNUP) → GENERATE OTP
// ======================================================================

export const getEmail = wrapAsync(async (req, res) => {
  const { error } = userValidators.userMailSchema.validate(req.body);

  if (error) {
    return sendResponse(res, {
      code: 400,
      message: error.details[0].message,
    });
  }

  const { email } = req.body;

  console.log(email);

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return sendResponse(res, Responses.signupUserEmail.USER_FOUND);
  }

  await generateOtp(email, "signup", "SignUp OTP. ");

  req.session.tempEmail = email;
  req.session.otpPurpose = "signup";

  return sendResponse(res, Responses.signupUserEmail.EMAIL_OK);
});

// ======================================================================
// 6. RENDER OTP PAGE
// ======================================================================

export const renderOtpPage = wrapAsync((req, res) => {
  res.render("user/pages/otp-verify", {
    title: "OTP Verification",
    errorMessage: "",
    pageCSS: "otp-verify",
    showHeader: true,
    showFooter: true,
    pageJS: "otp-verify.js",
  });
});

// ======================================================================
// 7. VERIFY OTP (SIGNUP / FORGOT PASSWORD)
// ======================================================================

export const otpVerification = wrapAsync(async (req, res) => {
  const email = req.session.tempEmail;
  const purpose = req.session.otpPurpose;

  if (!email || !purpose) {
    return sendResponse(res, Responses.otpVerify.DATA_NOT_FOUND);
  }

  const { error } = userValidators.otpSchema.validate(req.body);

  if (error) {
    return sendResponse(res, {
      code: 400,
      message: error.details[0].message,
    });
  }

  const { otpValue } = req.body;
  console.log(otpValue);

  const otpDoc = await Otp.findOne({ email, purpose, is_used: false });

  if (!otpDoc) {
    return sendResponse(res, Responses.otpVerify.OTP_EXPIRED);
  }

  if (otpDoc.otp_code !== otpValue) {
    return sendResponse(res, Responses.otpVerify.INCORRECT_OTP);
  }

  otpDoc.is_used = true;
  await otpDoc.save();

  if (purpose === "signup") {
    return sendResponse(res, Responses.otpVerify.REGISTER);
  } else {
    return sendResponse(res, Responses.otpVerify.NEWPASSWORD);
  }
});

// ======================================================================
// 8. RESEND OTP
// ======================================================================

export const resendOtp = wrapAsync(async (req, res) => {
  const email = req.session.tempEmail;
  const purpose = req.session.otpPurpose;

  if (!email || !purpose) {
    return sendResponse(res, Responses.resendOtp.DATA_NOT_FOUND);
  }

  await generateOtp(email, purpose, "Resend OTP. ");

  return sendResponse(res, Responses.resendOtp.RESEND_OTP);
});

// ======================================================================
// 9. SHOW REGISTER PAGE
// ======================================================================

export const renderSignupDetails = wrapAsync((req, res) => {
  res.render("user/pages/register", {
    title: "Register",
    pageCSS: "register",
    showHeader: true,
    showFooter: true,
    pageJS: "register.js",
  });
});

// ======================================================================
// 10. SAVE NEW USER (FINAL REGISTER PAGE)
// ======================================================================

export const saveSignupDetails = wrapAsync(async (req, res) => {
  const email = req.session.tempEmail;

  if (!email) return sendResponse(res, Responses.registerLogic.DATA_NOT_FOUND);

  const { error } = userValidators.registerSchema.validate(req.body);

  if (error) {
    return sendResponse(res, {
      code: 400,
      message: error.details[0].message,
    });
  }

  const { fullName, password, confirmPassword } = req.body;

  const newUser = new User({
    full_name: fullName,
    email,
    password_hash: password,
  });

  await newUser.save();

  delete req.session.tempEmail;
  delete req.session.otpPurpose;

  return sendResponse(res, Responses.registerLogic.ACCOUNT_CREATED);
});

// ======================================================================
// 11. FORGET PASSWORD PAGE
// ======================================================================

export const renderForgetPasswordPage = wrapAsync((req, res) => {
  res.render("user/pages/signup", {
    title: "Forget Password",
    pageCSS: "signup",
    showHeader: true,
    showFooter: true,
    pageJS: "forgotpassword.js",
  });
});

// ======================================================================
// 12. EMAIL SUBMIT (FORGOT PASSWORD)
// ======================================================================

export const emailVerification = wrapAsync(async (req, res) => {
  const { error } = userValidators.emailCheck.validate(req.body);

  if (error) {
    return sendResponse(res, {
      code: 400,
      message: error.details[0].message,
    });
  }

  const { email } = req.body;
  console.log(email);

  const user = await User.findOne({ email });
  if (!user) return sendResponse(res, Responses.forgetPass.NOT_FOUND);

  await generateOtp(email, "forget_password", "Forget password OTP. ");

  req.session.tempEmail = email;
  req.session.otpPurpose = "forget_password";

  return sendResponse(res, Responses.forgetPass.OTP_GENERATED);
});

// ======================================================================
// 13. NEW PASSWORD PAGE
// ======================================================================

export const renderNewPassPage = (req, res) => {
  res.render("user/pages/newpassword", {
    title: "New Password",
    pageCSS: "newpassword",
    showHeader: true,
    showFooter: true,
    pageJS: "newpassword.js",
  });
};

// ======================================================================
// 14. UPDATE PASSWORD
// ======================================================================

export const newPassValidation = wrapAsync(async (req, res) => {
  const email = req.session.tempEmail;
  if (!email) return sendResponse(res, Responses.registerLogic.DATA_NOT_FOUND);

  const { error } = userValidators.newPassSchema.validate(req.body);

  if (error) {
    return sendResponse(res, {
      code: 400,
      message: error.details[0].message,
    });
  }

  const { password, confirmPassword } = req.body;

  const user = await User.findOne({ email });
  if (!user) return sendResponse(res, Responses.forgetPass.NOT_FOUND);

  user.password_hash = password;
  await user.save();

  delete req.session.tempEmail;
  delete req.session.otpPurpose;

  return sendResponse(res, Responses.forgetPass.PASS_CHANGE);
});

// ======================================================================
// 15.HOME PAGE
// ======================================================================

export const renderHomePage = wrapAsync((req, res) => {
  res.render("user/pages/home", {
    title: "Home",
    pageCSS: "home",
    showHeader: true,
    showFooter: true,
    pageJS: "",
  });
});

// ======================================================================
// 16.SHOP PAGE
// ======================================================================

export const renderShopPage = wrapAsync((req, res) => {
  res.render("user/pages/shop", {
    title: "Shop",
    pageCSS: "shop",
    showFooter: true,
    showHeader: true,
    pageJS: "",
  });
});

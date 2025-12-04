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

  await generateOtp(email, "signup");

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

  if (!otpValue) {
    return res.json({
      success: false,
      message: "Please enter the OTP!",
    });
  }

  const otpDoc = await Otp.findOne({ email, purpose, is_used: false });

  if (!otpDoc) {
    return res.json({
      success: false,
      message: "OTP expired. Please resend OTP!",
      toast: false,
    });
  }

  if (otpDoc.otp_code !== otpValue) {
    return res.json({
      success: false,
      message: "Incorrect OTP. Please try again!",
      toast: false,
    });
  }

  otpDoc.is_used = true;
  await otpDoc.save();

  if (purpose === "signup") {
    return res.json({
      success: true,
      message: "OTP verified successfully!",
      redirect: "/register",
    });
  } else {
    return res.json({
      success: true,
      message: "OTP verified successfully!",
      redirect: "/newpassword",
    });
  }
});

// ======================================================================
// 8. RESEND OTP
// ======================================================================

export const resendOtp = async (req, res) => {
  try {
    const email = req.session.tempEmail;
    const purpose = req.session.otpPurpose;

    if (!email || !purpose) {
      return res.json({
        success: false,
        message: "Session expired. Please try again!",
        toast: true,
      });
    }

    const otp = otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    console.log("Resent OTP:", otp);

    await Otp.deleteMany({ email, purpose });
    await Otp.create({ email, otp_code: otp, purpose });

    await sendOTP(email, otp, "Resend OTP");

    return res.json({
      success: true,
      message: "OTP resended successfully!",
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

// ======================================================================
// 9. SHOW REGISTER PAGE
// ======================================================================

export const renderSignupDetails = (req, res) => {
  res.render("user/pages/register", {
    title: "Register",
    pageCSS: "register",
    showHeader: true,
    showFooter: true,
    error: "",
    pageJS: "register.js",
  });
};

// ======================================================================
// 10. SAVE NEW USER (FINAL REGISTER PAGE)
// ======================================================================

export const saveSignupDetails = async (req, res) => {
  try {
    const { fullName, password, confirmPassword } = req.body;
    console.log(
      `fullname:${fullName},password:${password},conform password:${confirmPassword}`
    );
    const email = req.session.tempEmail;

    if (!email) {
      return res.json({
        success: false,
        message: "Session expired. Please try again!",
        toast: true,
      });
    }

    if (!fullName || !password || !confirmPassword) {
      return res.json({
        success: false,
        message: "All fields are required!",
      });
    }

    if (password !== confirmPassword) {
      return res.json({
        success: false,
        message: "Passwords do not match!",
      });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.json({
        success: false,
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number & special character.",
      });
    }

    const newUser = new User({
      full_name: fullName,
      email,
      password_hash: password, // raw → pre-save hook will hash
    });

    await newUser.save();

    delete req.session.tempEmail;
    delete req.session.otpPurpose;

    return res.json({
      success: true,
      message: "Account Created Successfully!",
    });
    return res.redirect("/login");
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

// ======================================================================
// 11. FORGET PASSWORD PAGE
// ======================================================================

export const renderForgetPasswordPage = (req, res) => {
  res.render("user/pages/signup", {
    title: "Forget Password",
    pageCSS: "signup",
    showHeader: true,
    showFooter: true,
    error: "",
    pageJS: "forgotpassword.js",
  });
};

// ======================================================================
// 12. EMAIL SUBMIT (FORGOT PASSWORD)
// ======================================================================

export const emailVerification = async (req, res) => {
  try {
    const { email } = req.body;

    console.log(email);

    if (!email) {
      return res.json({
        success: false,
        message: "Email is required!",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        message: "No account found with this email!",
      });
    }

    const otp = otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    console.log("Generated OTP:", otp);

    await Otp.deleteMany({ email, purpose: "forget_password" });

    await Otp.create({
      email,
      otp_code: otp,
      purpose: "forget_password",
    });

    req.session.tempEmail = email;
    req.session.otpPurpose = "forget_password";

    await sendOTP(email, otp, "Forgot Password OTP");

    return res.json({
      success: true,
      message: "OTP generated!",
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

// ======================================================================
// 13. NEW PASSWORD PAGE
// ======================================================================

export const renderNewPassPage = (req, res) => {
  res.render("user/pages/newpassword", {
    title: "New Password",
    pageCSS: "newpassword",
    showHeader: true,
    showFooter: true,
    error: "",
  });
};

// ======================================================================
// 14. UPDATE PASSWORD
// ======================================================================

export const newPassValidation = async (req, res) => {
  try {
    const email = req.session.tempEmail;
    if (!email) return res.redirect("/forgotpassword");

    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.render("user/pages/newpassword", {
        title: "New Password",
        pageCSS: "newpassword",
        showHeader: true,
        showFooter: true,
        error: "All fields are required",
      });
    }

    if (password !== confirmPassword) {
      return res.render("user/pages/newpassword", {
        title: "New Password",
        pageCSS: "newpassword",
        showHeader: true,
        showFooter: true,
        error: "Passwords do not match",
      });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.render("user/pages/newpassword", {
        title: "New Password",
        pageCSS: "newpassword",
        showHeader: true,
        showFooter: true,
        error:
          "Password must be at least 8 characters and include uppercase, lowercase, number & special character.",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.render("user/pages/newpassword", {
        title: "New Password",
        pageCSS: "newpassword",
        showHeader: true,
        showFooter: true,
        error: "User not found",
      });
    }

    user.password_hash = password; // raw → pre-save will hash
    await user.save();

    delete req.session.tempEmail;
    delete req.session.otpPurpose;

    return res.redirect("/login");
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

// ======================================================================
// 15.HOME PAGE
// ======================================================================

export const renderHomePage = (req, res) => {
  res.render("user/pages/home", {
    title: "Home",
    pageCSS: "home",
    showHeader: true,
    showFooter: true,
    pageJS: "",
  });
};

// ======================================================================
// 16.SHOP PAGE
// ======================================================================

export const renderShopPage = (req, res) => {
  res.render("user/pages/shop", {
    title: "Shop",
    pageCSS: "shop",
    showFooter: true,
    showHeader: true,
    pageJS: "",
  });
};

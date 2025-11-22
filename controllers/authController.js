
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const Otp = require("../models/otpModel");
const otpGenerator = require("otp-generator");


// ======================================================================
// 1. LOGIN PAGE
// ======================================================================

const loginPage = (req, res) => {
  res.render("user/pages/login", {
    title: "Login",
    error: "",
    pageCSS: "login",
    showHeader: true,
    showFooter: true,
    pageJS: "login.js",
  });
};

// ======================================================================
// 2. GOOGLE AUTHENTICATION TRUE 
// ======================================================================

const googleCallback = (req, res) => {
  // User logged in successfully
  res.redirect("/");
};

// ======================================================================
// 2. USER LOGIN VERIFICATION
// ======================================================================

const userVerification = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({
        success: false,
        message: "Please enter both email and password.",
      });
    }

    const user = await User.findOne({ email });
    console.log(user);

    if (!user) {
      return res.json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Store session
    req.session.userId = user._id;

    return res.json({
      success: true,
      message: "Login successful!",
    });
  } catch (err) {
    console.log(err);
    return res.json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// ======================================================================
// 3. SIGNUP PAGE (EMAIL PAGE)
// ======================================================================

const signUpPage = (req, res) => {
  res.render("user/pages/signup", {
    title: "Email SignUp",
    pageCSS: "signup",
    showHeader: true,
    showFooter: true,
    error: "",
    pageJS: "signup.js",
  });
};

// ======================================================================
// 4. USER SUBMITS EMAIL (SIGNUP) → GENERATE OTP
// ======================================================================

const getEmail = async (req, res) => {
  try {
    const { email } = req.body;

    console.log(email);

    if (!email) {
      return res.json({
        success: false,
        message: "Email is required!",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.json({
        success: false,
        message: "Enter a valid email address!",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.json({
        success: false,
        message: "Email already registered!",
      });
    }

    const otp = otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    console.log("Generated OTP:", otp);

    await Otp.deleteMany({ email, purpose: "signup" });

    await Otp.create({
      email,
      otp_code: otp,
      purpose: "signup",
    });

    req.session.tempEmail = email;
    req.session.otpPurpose = "signup";

    // return res.redirect("/verify-otp");
    return res.json({
      success: true,
      message: "OTP sended successfully!",
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

// ======================================================================
// 5. RENDER OTP PAGE
// ======================================================================

const renderOtpPage = (req, res) => {
  res.render("user/pages/otp-verify", {
    title: "OTP Verification",
    errorMessage: "",
    pageCSS: "otp-verify",
    showHeader: true,
    showFooter: true,
    pageJS: "otp-verify.js",
  });
};

// ======================================================================
// 6. VERIFY OTP (SIGNUP / FORGOT PASSWORD)
// ======================================================================

const otpVerification = async (req, res) => {
  try {
    const { otpValue } = req.body;
    const email = req.session.tempEmail;
    const purpose = req.session.otpPurpose;
    console.log(otpValue);

    if (!otpValue) {
      return res.json({
        success: false,
        message: "Please enter the OTP!",
      });
    }

    if (!email || !purpose) {
      return res.json({
        success: false,
        message: "Session expired. Please try again!",
        toast: true,
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

    return res.json({
      success: true,
      message: "OTP verified successfully!",
      purpose,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

// ======================================================================
// 7. RESEND OTP
// ======================================================================

const resendOtp = async (req, res) => {
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
// 8. SHOW REGISTER PAGE
// ======================================================================

const renderSignupDetails = (req, res) => {
  res.render("user/pages/register", {
    title: "Register",
    pageCSS: "register",
    showHeader: true,
    showFooter: true,
    error: "",
    pageJS:"register.js"
  });
};

// ======================================================================
// 9. SAVE NEW USER (FINAL REGISTER PAGE)
// ======================================================================

const saveSignupDetails = async (req, res) => {
  try {
    const { fullName, password, confirmPassword } = req.body;
    console.log(`fullname:${fullName},password:${password},conform password:${confirmPassword}`);
    const email = req.session.tempEmail;

    if (!email){
      return res.json({
        success:false,
        message:"Session expired. Please try again!",
        toast: true,
      });
    } 

    if (!fullName || !password || !confirmPassword) {
      return res.json({
        success:false,
        message:"All fields are required!"
      });
    }

    if (password !== confirmPassword) {
      return res.json({
        success:false,
        message:"Passwords do not match!"
      });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.json({
        success:false,
        message:"Password must be at least 8 characters and include uppercase, lowercase, number & special character."
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
      success:true,
      message:"Account Created Successfully!"
    })
    return res.redirect("/login");
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

// ======================================================================
// 10. FORGET PASSWORD PAGE
// ======================================================================

const renderForgetPasswordPage = (req, res) => {
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
// 11. EMAIL SUBMIT (FORGOT PASSWORD)
// ======================================================================

const emailVerification = async (req, res) => {
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
// 12. NEW PASSWORD PAGE
// ======================================================================

const renderNewPassPage = (req, res) => {
  res.render("user/pages/newpassword", {
    title: "New Password",
    pageCSS: "newpassword",
    showHeader: true,
    showFooter: true,
    error: "",
  });
};

// ======================================================================
// 13. UPDATE PASSWORD
// ======================================================================

const newPassValidation = async (req, res) => {
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
// HOME PAGE
// ======================================================================

const renderHomePage = (req, res) => {
  res.render("user/pages/home", {
    title: "Home",
    pageCSS: "home",
    showHeader: true,
    showFooter: true,
    pageJS: "",
  });
};

// ======================================================================
// SHOP PAGE
// ======================================================================

const renderShopPage = (req, res) => {
  res.render("user/pages/shop", {
    title: "Shop",
    pageCSS: "shop",
    showFooter: true,
    showHeader: true,
    pageJS: "",
  });
};

// ======================================================================
// EXPORT ALL
// ======================================================================

module.exports = {
  loginPage,
  googleCallback,
  userVerification,
  signUpPage,
  getEmail,
  renderOtpPage,
  otpVerification,
  resendOtp,
  renderSignupDetails,
  saveSignupDetails,
  renderHomePage,
  renderForgetPasswordPage,
  emailVerification,
  renderNewPassPage,
  newPassValidation,
  renderShopPage,
};

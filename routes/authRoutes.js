const router = require("express").Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const passport = require("passport");

router.use((req, res, next) => {
  res.locals.layout = "user/layouts/layout";
  next();
});

router.get("/google",passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback",passport.authenticate("google", { failureRedirect: "/login" }),authController.googleCallback);

router.get("/google",passport.authenticate("google", { scope: ["profile", "email"] }));

router.get('/login' ,authMiddleware.isLoggedIn , authController.loginPage);

router.post('/login',authController.userVerification);

router.get('/signup',authMiddleware.isLoggedIn ,authController.signUpPage);

router.post('/signup', authController.getEmail);

router.get('/verify-otp',authMiddleware.isMailFound ,authController.renderOtpPage);

router.post('/verify-otp', authController.otpVerification);

router.post('/resend-otp', authController.resendOtp);

router.get('/register',authMiddleware.isMailFound, authController.renderSignupDetails);

router.post('/register',authController.saveSignupDetails);

router.get('/', authController.renderHomePage);

router.get('/forgotpassword',authMiddleware.isLoggedIn ,authController.renderForgetPasswordPage);

router.post('/forgotpassword',authController.emailVerification);

router.get('/newpassword',authMiddleware.isMailFound ,authController.renderNewPassPage);

router.post('/newpassword',authController.newPassValidation);

router.get('/shop',authController.renderShopPage);

module.exports = router;

import express from "express";
import * as authController from "../controllers/user/authController.js";
import * as authMiddleware from "../middlewares/authMiddleware.js";
import passport from "passport";

const router = express.Router();

router.use(authMiddleware.userLayout);

// CHECK THE SESSION.USER

router.use(authMiddleware.profileIcon);

router.get("/google",authMiddleware.isLoggedIn,passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback",authMiddleware.isLoggedIn,passport.authenticate("google", { failureRedirect: "/login" }),authController.googleCallback);

router.get('/login' ,authMiddleware.isLoggedIn , authController.loginPage);

router.post('/login',authController.userVerification);

router.get('/signup',authMiddleware.isLoggedIn,authMiddleware.isMailFound,authController.signUpPage);

router.post('/signup', authController.getEmail);

router.get('/verify-otp', authMiddleware.noMailFound ,authController.renderOtpPage);

router.post('/verify-otp', authController.otpVerification);

router.post('/resend-otp', authController.resendOtp);

router.get('/register',authMiddleware.isMailFound, authController.renderSignupDetails);

router.post('/register',authController.saveSignupDetails);

router.get('/forgotpassword',authMiddleware.isLoggedIn ,authController.renderForgetPasswordPage);

router.post('/forgotpassword',authController.emailVerification);

router.get('/newpassword',authMiddleware.isMailFound ,authController.renderNewPassPage);

router.post('/newpassword',authController.newPassValidation);

router.get('/', authController.renderHomePage);

router.get('/shop',authController.renderShopPage);

router.get('/product/:id',authController.productDetailPage);

export default router;
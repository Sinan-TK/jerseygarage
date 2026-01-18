import express from "express";
import * as authController from "../controllers/user/authController.js";
import * as authMiddleware from "../middlewares/authMiddleware.js";
import * as userMiddleware from "../middlewares/userMiddleware.js";
import { sidebarData } from "../middlewares/sidebarMiddleware.js";
import { userLayout } from "../middlewares/layoutMiddleware.js";
import { checkBlockedUser } from "../middlewares/userBlockMiddleware.js";
import passport from "passport";

const router = express.Router();

router.use(userLayout);

router.use(sidebarData);

router.use(checkBlockedUser);

router.use(userMiddleware.cartItemsCount);

router.use(authMiddleware.profileIcon);

router.get("/google",authMiddleware.isLoggedIn,passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback",authMiddleware.isLoggedIn,passport.authenticate("google", { failureRedirect: "/login" }),authController.googleCallback);

router.get('/login' ,authMiddleware.isLoggedIn , authController.loginPage);

router.post('/login',authMiddleware.isLoggedIn,authController.userVerification);

router.get('/signup',authMiddleware.isLoggedIn,authMiddleware.isMailFound,authController.signUpPage);

router.post('/signup',authMiddleware.isLoggedIn, authController.getEmail);

router.get('/register',authMiddleware.isLoggedIn,authMiddleware.isMailFound, authController.renderSignupDetails);

router.post('/register',authMiddleware.isLoggedIn,authController.saveSignupDetails);

router.get('/forgotpassword',authMiddleware.isLoggedIn ,authController.renderForgetPasswordPage);

router.post('/forgotpassword',authMiddleware.isLoggedIn ,authController.emailVerification);

router.get('/verify-otp', authMiddleware.noMailFound ,authController.renderOtpPage);

router.post('/verify-otp', authMiddleware.noMailFound,authController.otpVerification);

router.post('/resend-otp', authMiddleware.noMailFound,authController.resendOtp);

router.get('/newpassword',authMiddleware.isMailFound ,authController.renderNewPassPage);

router.post('/newpassword',authController.newPassValidation);

router.get('/', authController.renderHomePage);

router.get('/shop',authController.renderShopPage);

router.get('/product/:id',authController.productDetailPage);

export default router;
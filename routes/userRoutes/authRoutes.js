import express from "express";
import passport from "passport";
import * as authController from "../../controllers/user/authController.js";
import * as authMiddleware from "../../middlewares/authMiddleware.js";
import * as userMiddleware from "../../middlewares/userMiddleware.js";

const router = express.Router();

router.use(authMiddleware.userLayout);

router.use(authMiddleware.sidebarData);

router.use(authMiddleware.checkBlockedUser);

router.use(userMiddleware.cartItemsCount);

router.use(authMiddleware.profileIcon);

router.get(
  "/google",
  authMiddleware.isLoggedIn,
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  authMiddleware.isLoggedIn,
  passport.authenticate("google", { failureRedirect: "/login" }),
  authController.googleCallback,
);

router.get("/login", authMiddleware.isLoggedIn, authController.loginPage);

router.post(
  "/login",
  authMiddleware.isLoggedIn,
  authController.userVerification,
);

router.get("/signup", authMiddleware.isLoggedIn, authController.signUpPage);

router.post(
  "/signup",
  authMiddleware.isLoggedIn,
  authController.signupVerification,
);

router.get(
  "/forgotpassword",
  authMiddleware.isLoggedIn,
  authController.renderForgetPasswordPage,
);

router.post(
  "/forgotpassword",
  authMiddleware.isLoggedIn,
  authController.emailVerification,
);

router.get(
  "/verify-otp",
  authMiddleware.noMailFound,
  authController.renderOtpPage,
);

router.post(
  "/verify-otp",
  authMiddleware.noMailFound,
  authController.otpVerification,
);

router.post(
  "/resend-otp",
  authMiddleware.noMailFound,
  authController.resendOtp,
);

router.get(
  "/newpassword",
  authMiddleware.noMailFound,
  authController.renderNewPassPage,
);

router.post("/newpassword", authController.newPassValidation);

router.get("/", authController.renderHomePage);

router.get("/shop", authController.renderShopPage);

router.get("/shop/data", authController.shopPageProducts);

router.get(
  "/product/:id",
  authMiddleware.productNotFound,
  authController.productDetailPage,
);

router.get("/about", authController.aboutPage);

router.get("/contact", authController.contactPage);

router.get("/privacy-policy", authController.privacyPage);

router.get("/terms-conditions", authController.termsPage);

router.get("/return-cancellation-policy", authController.returnPolicy);

router.get("/faqs", authController.faqPage);

export default router;

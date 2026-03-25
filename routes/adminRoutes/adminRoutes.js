import express from "express";
import * as adminController from "../../controllers/admin/adminController.js";
import * as adminMiddleware from "../../middlewares/admin/adminMiddleware.js";
import * as authMiddleware from "../../middlewares/admin/authMiddleware.js";
import adminUserRoutes from "./userRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import orderRoutes from "./orderRoutes.js";
import couponRoutes from "./couponRoutes.js";
import offerRoutes from "./offerRoutes.js";
import salesReportRoutes from "./salesReportRoutes.js";
import productRoutes from "../adminRoutes/productRoutes.js";

const router = express.Router();

router.use(authMiddleware.adminLayout);

router.get(
  "/login",
  adminMiddleware.adminExists,
  adminController.renderLoginPage,
);

router.post("/login", adminMiddleware.adminExists, adminController.loginAdmin);

router.get(
  "/forgot-password",
  adminMiddleware.adminExists,
  adminController.forgotPasswordPage,
);

router.post(
  "/forgot-password",
  adminMiddleware.adminExists,
  adminController.forgotPasswordVerify,
);

router.get(
  "/verify-otp",
  authMiddleware.noMailFound,
  adminMiddleware.adminExists,
  adminController.renderOtpPage,
);

router.post(
  "/verify-otp",
  authMiddleware.noMailFound,
  adminMiddleware.adminExists,
  adminController.otpVerification,
);

router.get(
  "/reset-password",
  authMiddleware.otpVerifyReset,
  adminMiddleware.adminExists,
  adminController.resetPasswordPage,
);

router.post(
  "/reset-password",
  authMiddleware.otpVerifyReset,
  adminMiddleware.adminExists,
  adminController.newPassValidation,
);

router.post(
  "/resend-otp",
  authMiddleware.otpVerifyReset,
  adminMiddleware.adminExists,
  adminController.resendOtp,
);

router.use(authMiddleware.isLoggedIn);

router.get("/dashboard", adminController.dashboardPage);

router.get("/dashboard/stats", adminController.dashboardStats);

router.get("/dashboard/top", adminController.dashboardTopThrees);

router.get("/dashboard/chart", adminController.dashboardChart);

router.get("/dashboard/status", adminController.dashboardDonut);

router.get("/ledger/download", adminController.downloadLedger);

router.use("/users", adminUserRoutes);

router.use("/categories", categoryRoutes);

router.use("/products", productRoutes);

router.use("/orders", orderRoutes);

router.use("/offers", offerRoutes);

router.use("/coupons", couponRoutes);

router.use("/sales-report", salesReportRoutes);

router.get("/logout", adminController.logOut);

export default router;

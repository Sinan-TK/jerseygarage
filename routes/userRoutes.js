import express from "express";

const router = express.Router();

router.use((req, res, next) => {
  res.locals.layout = "user/layouts/layout";
  next();
});

router.get("/verify-otp", (req, res) => {
  res.render("user/pages/otp-verify", {
    title: "OTP Verification",
    error: false,
    pageCSS: "otp-verify",
    showHeader: true,
    showFooter: true,
  });
});

export default router;

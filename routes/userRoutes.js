const express = require("express");
// const userController = require('../controllers/adminController');
const router = express.Router();

router.use((req, res, next) => {
  res.locals.layout = "user/layouts/layout";
  next();
});




router.get("/verify-otp", (req, res) => {
  res.render("user/pages/otp-verify", {
    title: " OTP verification",
    error: false,
    pageCSS: "otp-verify",
    showHeader: true,
    showFooter: true,
  });
});



module.exports = router;

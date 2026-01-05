import { wrapAsync } from "../../utils/wrapAsync.js";
import { personalInfo } from "../../validators/userValidators.js";
import * as Responses from "../../utils/responses/user/user.response.js";
import { sendResponse } from "../../utils/sendResponse.js";
import User from "../../models/userModel.js";

// ======================================================================
// 1. CART PAGE RENDER
// ======================================================================
export const cartRender = (req, res) => {
  res.render("user/pages/cart", {
    title: "Cart",
    pageCSS: "cart",
    showHeader: true,
    showFooter: true,
    pageJS: "cart.js",
  });
};

// ======================================================================
// 2. PROFILE PAGE RENDER
// ======================================================================
export const profileRender = (req, res) => {
  res.render("user/layouts/profilelayout", {
    title: "User Profile",
    pageCSS: "profile",
    view: "profile",
    profile: true,
    showHeader: true,
    showFooter: true,
    pageJS: "profile.js",
  });
};

// ======================================================================
// 3. EDIT PERSONAL INFORMATION
// ======================================================================
export const editPersonalInfo = wrapAsync(async (req, res) => {
  const { error } = personalInfo.validate(req.body);

  if (error) {
    return sendResponse(res, {
      code: 400,
      message: error.details[0].message,
    });
  }

  const { fullName, email, phoneNo } = req.body;

  //   console.log(req.session.user);
  const user = await User.findById(req.session.user.id);

  const result = await User.findByIdAndUpdate(
    user._id,
    { $set: { full_name: fullName, phone_no: phoneNo } },
    { new: true }
  );

  const matchMail = await User.findOne({
    email: email,
    _id: { $ne: user._id },
  });

  if (matchMail) {
    console.log("working");
    return sendResponse(res, Responses.personalInfoEdit.EMAIL_EXIST);
  }

  if (user.email != email) {
    return sendResponse(res, Responses.personalInfoEdit.EMAIL_CHANGE);
  }
});

// ======================================================================
// 4. EMAIL OTP VERIFICATION PAGE RENDER
// ======================================================================
// export const emailOtpPage = (req, res) => {
//   res.render("user/pages/otp-verify", {
//     title: "OTP Verification",
//     pageCSS: "otp-verify",
//     showHeader: true,
//     showFooter: true,
//     pageJS: "otp-verify.js",
//   });
// };

// ======================================================================
// 4. ADDRESS PAGE RENDER
// ======================================================================
export const addressRender = (req, res) => {
  res.render("user/layouts/profilelayout", {
    title: "User Addresses",
    pageCSS: "address",
    view: "address",
    profile: true,
    showHeader: true,
    showFooter: true,
    pageJS: "address.js",
  });
};

// ======================================================================
// 5. WISHLIST PAGE RENDER
// ======================================================================
export const wishlistRender = (req, res) => {
  res.render("user/layouts/profilelayout", {
    title: "User Wishlist",
    pageCSS: "wishlist",
    view: "wishlist",
    profile: true,
    showHeader: true,
    showFooter: true,
    pageJS: "wishlist.js",
  });
};

// ======================================================================
// 6. USER LOGOUT
// ======================================================================
export const userLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log("User logout error:", err);
    }

    res.clearCookie("user.sid", { path: "/" });

    return res.redirect("/");
  });
};

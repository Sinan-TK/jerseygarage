import { wrapAsync } from "../../utils/wrapAsync.js";
import { personalInfo } from "../../validators/userValidators.js";
import * as Responses from "../../utils/responses/user/user.response.js";
import { sendResponse } from "../../utils/sendResponse.js";
import addressValidators from "../../validators/addressValidators.js";
import User from "../../models/userModel.js";
import Address from "../../models/addressModel.js";
import Wishlist from "../../models/wishlistModel.js";
import Variant from "../../models/varientModel.js";
import { ObjectId } from "mongodb";
import { response } from "express";
// import send from "send";

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
export const addressRender = wrapAsync(async (req, res) => {
  const user_id = req.session.user.id;

  const addresses = await Address.find({ user_id })
    .sort({ is_default: -1, createdAt: -1 })
    .lean();

  res.render("user/layouts/profilelayout", {
    title: "User Addresses",
    addresses,
    pageCSS: "address",
    view: "address",
    profile: true,
    showHeader: true,
    showFooter: true,
    pageJS: "address.js",
  });
});

// ======================================================================
// 4. ADDRESS ADD
// ======================================================================

export const addAddress = wrapAsync(async (req, res) => {
  const { error, value } = addressValidators.validate(req.body);

  if (error) {
    return sendResponse(res, {
      code: 400,
      message: error.details[0].message,
    });
  }

  const user_id = req.session.user.id;

  if (value.is_default) {
    await Address.updateMany({ user_id }, { $set: { is_default: false } });
  }

  await Address.create({
    ...value,
    user_id,
  });

  return sendResponse(res, Responses.addAddress.ADDRESS_ADDED);
});

// ======================================================================
// 4. ADDRESS DELETE
// ======================================================================

export const removeAddress = wrapAsync(async (req, res) => {
  const id = new ObjectId(req.params.id);

  await Address.findOneAndDelete({ _id: id });

  return sendResponse(res, Responses.removeAddress.REMOVED);
});

// ======================================================================
// 5. WISHLIST PAGE RENDER
// ======================================================================

export const editAddress = wrapAsync(async (req, res) => {
  const addressId = new ObjectId(req.params.id);
  const user_id = req.session.user.id;

  const { error, value } = addressValidators.validate(req.body);

  if (error) {
    return sendResponse(res, {
      code: 400,
      message: error.details[0].message,
    });
  }

  // If setting this address as default → unset others
  if (value.is_default) {
    await Address.updateMany(
      { user_id },
      { $set: { is_default: false } }
    );
  }

  // ✅ Update ONLY the selected address
  const result = await Address.updateOne(
    { _id: addressId, user_id },
    {
      $set: {
        ...value,
        user_id,
      },
    }
  );

  if (result.matchedCount === 0) {
    return sendResponse(res, {
      code: 404,
      message: "Address not found",
    });
  }

  return sendResponse(res, Responses.editAddress.ADDRESS_EDITED);
});


// ======================================================================
// 5. WISHLIST PAGE RENDER
// ======================================================================
export const wishlistRender = wrapAsync(async (req, res) => {
  const user_id = new ObjectId(req.session.user.id);

  const wishlist = await Wishlist.findOne({ user_id })
    .populate({
      path: "items.variant_id",
      populate: {
        path: "product_id",
        select: "name images teamName", // populate product from variant
      },
    })
    .lean();

  // Safe fallback
  const items = wishlist ? wishlist.items : [];

  res.render("user/layouts/profilelayout", {
    title: "User Wishlist",
    pageCSS: "wishlist",
    view: "wishlist",

    products: items,

    profile: true,
    showHeader: true,
    showFooter: true,
    pageJS: "wishlist.js",
  });
});

// ======================================================================
// 5. WISHLIST --> PRODUCT ADDING
// ======================================================================

export const addWishlist = wrapAsync(async (req, res) => {
  const { variantId } = req.body;
  const user_id = req.session.user.id;
  const variant_Id = new ObjectId(variantId);

  const exists = await Wishlist.exists({
    user_id,
    "items.variant_id": variant_Id,
  });

  if (exists) {
    await Wishlist.updateOne(
      { user_id },
      { $pull: { items: { variant_id: variant_Id } } }
    );

    return sendResponse(res, Responses.addWishlist.ALREADY_EXIST);
  }

  await Wishlist.findOneAndUpdate(
    { user_id },
    { $addToSet: { items: { variant_id: variant_Id } } },
    { upsert: true }
  );

  return sendResponse(res, Responses.addWishlist.PRODUCT_ADDED);
});

// ======================================================================
// 6. REMOVE ITEM FROM WISHLIST
// ======================================================================

export const removeWishlist = wrapAsync(async (req, res) => {
  const id = new ObjectId(req.params.id);
  const user_id = req.session.user.id;

  await Wishlist.updateOne(
    { user_id },
    {
      $pull: {
        items: { variant_id: id },
      },
    }
  );

  return sendResponse(res, Responses.removeWishlist.REMOVED);
});

// ======================================================================
// 6. USER LOGOUT
// ======================================================================

export const checkoutPage = wrapAsync(async (req, res) => {
  const user_id = req.session.user.id;

  const addresses = await Address.find({ user_id })
    .sort({
      is_default: -1,
      created_at: -1,
    })
    .lean();

  console.log(addresses);

  res.render("user/pages/checkout", {
    pageCSS: "checkout",
    pageJS: "checkout.js",
    title: "OTP Verification",
    addresses,
    showHeader: true,
    showFooter: true,
  });
});

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

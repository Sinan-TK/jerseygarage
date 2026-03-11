import express from "express";
import sendResponse from "../utils/sendResponse.js";
import Cart from "../models/cartModel.js";
import wrapAsync from "../utils/wrapAsync.js";
import User from "../models/userModel.js";
import { avatarUpload } from "../config/multer.js";
import multer from "multer";

export const Userdetails = async (req, res, next) => {
  try {
    const userId = req.session.user.id;
    const userDeatils = await User.findById(userId)
      .populate("wallet", "balance")
      .lean();
    res.locals.userDetails = userDeatils;
    next();
  } catch (error) {
    console.error("Profile User Detail middleware error:", error);
    res.locals.userDetails = [];
    next();
  }
};

export const userNotFound = (req, res, next) => {
  if (!req.session.user) {
    if (req.xhr || req.headers.accept?.includes("json")) {
      return sendResponse(res, {
        code: 401,
        message: "Please login first",
        redirectToFrontend: "/login",
      });
    }

    return res.redirect("/");
  }
  next();
};

export const checkoutMiddleware = (req, res, next) => {
  if (!req.session.checkoutIntent) {
    return res.redirect("/user/cart");
  }
  next();
};

export const cartItemsCount = wrapAsync(async (req, res, next) => {
  res.locals.cartItemsCount = 0;

  if (req.session.user) {
    const user_id = req.session.user.id;

    const cart = await Cart.findOne({ user_id }).select("items");

    if (cart) {
      res.locals.cartItemsCount = cart.items.length;
    }
  }

  next();
});

export const checkOrder = wrapAsync(async (req, res, next) => {
  if (!req.session.orderId) {
    return res.redirect("/user/cart");
  } else {
    next();
  }
});

export const uploadAvatar = (req, res, next) => {
  avatarUpload.single("avatar")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return sendResponse(res, {
          code: 400,
          message: "Avatar must be under 2MB",
        });
      }
      return sendResponse(res, { code: 400, message: err.message });
    } else if (err) {
      return sendResponse(res, { code: 400, message: err.message });
    }
    next();
  });
};

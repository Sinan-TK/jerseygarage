import express from "express";
import { sendResponse } from "../utils/sendResponse.js";
import Cart from "../models/cartModel.js";
import { wrapAsync } from "../utils/wrapAsync.js";
// import { message } from "statuses";

// const router = express.Router();

// router.use((req, res, next) => {
//   res.locals.user = req.session.user || null;
//   next();
// });

export const userNotFound = (req, res, next) => {
  if (!req.session.user) {
    return sendResponse(res, {
      code: 401,
      message: "Login required",
    });
  }
  next();
};

export const checkoutMiddleware = (req, res, next) => {
  if (!req.session.checkoutIntent) {
    return sendResponse(res, {
      code: 400,
      message: "No items to checkout",
    });
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

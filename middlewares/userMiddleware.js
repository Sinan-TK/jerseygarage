import express from "express";
import { sendResponse } from "../utils/sendResponse.js";
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

import User from "../models/userModel.js";

export const userLayout = (req, res, next) => {
  res.locals.layout = "user/layouts/layout";
  next();
};

export const isLoggedIn = (req, res, next) => {
  if (req.session.user) {
    if (!req.session.user.blocked) {
      console.log("isLoggedIn", req.session.user);
      return res.redirect("/");
    }
  }
  next();
};

export const isMailFound = (req, res, next) => {
  // if (req.session.tempEmail) {
  //   return res.redirect("/verify-otp");
  // }
  next();
};

export const noMailFound = (req, res, next) => {
  if (!req.session.tempEmail) {
    return res.redirect("/");
  }
  next();
};

export const profileIcon = (req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
};


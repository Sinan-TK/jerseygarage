import Admin from "../models/adminModel.js";

export const isLoggedIn = (req, res, next) => {
  // if (!req.session.admin) {
  //   return res.redirect("/admin/login");
  // }
  next();
};

export const adminExists = async (req, res, next) => {
  // if (req.session.admin) {
  //   return res.redirect("/admin/dashboard");
  // }
  next();
};

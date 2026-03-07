import bcrypt from "bcrypt";
import Admin from "../../models/adminModel.js";
import User from "../../models/userModel.js";
import Category from "../../models/categoryModel.js";
import Product from "../../models/productModel.js";
import * as Responses from "../../utils/responses/admin/admin.response.js";
import sendResponse from "../../utils/sendResponse.js";
import wrapAsync from "../../utils/wrapAsync.js";
import { adminSchema } from "../../validators/adminValidators.js";
import paginate from "../../utils/pagination.js";
import * as adminService from "../../services/admin/adminService.js";

// ======================================================================
// 1. RENDER LOGIN PAGE
// ======================================================================

export const renderLoginPage = (req, res) => {
  res.render("admin/pages/login", {
    showLayout: false,
    title: "Admin-Login",
    cssFile: "/css/admin/login.css",
    pageJS: "login.js",
  });
};

// ======================================================================
// 2. ADMIN LOGIN CONTROLLER (POST /admin/login)
// ======================================================================
export const loginAdmin = wrapAsync(async (req, res) => {
  const { error } = adminSchema.validate(req.body);

  if (error) {
    return sendResponse(res, {
      code: 400,
      message: error.details[0].message,
    });
  }

  const { email, password } = req.body;

  const result = await adminService.adminLoginLogic(email, password);

  if (result?.error) {
    return sendResponse(res, result.error);
  }

  req.session.admin = result.admin;

  return sendResponse(res, Responses.adminLogin.LOGIN_SUCCESS);
});

// ======================================================================
// 11.LOGOUT
// ======================================================================

export const logOut = wrapAsync((req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log("Admin logout error:", err);
    }

    res.clearCookie("admin.sid", { path: "/admin" });

    return res.redirect("/admin/login");
  });
});

// ======================================================================
// 13.FEATURE NOT AVAILABLE
// ======================================================================

export const featureNotAvailable = wrapAsync((req, res) => {
  res.render("admin/pages/featurenotavailable", {
    title: "featurenotavailable",
    showLayout: true,
    cssFile: "/css/admin/featurenotavailable.css",
    errorMessage: "",
    pageJS: "",
  });
});

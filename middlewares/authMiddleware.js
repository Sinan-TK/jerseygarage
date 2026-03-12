import User from "../models/userModel.js";
import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js";
import wrapAsync from "../utils/wrapAsync.js";

export const isLoggedIn = (req, res, next) => {
  if (req.session.user) {
    if (!req.session.user.blocked) {
      return res.redirect("/");
    }
  }
  next();
};

export const userLayout = (req, res, next) => {
  res.locals.layout = "user/layouts/layout";
  next();
};

export const productNotFound = wrapAsync(async (req, res, next) => {
  const productId = req.params.id;

  const product = await Product.findById(productId);

  if (!product || !product.is_active) {
    return next({ status: 404 });
  }

  req.product = product;
  next();
});

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

export const checkBlockedUser = async (req, res, next) => {
  try {
    if (!req.session.user?.id) return next();

    const user = await User.findById(req.session.user.id).select("is_blocked");

    if (!user || user.is_blocked) {
      return req.session.destroy(() => {
        res.redirect("/login?blocked=true");
      });
    }

    // User is active → continue
    next();
  } catch (error) {
    console.error("checkBlockedUser error:", error);
    res.status(500).send("Server Error");
  }
};

export const sidebarData = async (req, res, next) => {
  try {
    const categories = await Category.find({ is_active: true })
      .select("name")
      .lean();

    res.locals.sideBarCategories = categories;
    next();
  } catch (error) {
    console.error("Sidebar middleware error:", error);
    res.locals.categories = [];
    next();
  }
};

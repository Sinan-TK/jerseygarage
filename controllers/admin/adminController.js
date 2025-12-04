import bcrypt from "bcrypt";
import Admin from "../../models/adminModel.js";
import User from "../../models/userModel.js";
import Category from "../../models/categoryModel.js";
import Product from "../../models/productModel.js";
import cloudinary from "../../config/cloudinary.js";
import upload from "../../middlewares/multer.js";
import * as Responses from "../../utils/responses/admin/admin.response.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { wrapAsync } from "../../utils/wrapAsync.js";
import { adminSchema } from "../../validators/adminValidators.js";
import { paginate } from "../../utils/pagination.js";

const uploadImages = upload.array("images", 5);

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

  // Check if the admin exists
  const admin = await Admin.findOne({ email });
  if (!admin) {
    return sendResponse(res, Responses.adminLogin.ADMIN_NOT_FOUND);
  }

  // Verify the password
  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    return sendResponse(res, Responses.adminLogin.INVALID_PASSWORD);
  }

  req.session.Admin = {
    id: admin._id,
    email: admin.email,
  };

  return sendResponse(res, Responses.adminLogin.LOGIN_SUCCESS);
});

// ======================================================================
// 3. GET USERS LIST (ADMIN USERS PAGE)
// ======================================================================
export const getUsers = wrapAsync(async (req, res) => {
  let page = req.query.page || 1;

  const result = await paginate(User, page, 5);

  res.render("admin/pages/user", {
    title: "Users",
    showLayout: true,
    cssFile: "/css/admin/user.css",
    users: result.data,
    pagination: result.meta,
    pageJS: "user.js",
  });
});

// ======================================================================
// 4. BLOCK USER
// ======================================================================
export const blockUser = wrapAsync(async (req, res) => {
  const id = req.params.id;
  const updatedUser = await User.findByIdAndUpdate(
    id,
    { is_blocked: true },
    { new: true }
  );

  return sendResponse(res, {
    ...Responses.userStatus.USER_BLOCK,
    data: updatedUser,
  });
});

// ======================================================================
// 5. UNBLOCK USER
// ======================================================================
export const unblockUser = wrapAsync(async (req, res) => {
  const id = req.params.id;
  const updatedUser = await User.findByIdAndUpdate(
    id,
    { is_blocked: false },
    { new: true }
  );

  return sendResponse(res, {
    ...Responses.userStatus.USER_UNBLOCK,
    data: updatedUser,
  });
});

// ======================================================================
// 6.SEARCH USER
// ======================================================================

export const searchUser = wrapAsync(async (req, res) => {
  let page = req.query.page || 1;
  const search = req.query.searchContent || "";
  const status = req.query.userStatus || "all";
  console.log(search, status);

  let filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  if (status === "blocked") filter.is_blocked = true;
  if (status === "active") filter.is_blocked = false;

  const result = await paginate(User, page, 5, filter);

  res.render("admin/pages/user", {
    title: "Users",
    showLayout: true,
    cssFile: "/css/admin/user.css",
    users: result.data,
    pagination: result.meta,
    userStatus: req.query.userStatus || "all",
    searchContent: req.query.searchContent,
    pageJS: "user.js",
  });
});

// ======================================================================
// 11.LOGOUT
// ======================================================================

export const logOut = (req, res) => {
  console.log("hell");
  delete req.session.Admin;
  return res.redirect("/admin/login");
};

// ======================================================================
// 12.PRODUCT PAGE RENDER
// ======================================================================

export const productsPageRender = async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  const limit = 10;
  const totalProducts = await Product.countDocuments();
  const totalPages = Math.ceil(totalProducts / limit);

  if (page > totalPages) {
    page = totalPages;
  }

  if (page < 1) {
    page = 1;
  }

  const skip = (page - 1) * limit;

  const products = await Product.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  req.session.page = page;

  const categoriesName = await Category.find().select("name");

  res.render("admin/pages/products", {
    title: "Products",
    showLayout: true,
    cssFile: "/css/admin/products.css",
    errorMessage: "",
    pageJS: "products.js",
    products,
    currentPage: page,
    totalPages,
    searchContent: "",
    // status: "",
    categoriesName,
  });
};

// ======================================================================
// 13.FEATURE NOT AVAILABLE
// ======================================================================

export const featureNotAvailable = (req, res) => {
  res.render("admin/pages/featurenotavailable", {
    title: "featurenotavailable",
    showLayout: true,
    cssFile: "/css/admin/featurenotavailable.css",
    errorMessage: "",
    pageJS: "",
  });
};

// ======================================================================
// 15.SEARCH CATEGORY
// ======================================================================

export const addProduct = async (req, res) => {
  uploadImages(req, res, async (err) => {
    // Multer limit handler
    if (err) {
      return res.status(400).json({
        success: false,
        message: "Maximum 5 images allowed!",
      });
    }

    try {
      const { productName, teamName, description, category } = req.body;

      const stock = JSON.parse(req.body.stock);
      const normalPrice = JSON.parse(req.body.normalPrice);
      const basePrice = JSON.parse(req.body.basePrice);

      if (!productName) {
        return res.json({
          success: false,
          message: "Product name required!",
        });
      }

      if (!category) {
        return res.json({
          success: false,
          message: "Select Category!",
        });
      }

      if (!teamName) {
        return res.json({
          success: false,
          message: "Team name required!",
        });
      }

      // Images Validation (min/max)
      if (!req.files || req.files.length === 0) {
        return res.json({
          success: false,
          message: "No image uploaded!",
        });
      }

      if (req.files.length < 3) {
        return res.json({
          success: false,
          message: "Minimum 3 images required!",
        });
      }
      // Price validation
      for (let i in stock) {
        if (!normalPrice[i] || !basePrice[i] || !stock[i]) {
          return res.json({
            success: false,
            message: "Stock, Normal price and Base price are required!",
          });
        }

        if (Number(normalPrice[i]) < Number(basePrice[i])) {
          return res.json({
            success: false,
            message: "Normal price should always be greater than base price!",
          });
        }
      }

      // -------------------------
      // UPLOAD TO CLOUDINARY NOW
      // -------------------------

      const uploadedImages = [];

      for (let file of req.files) {
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "products" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          stream.end(file.buffer);
        });

        uploadedImages.push(uploadResult.secure_url);
      }

      console.log("CLOUDINARY URLs:", uploadedImages);

      // After uploadedImages[] is created

      const categoryId = await Category.findOne({ name: category });

      console.log(categoryId);

      const sizesList = ["S", "M", "L", "XL", "XXL"];

      const sizeArray = sizesList.map((size) => ({
        size,
        stock: Number(stock[size]),
        basePrice: Number(basePrice[size]),
        normalPrice: Number(normalPrice[size]),
      }));

      const product = await Product.create({
        name: productName,
        teamName,
        description,
        category: categoryId,
        images: uploadedImages,
        sizes: sizeArray,
      });

      console.log(product);

      return res.json({
        success: true,
        message: "Product added successfully!",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Something went wrong!",
      });
    }
  });
};

// ======================================================================
// 16.BLOCK PRODUCT
// ======================================================================

export const blockProduct = async (req, res) => {
  const id = req.params.id;

  const data = await Product.findByIdAndUpdate(
    id,
    { is_active: false },
    { new: true }
  );

  console.log(data);
  console.log(id);

  res.json({
    success: true,
    message: "Product Unlisted!",
  });
};

// ======================================================================
// 16.UNBLOCK PRODUCT
// ======================================================================

export const unblockProduct = async (req, res) => {
  const id = req.params.id;

  const data = await Product.findByIdAndUpdate(
    id,
    { is_active: true },
    { new: true }
  );

  console.log(data);
  console.log(id);

  res.json({
    success: true,
    message: "Product Listed!",
  });
};

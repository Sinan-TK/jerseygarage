const bcrypt = require("bcrypt");
const Admin = require("../models/adminModel");
const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const { ObjectId } = require("mongodb");
const { message } = require("statuses");

// ======================================================================
// 1. RENDER LOGIN PAGE
// ======================================================================

const renderLoginPage = (req, res) => {
  res.render("admin/pages/login", {
    showLayout: false,
    title: "Admin-Login",
    cssFile: "/css/admin/login.css",
    errorMessage: "",
    pageJS: "login.js",
  });
};

// ======================================================================
// 1. ADMIN LOGIN CONTROLLER (POST /admin/login)
// ======================================================================
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(email, password);

    // Basic backend validation
    if (!email || !password) {
      return res.json({
        success: false,
        message: "Email and Password are required!",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.json({
        success: false,
        message: "Enter a valid email address!",
      });
    }

    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Password must be at least 8 characters!",
      });
    }

    // Check if the admin exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.json({
        success: false,
        message: "Admin not found!",
      });
    }

    // Verify the password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.json({
        success: false,
        message: "Invalid password!",
      });
    }

    req.session.Admin = true;

    return res.json({
      success: true,
      message: "Login successful!",
    });
  } catch (error) {
    console.error("❌ Login Error:", error.message);
    console.log(err);
    res.status(500).send("Server Error");
  }
};

// ======================================================================
// 2. GET USERS LIST (ADMIN USERS PAGE)
// ======================================================================
const getUsers = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    const limit = 5;
    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);

    if (page > totalPages) {
      page = totalPages;
    }

    if (page < 1) {
      page = 1;
    }

    const skip = (page - 1) * limit;

    const users = await User.find()
      .sort({ createdAt: -1 }) // Sort by newest account created
      .skip(skip)
      .limit(limit);

    res.render("admin/pages/user", {
      title: "Users",
      showLayout: true,
      page: "admin/pages/users",
      cssFile: "/css/admin/user.css",
      users,
      currentPage: page,
      totalPages,
      pageJS: "user.js",
    });
  } catch (err) {
    console.error(err);
    res.send("Error fetching users");
  }
};

// ======================================================================
// 3. BLOCK USER
// ======================================================================
const blockUser = async (req, res) => {
  const id = req.params.id;
  const updatedUser = await User.findByIdAndUpdate(
    id,
    { is_blocked: true },
    { new: true }
  );

  console.log(updatedUser);

  res.json({
    success: true,
    message: "Blocked successfully!",
    updatedData: updatedUser,
  });
};

// ======================================================================
// 4. UNBLOCK USER
// ======================================================================
const unblockUser = async (req, res) => {
  const id = req.params.id;
  const updatedUser = await User.findByIdAndUpdate(
    id,
    { is_blocked: false },
    { new: true }
  );

  console.log(updatedUser);

  res.json({
    success: true,
    message: "Unblocked successfully!",
    updatedData: updatedUser,
  });
};

// ======================================================================
// 5. GET CATEGORY LIST (ADMIN CATEGORIES PAGE)
// ======================================================================
const getCategories = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    const limit = 6;
    const totalCategory = await Category.countDocuments();
    const totalPages = Math.ceil(totalCategory / limit);

    if (page > totalPages) {
      page = totalPages;
    }

    if (page < 1) {
      page = 1;
    }

    const skip = (page - 1) * limit;

    const categories = await Category.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    req.session.page = page;

    res.render("admin/pages/categories", {
      title: "Categories",
      showLayout: true,
      page: "admin/pages/categories",
      cssFile: "/css/admin/categories.css",
      categories,
      currentPage: page,
      totalPages,
      pageJS: "categories.js",
      categoryStatus: req.query.categoryStatus || "all",
      searchContent: req.query.searchContent,
    });
  } catch (err) {
    console.error(err);
    res.send("Error fetching users");
  }
};

// ======================================================================
// 6. ADD CATEGORY (POST /admin/categories/add)
// ======================================================================
const addCategory = async (req, res) => {
  try {
    const { name, description, color } = req.body;

    // Always load categories for re-render
    if (!name || !description || !color) {
      return res.json({
        success: false,
        message: "All fields are required. Please fill out every input!",
      });
    }

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.json({
        success: false,
        message: "Category name already exists!",
      });
    }

    await Category.create({ name, description, color });
    res.json({
      success:true,
      message:"Category added successfully!"
    });
  } catch (err) {
    console.error(err);
    res.send("Error adding category");
  }
};

// ======================================================================
// 7. BLOCK CATEGORY
// ======================================================================
const blockCategory = async (req, res) => {
  const id = req.params.id;
  const updatedData = await Category.findByIdAndUpdate(
    id,
    { is_active: false },
    { new: true }
  );

  console.log(updatedData);

  res.json({
    success: true,
    message: "Category blocked!",
    updatedData,
  });
};

// ======================================================================
// 8. UNBLOCK CATEGORY
// ======================================================================
const unblockCategory = async (req, res) => {
  const id = req.params.id;
  const updatedData = await Category.findByIdAndUpdate(
    id,
    { is_active: true },
    { new: true }
  );

  console.log(updatedData);

  res.json({
    success: true,
    message: "Category unblocked!",
    updatedData,
  });
};

// ======================================================================
// 9. EDIT CATEGORY
// ======================================================================

const editCategory = async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    const { name, description, color } = req.body;

    console.log(name, description, color);
    console.log(id);

    if (!name || !description || !color) {
      return res.json({
        success: false,
        message: "All fields are required. Please fill out every input!",
      });
    }

    const existingCategory = await Category.findOne({
      name: { $regex: name, $options: "i" },
      _id: { $ne: id },
    });

    if (existingCategory) {
      return res.json({
        success: false,
        message: "This category already exists.",
      });
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      {
        name,
        description,
        color,
      },
      {
        new: true,
      }
    );

    return res.json({
      success: true,
      message: "Category updated successfully!",
      updatedData: updatedCategory,
    });

    // return res.redirect("/admin/categories");
  } catch (err) {
    console.error(err);
    res.send("Error adding category");
  }
};

// ======================================================================
// LOGOUT
// ======================================================================

const logOut = (req, res) => {
  console.log("hell");
  delete req.session.Admin;
  return res.redirect("/admin/login");
};

// ======================================================================
// FEATURE NOT AVAILABLE
// ======================================================================

const featureNotAvailable = (req, res) => {
  res.render("admin/pages/featurenotavailable", {
    title: "featurenotavailable",
    showLayout: true,
    cssFile: "/css/admin/featurenotavailable.css",
    errorMessage: "",
    pageJS: "",
  });
};

// ======================================================================
// SEARCH USER
// ======================================================================

const searchUser = async (req, res) => {
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

  let page = parseInt(req.query.page) || 1;
  const limit = 5;
  const totalUsers = await User.countDocuments(filter);

  console.log(totalUsers);

  const totalPages = Math.ceil(totalUsers / limit);

  if (page > totalPages) {
    page = totalPages;
  }

  if (page < 1) {
    page = 1;
  }

  const skip = (page - 1) * limit;

  const users = await User.find(filter)
    .sort({ createdAt: -1 }) // Sort by newest account created
    .skip(skip)
    .limit(limit);

  res.render("admin/pages/user", {
    title: "Users",
    showLayout: true,
    page: "admin/pages/users",
    cssFile: "/css/admin/user.css",
    users,
    currentPage: page,
    totalPages,
    userStatus: req.query.userStatus || "all",
    searchContent: req.query.searchContent,
    pageJS: "user.js",
  });
};

// ======================================================================
// SEARCH CATEGORY
// ======================================================================

const searchCategory = async (req, res) => {
  const search = req.query.searchContent || "";
  const status = req.query.categoryStatus || "all";

  console.log(search, status);

  let filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      // { email: { $regex: search, $options: "i" } },
    ];
  }

  if (status === "blocked") filter.is_active = false;
  if (status === "active") filter.is_active = true;

  let page = parseInt(req.query.page) || 1;
  const limit = 6;
  const totalCategory = await Category.countDocuments(filter);

  console.log(totalCategory);

  const totalPages = Math.ceil(totalCategory / limit);

  if (page > totalPages) {
    page = totalPages;
  }

  if (page < 1) {
    page = 1;
  }

  const skip = (page - 1) * limit;

  const categories = await Category.find(filter)
    .sort({ createdAt: -1 }) // Sort by newest account created
    .skip(skip)
    .limit(limit);

  res.render("admin/pages/categories", {
    title: "Categories",
    showLayout: true,
    page: "admin/pages/categories",
    cssFile: "/css/admin/categories.css",
    categories,
    currentPage: page,
    totalPages,
    pageJS: "categories.js",
    categoryStatus: req.query.categoryStatus || "all",
    searchContent: req.query.searchContent,
  });

  // res.render("admin/pages/c", {
  //   title: "Users",
  //   showLayout: true,
  //   page: "admin/pages/users",
  //   cssFile: "/css/admin/user.css",
  //   Ca,
  //   currentPage: page,
  //   totalPages,
  //   userStatus: req.query.userStatus || "all",
  //   searchContent: req.query.searchContent,
  //   pageJS: "user.js",
  // });
};

// ======================================================================
// EXPORTS
// ======================================================================
module.exports = {
  renderLoginPage,
  loginAdmin,
  getUsers,
  blockUser,
  unblockUser,
  getCategories,
  addCategory,
  blockCategory,
  unblockCategory,
  editCategory,
  logOut,
  featureNotAvailable,
  searchUser,
  searchCategory,
};

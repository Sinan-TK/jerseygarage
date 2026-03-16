import bcrypt from "bcrypt";
import Admin from "../../models/adminModel.js";
import User from "../../models/userModel.js";
import Otp from "../../models/otpModel.js";
import Category from "../../models/categoryModel.js";
import Product from "../../models/productModel.js";
import * as Responses from "../../utils/responses/admin/admin.response.js";
import sendResponse from "../../utils/sendResponse.js";
import wrapAsync from "../../utils/wrapAsync.js";
import * as adminValidators from "../../validators/adminValidators.js";
import paginate from "../../utils/pagination.js";
import * as adminService from "../../services/admin/adminService.js";
import Order from "../../models/orderModel.js";
import generateOtp from "../../utils/GenerateOtp.js";
import XLSX from "xlsx";
import * as adminConstants from "../../constants/adminConstants.js";

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
  const { error } = adminValidators.loginValidation.validate(req.body);

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
// 4.FORGOT PASSWORD PAGE
// ======================================================================

export const forgotPasswordPage = wrapAsync((req, res) => {
  res.render("admin/pages/forgotPassword", {
    showLayout: false,
    title: "Forgot Password",
    cssFile: "/css/admin/forgotPassword.css",
    pageJS: "forgotPassword.js",
  });
});

// ======================================================================
// 4.FORGOT PASSWORD VERIFICATION
// ======================================================================

export const forgotPasswordVerify = wrapAsync(async (req, res) => {
  const { error } = adminValidators.emailCheck.validate(req.body);

  if (error) {
    return sendResponse(res, {
      code: 400,
      message: error.details[0].message,
    });
  }

  const { email } = req.body;

  const admin = await Admin.findOne({ email });
  if (!admin) return sendResponse(res, Responses.adminLogin.ADMIN_NOT_FOUND);

  await generateOtp(email, "forget_password", "Forget password OTP");

  req.session.tempEmail = email;
  req.session.otpPurpose = "forget_password";

  return sendResponse(res, Responses.adminLogin.OTP_GENERATED);
});

// ======================================================================
// 4. RENDER OTP PAGE
// ======================================================================

export const renderOtpPage = wrapAsync((req, res) => {
  res.render("admin/pages/otp", {
    title: "OTP Verification",
    cssFile: "/css/admin/otp.css",
    showLayout: false,
    pageJS: "otp.js",
  });
});

// ======================================================================
// 5. VERIFY OTP (SIGNUP / FORGOT PASSWORD)
// ======================================================================

export const otpVerification = wrapAsync(async (req, res) => {
  const email = req.session.tempEmail;
  const purpose = req.session.otpPurpose;

  if (!email || !purpose) {
    return sendResponse(res, Responses.otpVerify.DATA_NOT_FOUND);
  }

  const { error } = adminValidators.otpSchema.validate(req.body);

  if (error) {
    return sendResponse(res, {
      code: 400,
      message: error.details[0].message,
    });
  }

  const { otpValue } = req.body;

  const otpDoc = await Otp.findOne({ email, purpose, is_used: false });

  if (!otpDoc) {
    return sendResponse(res, Responses.otpVerify.OTP_EXPIRED);
  }

  if (otpDoc.otp_code !== otpValue) {
    return sendResponse(res, Responses.otpVerify.INCORRECT_OTP);
  }

  otpDoc.is_used = true;
  await otpDoc.save();

  req.session.resetPass = true;

  return sendResponse(res, Responses.otpVerify.NEWPASSWORD);
});

// ======================================================================
// 4. RENDER RESET PASSWORD PAGE
// ======================================================================

export const resetPasswordPage = wrapAsync((req, res) => {
  res.render("admin/pages/resetPassword", {
    title: "Reset Password",
    cssFile: "/css/admin/resetPassword.css",
    showLayout: false,
    pageJS: "resetPassword.js",
  });
});

// ======================================================================
// 4. RENDER RESET PASSWORD PAGE
// ======================================================================

export const newPassValidation = wrapAsync(async (req, res) => {
  const email = req.session.tempEmail;
  if (!email) return sendResponse(res, Responses.forgetPass.DATA_NOT_FOUND);

  const { error } = adminValidators.newPassSchema.validate(req.body);

  if (error) {
    return sendResponse(res, {
      code: 400,
      message: error.details[0].message,
    });
  }

  const { password, confirmPassword } = req.body;

  const admin = await Admin.findOne({ email });
  if (!admin) return sendResponse(res, Responses.forgetPass.NOT_FOUND);

  admin.password_hash = password;
  await admin.save();

  delete req.session.tempEmail;
  delete req.session.otpPurpose;
  delete req.session.resetPass;

  return sendResponse(res, Responses.forgetPass.PASS_CHANGE);
});

// ======================================================================
// 3.LOGOUT
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
// 4.DASHBOARD
// ======================================================================

export const dashboardPage = (req, res) => {
  res.render("admin/pages/dashboard", {
    title: "Dashboard",
    showLayout: true,
    cssFile: "/css/admin/dashboard.css",
    pageJS: "dashboard.js",
  });
};

// ======================================================================
// 5.DASHBOARD DATA
// ======================================================================

export const dashboardStats = wrapAsync(async (req, res) => {
  const totalOrders = await Order.countDocuments();

  const revenueResult = await Order.aggregate([
    {
      $match: {
        paymentStatus: "Paid",
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalPrice" },
      },
    },
  ]);

  const totalRevenue = revenueResult[0]?.totalRevenue || 0;

  const totalCustomers = await User.countDocuments({
    is_blocked: false,
  });

  const totalProducts = await Product.countDocuments({
    is_active: true,
  });

  return sendResponse(res, {
    code: 200,
    message: "Stats Data rendered successfully",
    data: {
      totalOrders,
      totalRevenue,
      totalCustomers,
      totalProducts,
    },
  });
});

// ======================================================================
// 6.DASHBOARD DATA
// ======================================================================

export const dashboardTopThrees = wrapAsync(async (req, res) => {
  const topProducts = await Order.aggregate([
    {
      $match: {
        orderStatus: { $nin: ["Pending", "Failed"] },
      },
    },
    { $unwind: "$products" },
    {
      $match: {
        "products.status": { $ne: "Cancelled" },
      },
    },
    {
      $group: {
        _id: "$products.product_id",
        name: { $first: "$products.name" },
        image: { $first: "$products.image" },
        totalSold: { $sum: "$products.quantity" },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 3 },
  ]);

  const topCategories = await Order.aggregate([
    {
      $match: {
        orderStatus: { $nin: ["Pending", "Failed"] },
      },
    },
    { $unwind: "$products" },
    {
      $match: {
        "products.status": { $ne: "Cancelled" },
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "products.product_id",
        foreignField: "_id",
        as: "productInfo",
      },
    },
    { $unwind: "$productInfo" },
    {
      $group: {
        _id: "$productInfo.category",
        totalSold: { $sum: "$products.quantity" },
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "_id",
        as: "categoryInfo",
      },
    },
    { $unwind: "$categoryInfo" },
    {
      $project: {
        _id: 1,
        name: "$categoryInfo.name",
        totalSold: 1,
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 3 },
  ]);

  return sendResponse(res, {
    code: 200,
    message: "Top Three Data rendered successfully",
    data: {
      topProducts,
      topCategories,
    },
  });
});

// ======================================================================
// 7.DASHBOARD CHART
// ======================================================================

export const dashboardChart = wrapAsync(async (req, res) => {
  const result = await adminService.adminDashboardFilter(req.query);

  if (result?.error) {
    return sendResponse(res, result.error);
  } else {
    return sendResponse(res, {
      code: 200,
      message: "Chart data fetched",
      data: {
        labels: result.labels,
        revenue: result.revenue,
        orders: result.orders,
      },
    });
  }
});

//
//
//

export const dashboardDonut = wrapAsync(async (req, res) => {
  const result = await Order.aggregate([
    {
      $match: {
        orderStatus: { $nin: ["Pending", "Failed"] },
      },
    },
    {
      $group: {
        _id: "$orderStatus",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  const colorMap = {
    Placed: "#d97706",
    Confirmed: "#f59e0b",
    Packed: "#3b82f6",
    Shipped: "#2563eb",
    OutForDelivery: "#8b5cf6",
    Delivered: "#16a34a",
    Cancelled: "#e53935",
    Returned: "#7c3aed",
  };

  const labels = result.map((r) => r._id);
  const data = result.map((r) => r.count);
  const colors = result.map((r) => colorMap[r._id] || "#94a3b8");

  return sendResponse(res, {
    code: 200,
    message: "Donut data fetched",
    data: { labels, data, colors },
  });
});

// ======================================================================
// 8.DASHBOARD LEDGER
// ======================================================================

export const downloadLedger = wrapAsync(async (req, res) => {
  const { from, to } = req.query;

  const query = {
    paymentStatus: { $in: ["Paid", "Refunded"] },
  };

  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) {
      const endDate = new Date(to);
      endDate.setHours(23, 59, 59, 999);
      query.createdAt.$lte = endDate;
    }
  }

  const orders = await Order.find(query).sort({ createdAt: 1 }).lean();

  // Build ledger entries
  let balance = 0;
  const entries = [];

  for (const order of orders) {
    // Credit — payment received
    balance += order.totalPrice;
    entries.push({
      date: order.createdAt.toISOString().slice(0, 10),
      description: `Order ${order.orderId}`,
      type: "Credit",
      amount: order.totalPrice,
      balance,
    });

    // Debit — refund given
    if (order.refundAmount > 0) {
      balance -= order.refundAmount;
      entries.push({
        date: order.updatedAt.toISOString().slice(0, 10),
        description: `Refund ${order.orderId}`,
        type: "Debit",
        amount: order.refundAmount,
        balance,
      });
    }
  }

  const rows = entries.map((e) => ({
    Date: e.date,
    Description: e.description,
    Type: e.type,
    "Credit (₹)": e.type === "Credit" ? e.amount.toFixed(2) : "",
    "Debit (₹)": e.type === "Debit" ? e.amount.toFixed(2) : "",
    "Balance (₹)": e.balance.toFixed(2),
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [
    { wch: 14 }, // Date
    { wch: 30 }, // Description
    { wch: 10 }, // Type
    { wch: 14 }, // Credit
    { wch: 14 }, // Debit
    { wch: 16 }, // Balance
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Ledger");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  res.setHeader(
    "Content-Disposition",
    `attachment; filename=Ledger_${new Date().toISOString().slice(0, 10)}.xlsx`,
  );
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.send(buffer);
});

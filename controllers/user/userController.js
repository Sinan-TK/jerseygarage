import wrapAsync from "../../utils/wrapAsync.js";
import mongoose from "mongoose";
import * as userValidators from "../../validators/userValidators.js";
import * as Responses from "../../utils/responses/user/user.response.js";
import sendResponse from "../../utils/sendResponse.js";
import addressValidators from "../../validators/addressValidators.js";
import User from "../../models/userModel.js";
import Address from "../../models/addressModel.js";
import Variant from "../../models/variantModel.js";
import Cart from "../../models/cartModel.js";
import Product from "../../models/productModel.js";
import Otp from "../../models/otpModel.js";
import razorpay from "../../config/razorpay.js";
import Order from "../../models/orderModel.js";
import { ObjectId } from "mongodb";
import buildCheckoutItems from "../../utils/buildCheckoutItems.js";
import generateInvoice from "../../utils/generateInvoice.js";
import bcrypt from "bcrypt";
import generateOtp from "../../utils/GenerateOtp.js";
import Wallet from "../../models/walletModel.js";
import WalletTransaction from "../../models/walletTransactionModel.js";
import * as userConstants from "../../constants/userConstants.js";
import * as userServices from "../../services/user/userServices.js";
import * as walletHandler from "../../utils/walletHandler.js";
import { applyOffer } from "../../utils/offerApply.js";
import crypto from "crypto";
import gstCalculator from "../../utils/gstCalculator.js";
import Coupon from "../../models/couponModel.js";
import * as couponChecks from "../../utils/checkCoupon.js";
import paginate from "../../utils/pagination.js";
import cloudinary from "../../config/cloudinary.js";

// ======================================================================
// 1. CART PAGE RENDER
// ======================================================================
export const cartRender = wrapAsync(async (req, res) => {
  const user_id = req.session.user.id;

  const cart = await Cart.findOne({ user_id });

  if (!cart || cart.items.length === 0) {
    return res.render("user/pages/cart", {
      title: "Cart",
      pageCSS: "cart",
      showHeader: true,
      showFooter: true,
      pageJS: "cart.js",
      products: [],
    });
  }

  const { checkoutItems, warning } = await buildCheckoutItems(cart.items);

  const products = await applyOffer(checkoutItems);

  const total = products.reduce((sum, item) => sum + item.subtotal, 0);

  cart.total_amount = total;
  cart.save();

  const priceDetails = {
    subtotal: cart.total_amount,
    total: userConstants.SHIPPING_CHARGE + cart.total_amount,
    shippingCharge: userConstants.SHIPPING_CHARGE,
  };

  res.render("user/pages/cart", {
    title: "Cart",
    pageCSS: "cart",
    showHeader: true,
    showFooter: true,
    pageJS: "cart.js",
    products,
    warning,
    priceDetails,
  });
});
// ======================================================================
// 2. CART QUANTITY CHANGE
// ======================================================================
export const cartQuantity = wrapAsync(async (req, res) => {
  const user_id = req.session.user.id;
  const shippingCharge = userConstants.SHIPPING_CHARGE;
  const cart = await Cart.findOne({ user_id });

  const result = await userServices.cartQuantityService({ cart, ...req.body });

  if (result?.error) {
    return sendResponse(res, result.error);
  }

  return sendResponse(res, {
    code: 200,
    message: "Quantity changed successfully",
    data: {
      quantity: result?.quantity || 0,
      itemTotal: result?.itemTotal,
      subtotal: result?.subtotal,
      total: result?.total,
    },
  });
});

// ======================================================================
// 2. PROFILE PAGE RENDER
// ======================================================================
export const profileRender = (req, res) => {
  res.render("user/layouts/profilelayout", {
    title: "User Profile",
    pageCSS: "profile",
    view: "profile",
    profile: true,
    showHeader: true,
    showFooter: true,
    pageJS: "profile.js",
  });
};

// ======================================================================
// 3. EDIT PERSONAL INFORMATION
// ======================================================================
export const editPersonalInfo = wrapAsync(async (req, res) => {
  const user_id = req.session.user.id;
  const user = await User.findById(user_id);

  const result = await userServices.editPersonalInfoService({
    ...req.body,
    user,
  });

  if (result?.error) {
    return sendResponse(res, result.error);
  }

  if (user.email === result.email) {
    return sendResponse(res, {
      code: 200,
      message: "Personal Info edited",
      data: result.data,
    });
  } else {
    req.session.emailVerify = result.email;
    await generateOtp(
      result.email,
      userConstants.OTPPURPOSE.CHANGEEMAIL,
      "Change Mail Address",
    );
    return sendResponse(res, Responses.personalInfoEdit.EMAIL_CHANGE);
  }
});

// ======================================================================
// 3. EDIT PERSONAL INFORMATION
// ======================================================================

export const changeAvatar = wrapAsync(async (req, res) => {
  const user_id = req.session.user.id;

  if (!req.file) {
    return sendResponse(res, { code: 400, message: "No image provided" });
  }

  // Upload to cloudinary
  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "jerseygarage/avatars",
          transformation: [
            { width: 300, height: 300, crop: "fill", gravity: "face" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      )
      .end(req.file.buffer);
  });

  await User.updateOne({ _id: user_id }, { avatar: result.secure_url });

  return sendResponse(res, {
    code: 200,
    success: true,
    message: "Profile picture updated",
    data: { avatar: result.secure_url },
  });
});

// ======================================================================
// 3. EDIT PERSONAL INFORMATION
// ======================================================================

export const deleteDp = wrapAsync(async (req, res) => {
  const user_id = req.session.user.id;

  await User.updateOne({ _id: user_id }, { $unset: { avatar: "" } });

  const user = await User.findById(user_id);

  return sendResponse(res, {
    code: 200,
    message: "Profile picture removed",
    data: { avatar: user.avatar },
  });
});

// ======================================================================
// 3. EDIT PERSONAL INFORMATION
// ======================================================================

export const emailVerification = wrapAsync(async (req, res) => {
  const email = req.session.emailVerify;
  const purpose = userConstants.OTPPURPOSE.CHANGEEMAIL;
  const user_id = req.session.user.id;

  const result = await userServices.emailVerificationService({
    email,
    purpose,
    ...req.body,
    user_id,
  });

  if (result?.error) {
    return sendResponse(res, result.error);
  }

  req.session.user.email = email;

  return sendResponse(res, Responses.emailVerify.SUCCESS);
});

// ======================================================================
// 4. EMAIL OTP VERIFICATION PAGE RENDER
// ======================================================================
export const emailOtpVerify = wrapAsync(async (req, res) => {
  res.render("user/pages/profile/emailVerify", {
    title: "OTP Verification",
    pageCSS: "otp-verify",
    showHeader: true,
    showFooter: true,
    pageJS: "emailVerify.js",
  });
});

// ======================================================================
// 4. EDIT PASSWORD
// ======================================================================
export const editPassword = wrapAsync(async (req, res) => {
  const user_id = req.session.user.id;

  const result = await userServices.editPasswordSerive(req.body, user_id);

  if (result?.error) {
    return sendResponse(res, result.error);
  }

  return sendResponse(res, Responses.editPassword.SUCCESS);
});

// ======================================================================
// 4. ADDRESS PAGE RENDER
// ======================================================================
export const addressPageRender = wrapAsync(async (req, res) => {
  res.render("user/layouts/profilelayout", {
    title: "User Addresses",
    pageCSS: "address",
    view: "address",
    profile: true,
    showHeader: true,
    showFooter: true,
    pageJS: "address.js",
  });
});
// ======================================================================
// 4. ADDRESS ADD
// ======================================================================

export const addressData = wrapAsync(async (req, res) => {
  const user_id = req.session.user.id;

  const addresses = await Address.find({ user_id })
    .sort({ is_default: -1, createdAt: -1 })
    .lean();

  return sendResponse(res, {
    code: 200,
    message: "data retrieved successfully",
    data: {
      addresses,
    },
  });
});

// ======================================================================
// 4. ADDRESS ADD
// ======================================================================

export const addAddress = wrapAsync(async (req, res) => {
  const { error, value } = addressValidators.validate(req.body);

  if (error) {
    return sendResponse(res, {
      code: 400,
      message: error.details[0].message,
    });
  }

  const user_id = req.session.user.id;

  if (value.is_default) {
    await Address.updateMany({ user_id }, { $set: { is_default: false } });
  }

  await Address.create({
    ...value,
    user_id,
  });

  return sendResponse(res, Responses.addAddress.ADDRESS_ADDED);
});

// ======================================================================
// 4. ADDRESS DELETE
// ======================================================================

export const removeAddress = wrapAsync(async (req, res) => {
  const { id } = req.body;

  await Address.findOneAndDelete({ _id: id });

  return sendResponse(res, Responses.removeAddress.REMOVED);
});

// ======================================================================
// 5.  EDIT ADDRESS
// ======================================================================

export const editAddress = wrapAsync(async (req, res) => {
  const addressId = new ObjectId(req.params.id);
  const user_id = req.session.user.id;

  const { error, value } = addressValidators.validate(req.body);

  if (error) {
    return sendResponse(res, {
      code: 400,
      message: error.details[0].message,
    });
  }

  if (value.is_default) {
    await Address.updateMany({ user_id }, { $set: { is_default: false } });
  }

  const result = await Address.updateOne(
    { _id: addressId, user_id },
    {
      $set: {
        ...value,
        user_id,
      },
    },
  );

  if (result.matchedCount === 0) {
    return sendResponse(res, {
      code: 404,
      message: "Address not found",
    });
  }

  return sendResponse(res, Responses.editAddress.ADDRESS_EDITED);
});

// ======================================================================
// 6. CHECKOUT PAGE
// ======================================================================

export const checkoutPage = wrapAsync(async (req, res) => {
  const user_id = req.session.user.id;
  let items = [];
  const shippingCharge = userConstants.SHIPPING_CHARGE;

  const cart = await Cart.findOne({ user_id });

  if (!cart || cart.items.length === 0) {
    return res.redirect("/user/cart");
  }

  items = cart.items;

  const { checkoutItems, warning } = await buildCheckoutItems(items);

  const products = await applyOffer(checkoutItems);

  const subtotal = products.reduce((sum, item) => sum + item.subtotal, 0);

  const gstAmount = await gstCalculator(products);

  const total = subtotal + shippingCharge + gstAmount;

  const addresses = await Address.find({ user_id })
    .sort({
      is_default: -1,
      created_at: -1,
    })
    .lean();

  let wallet = await Wallet.findOne({ user: user_id });
  if (!wallet) {
    wallet = await Wallet.create({
      user: user_id,
    });
  }

  const coupons = await couponChecks.checkCoupon(user_id, subtotal);

  res.render("user/pages/checkout", {
    pageCSS: "checkout",
    pageJS: "checkout.js",
    title: "Checkout",
    items: products,
    addresses,
    subtotal,
    gstAmount,
    wallet,
    coupons,
    shippingCharge,
    total,
    warning,
    showHeader: true,
    showFooter: true,
  });
});

// ======================================================================
// 6. APPLY COUPON
// ======================================================================

export const applyCoupon = wrapAsync(async (req, res) => {
  const user_id = req.session.user.id;
  const { code } = req.body;
  let items = [];

  const cart = await Cart.findOne({ user_id });

  if (!cart || cart.items.length === 0) {
    return res.redirect("/user/cart");
  }

  items = cart.items;

  const { checkoutItems, warning } = await buildCheckoutItems(items);

  const products = await applyOffer(checkoutItems);

  const subtotal = products.reduce((sum, item) => sum + item.subtotal, 0);

  const result = await couponChecks.couponApply(user_id, code, subtotal);

  if (result?.error) {
    return sendResponse(res, result.error);
  }

  const gstAmount = await gstCalculator(products);

  const total = result.finalAmount + userConstants.SHIPPING_CHARGE + gstAmount;

  return sendResponse(res, {
    code: 200,
    message: "Coupon Applied succussfully",
    data: { coupon: result, total },
  });
});

// ======================================================================
// 6. ADD TO CART
// ======================================================================
export const addToCart = wrapAsync(async (req, res) => {
  const user_id = req.session.user.id;
  const { product_id, variant_id, quantity } = req.body;

  const result = await userServices.addToCartService(
    product_id,
    variant_id,
    quantity,
    user_id,
  );

  if (result?.error) {
    return sendResponse(res, result.error);
  }

  return sendResponse(res, {
    code: 200,
    message: "Item added to cart",
    data: {
      items_count: result.items_count,
    },
  });
});
// ======================================================================
// 6. CHECKOUT RECHECKING THE CART PRODUCT BEFORE THE CHECKOUT
// ======================================================================
export const proceedToCheckout = wrapAsync(async (req, res) => {
  const user_id = req.session.user.id;

  const cart = await Cart.findOne({ user_id });

  if (!cart || cart.items.length === 0) {
    return sendResponse(res, Responses.cartCheck.EMPTY_CART);
  }
  const { checkoutItems, warning } = await buildCheckoutItems(cart.items);

  if (warning.length > 0) {
    return sendResponse(res, {
      code: 200,
      message: "Some Products are not available",
      data: { warnings: warning },
    });
  }

  req.session.checkoutIntent = {
    type: "cart",
    createdAt: Date.now(),
  };

  return sendResponse(res, Responses.cartCheck.SUCCESS);
});

// ======================================================================
// 6. CART ITEM REMOVE
// ======================================================================
export const deleteCartItem = wrapAsync(async (req, res) => {
  const user_id = req.session.user.id;

  const result = await userServices.deleteCartItemService({
    ...req.body,
    user_id,
  });

  if (result?.error) {
    return sendResponse(res, result.error);
  }

  return sendResponse(res, {
    code: 200,
    message: "Item removed from cart",
    data: {
      subtotal: result.subtotal,
      total: result.total,
      items_count: result.items_count,
    },
  });
});

// ======================================================================
// 6. USER LOGOUT
// ======================================================================
export const userLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log("User logout error:", err);
    }

    res.clearCookie("user.sid", { path: "/" });

    return res.redirect("/");
  });
};

// ======================================================================
// 6. ORDER SUCCESS
// ======================================================================

export const orderSuccess = wrapAsync(async (req, res) => {
  const orderId = req.session.orderId;
  const user_id = req.session.user.id;
  delete req.session.orderid;

  const order = await Order.findOne({
    _id: orderId,
    user_id,
  }).select("orderId createdAt totalPrice");

  const user = await User.findById(user_id).select("email");

  const details = {
    time: new Date(order.createdAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    id: order._id,
    orderId: order.orderId,
    total: order.totalPrice,
    email: user.email,
  };

  res.render("user/pages/paymentsuccess", {
    title: "Order Success",
    pageJS: "paymentsuccess.js",
    pageCSS: "paymentsuccess",
    details,
    showFooter: false,
    showHeader: false,
  });
});

//
//
//

export const orderFailed = (req, res) => {
  delete req.session.orderid;
  res.render("user/pages/paymentfailed", {
    title: "Order Failed",
    pageJS: "",
    pageCSS: "paymentfailed",
    showFooter: false,
    showHeader: false,
  });
};

// ======================================================================
// 6. PLACE ORDER
// ======================================================================

export const placeOrder = wrapAsync(async (req, res) => {
  const user_id = req.session.user.id;

  const result = await userServices.placeOrderService({ ...req.body, user_id });

  if (result?.error) {
    return sendResponse(res, result.error);
  }

  if (result.success) {
    if (result.paymentMethod === "Razorpay") {
      req.session.pendingOrderId = result.orderId;
      req.session.orderId = result.orderId;
      return sendResponse(res, {
        code: 200,
        message: "paying through razorpay",
        data: { ...result.razorpay, paymentMethod: result.paymentMethod },
      });
    }

    req.session.orderId = result.orderId;

    return sendResponse(res, {
      ...Responses.placeOrder.SUCCESS,
      data: { paymentMethod: result.paymentMethod },
    });
  }
});

// ======================================================================
// 6. ORDER LISTING PAGE
// ======================================================================

export const orderPayVerify = wrapAsync(async (req, res) => {
  const user_id = req.session.user.id;
  const orderId = req.session.pendingOrderId;
  delete req.session.pendingOrderId;

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return sendResponse(res, Responses.razorpayOrderVerify.PAYMENT_FAILED);
  }

  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_TESTKEYSECRET)
    .update(sign)
    .digest("hex");

  if (expected !== razorpay_signature) {
    return sendResponse(res, Responses.razorpayOrderVerify.PAYMENT_FAILED);
  }

  const order = await Order.findOne({
    _id: orderId,
    user_id,
    "razorpay.orderId": razorpay_order_id,
  });

  if (!order) {
    return sendResponse(res, Responses.razorpayOrderVerify.PAYMENT_FAILED);
  }

  // ── Transaction ───────────────────────────────────────────────────────────
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Update order status
    await Order.updateOne(
      { _id: order._id },
      {
        paymentStatus: "Paid",
        orderStatus: "Placed",
        paidAt: new Date(),
        "razorpay.paymentId": razorpay_payment_id,
        "razorpay.signature": razorpay_signature,
      },
      { session },
    );

    // Release lock — stock already deducted at place order
    for (const item of order.products) {
      await Variant.updateOne(
        { _id: item.variant_id },
        { $inc: { lockedStock: -item.quantity } },
        { session },
      );
    }

    // Apply coupon usage
    if (order.is_couponed) {
      const couponUsage = await couponChecks.applyCouponUsage(
        order.coupon.code,
        user_id,
        session,
      );
      if (couponUsage?.error) {
        await session.abortTransaction();
        session.endSession();
        return sendResponse(res, couponUsage.error);
      }
    }

    // Clear cart
    await Cart.deleteOne({ user_id }, { session });

    await session.commitTransaction();
    session.endSession();

    return sendResponse(res, Responses.razorpayOrderVerify.SUCCESS);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
});

//

//

export const orderPayFailed = wrapAsync(async (req, res) => {
  const user_id = req.session.user.id;
  const orderId = req.session.pendingOrderId;
  delete req.session.pendingOrderId;

  const order = await Order.findOne({
    _id: orderId,
    user_id,
    orderStatus: "Pending",
    paymentStatus: "Pending",
  });

  if (!order)
    return sendResponse(res, { code: 404, message: "Order not found" });

  // Release locked stock
  for (const item of order.products) {
    await Variant.updateOne(
      { _id: item.variant_id },
      { $inc: { stock: +item.quantity, lockedStock: -item.quantity } },
    );
  }

  // Mark order as failed
  await Order.updateOne(
    { _id: order._id },
    { orderStatus: "Failed", paymentStatus: "Failed" },
  );

  return sendResponse(res, {
    code: 200,
    message: "Razorpay payment Failed",
    redirectToFrontend: "/user/order/failed",
  });
});

//
//
//

export const orderListingPage = (req, res) => {
  res.render("user/layouts/profilelayout", {
    title: "User Orders",
    pageCSS: "order",
    view: "order",
    profile: true,
    showHeader: true,
    showFooter: true,
    pageJS: "order.js",
  });
};

// ======================================================================
// 6. ORDER LISTING PAGE
// ======================================================================

export const orderListingData = wrapAsync(async (req, res) => {
  const { page } = req.query;
  const user_id = req.session.user.id;

  const result = await paginate(Order, page, 5, { user_id });

  return sendResponse(res, {
    code: 200,
    message: "Orders rendered successfully",
    data: { orders: result.data, pagination: result.meta },
  });
});

// ======================================================================
// 6. ORDER DETAILS PAGE
// ======================================================================

export const orderDetailsPage = wrapAsync(async (req, res) => {
  const id = req.params.id;

  const order = await Order.findById(id);

  res.render("user/pages/orderDetails", {
    title: "Order details",
    pageCSS: "orderDetails",
    profile: true,
    order,
    showHeader: true,
    showFooter: true,
    pageJS: "orderDetails.js",
  });
});

// ======================================================================
// 6. DOWNLOAD INVOICE
// ======================================================================

export const downloadInvoice = wrapAsync(async (req, res) => {
  const user_id = req.session.user.id;
  const orderId = req.params.orderId;

  const order = await Order.findOne({
    orderId,
    user_id,
  });

  if (!order) {
    return res.status(404).json({
      message: "Order not found",
    });
  }

  generateInvoice(order, res);
});

// ======================================================================
// 6. ORDER CANCELLATION
// ======================================================================

export const orderCancelReturn = wrapAsync(async (req, res) => {
  const user_id = req.session.user.id;

  const { orderId, action, reason, items = [] } = req.body;

  const result = await userServices.orderCancelReturnService(
    user_id,
    orderId,
    action,
    reason,
    items,
  );

  if (result?.error) {
    return sendResponse(res, result.error);
  }

  if (result?.success) {
    return sendResponse(res, result.success);
  }
});

/* =================================
   WALLET PAGE RENDER
================================= */

export const walletPage = (req, res) => {
  res.render("user/layouts/profilelayout", {
    view: "wallet",
    profile: true,
    title: "Wallet",
    pageCSS: "wallet",
    showHeader: true,
    showFooter: true,
    pageJS: "wallet.js",
  });
};

/* =================================
   WALLET PAGE DATA
================================= */

export const walletData = wrapAsync(async (req, res) => {
  const user_id = req.session.user.id;
  const page = req.query.page || 1;

  let wallet = await Wallet.findOne({ user: user_id }).lean();

  if (!wallet) {
    wallet = await Wallet.create({ user: user_id });
  }

  const filter = { wallet: wallet._id, user: user_id };

  const pagination = await paginate(WalletTransaction, page, 6, filter);

  return sendResponse(res, {
    code: 200,
    message: "wallet data successfully got",
    data: {
      balance: wallet.balance,
      transactions: pagination.data,
      pagination: pagination.meta,
    },
  });
});

/* ==============================
   CREATE WALLET ORDER
============================== */

export const walletTopupOrder = wrapAsync(async (req, res) => {
  const { amount } = req.body;
  const user_id = req.session.user.id;

  if (!amount || amount < 100) {
    return sendResponse(res, Responses.walletPayment.INVALID_AMOUNT);
  }

  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(amount * 100), // paise
    currency: "INR",
    receipt: `wallet_${user_id}`,
  });

  if (!razorpayOrder) {
    return sendResponse(res, Responses.walletPayment.ORDER_FAILED);
  }

  await walletHandler.creditWallet(
    user_id,
    amount,
    "PENDING",
    "Wallet Top-up",
    razorpayOrder.id,
  );

  return sendResponse(res, {
    code: 200,
    message: "Order created",
    data: {
      key: process.env.RAZORPAY_KEY,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: "INR",
      name: "JerseyGarage",
      description: "Wallet Top-up",
    },
  });
});

/* ==============================
   VERIFY WALLET PAYMENT
============================== */

export const verifyWalletTopup = wrapAsync(async (req, res) => {
  const user_id = req.session.user.id;

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return sendResponse(res, Responses.walletPayment.PAYMENT_FAILED);
  }

  const sign = razorpay_order_id + "|" + razorpay_payment_id;

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_TESTKEYSECRET)
    .update(sign)
    .digest("hex");

  if (expected !== razorpay_signature) {
    return sendResponse(res, Responses.walletPayment.PAYMENT_FAILED);
  }

  const wallet = await Wallet.findOne({ user: user_id });

  if (!wallet) {
    return sendResponse(res, Responses.walletPayment.PAYMENT_FAILED);
  }

  const transaction = await WalletTransaction.findOne({
    wallet: wallet._id,
    user: wallet.user,
    "razorpay.orderId": razorpay_order_id,
  });

  if (!transaction) {
    return sendResponse(res, Responses.walletPayment.PAYMENT_FAILED);
  }

  if (transaction.status !== "PENDING") {
    return sendResponse(res, {
      code: 409,
      message: "Wallet top-up already processed",
    });
  }

  wallet.balance += transaction.amount;

  transaction.status = "SUCCESS";
  transaction.razorpay.paymentId = razorpay_payment_id;
  transaction.razorpay.signature = razorpay_signature;

  await wallet.save();
  await transaction.save();

  return sendResponse(res, Responses.walletPayment.SUCCESS);
});

//

//

export const referralPage = wrapAsync(async (req, res) => {
  const user_id = req.session.user.id;

  const referredUsers = await User.find({ referred_by: user_id }).select(
    "full_name createdAt",
  );

  const totalEarned = referredUsers.length * userConstants.REFERRAL_BONUS;

  res.render("user/layouts/profilelayout", {
    title: "Referral details",
    pageCSS: "referral",
    view: "referral",
    profile: true,
    referredUsers,
    totalEarned,
    referralBonus: userConstants.REFERRAL_BONUS,
    showHeader: true,
    showFooter: true,
    pageJS: "referral.js",
  });
});

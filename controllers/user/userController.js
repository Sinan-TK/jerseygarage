import wrapAsync from "../../utils/wrapAsync.js";
import * as userValidators from "../../validators/userValidators.js";
import * as Responses from "../../utils/responses/user/user.response.js";
import sendResponse from "../../utils/sendResponse.js";
import addressValidators from "../../validators/addressValidators.js";
import User from "../../models/userModel.js";
import Address from "../../models/addressModel.js";
import Wishlist from "../../models/wishlistModel.js";
import Variant from "../../models/varientModel.js";
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
import * as userConstants from "../../constants/userConstants.js";
import * as userServices from "../../services/user/userServices.js";
import * as walletHandler from "../../utils/walletHandler.js";
import crypto from "crypto";

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
    products: checkoutItems,
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

  const result = await userServices.cartQuantityService(cart, { ...req.body });

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
// 5. WISHLIST PAGE RENDER
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
// 5. WISHLIST PAGE RENDER
// ======================================================================
export const wishlistRender = wrapAsync(async (req, res) => {
  const user_id = new ObjectId(req.session.user.id);

  const wishlist = await Wishlist.findOne({ user_id })
    .populate({
      path: "items.variant_id",
      populate: {
        path: "product_id",
        select: "name images teamName",
      },
    })
    .lean();

  const items = wishlist ? wishlist.items : [];

  res.render("user/layouts/profilelayout", {
    title: "User Wishlist",
    pageCSS: "wishlist",
    view: "wishlist",
    products: items,
    profile: true,
    showHeader: true,
    showFooter: true,
    pageJS: "wishlist.js",
  });
});

// ======================================================================
// 5. WISHLIST --> PRODUCT ADDING
// ======================================================================

export const addWishlist = wrapAsync(async (req, res) => {
  const { variantId } = req.body;
  const user_id = req.session.user.id;
  const variant_Id = new ObjectId(variantId);

  const exists = await Wishlist.exists({
    user_id,
    "items.variant_id": variant_Id,
  });

  if (exists) {
    await Wishlist.updateOne(
      { user_id },
      { $pull: { items: { variant_id: variant_Id } } },
    );

    return sendResponse(res, Responses.addWishlist.ALREADY_EXIST);
  }

  await Wishlist.findOneAndUpdate(
    { user_id },
    { $addToSet: { items: { variant_id: variant_Id } } },
    { upsert: true },
  );

  return sendResponse(res, Responses.addWishlist.PRODUCT_ADDED);
});

// ======================================================================
// 6. REMOVE ITEM FROM WISHLIST
// ======================================================================

export const removeWishlist = wrapAsync(async (req, res) => {
  const id = new ObjectId(req.params.id);
  const user_id = req.session.user.id;

  await Wishlist.updateOne(
    { user_id },
    {
      $pull: {
        items: { variant_id: id },
      },
    },
  );

  return sendResponse(res, Responses.removeWishlist.REMOVED);
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

  const subtotal = checkoutItems.reduce((sum, item) => sum + item.subtotal, 0);

  const total = subtotal + shippingCharge;

  const addresses = await Address.find({ user_id })
    .sort({
      is_default: -1,
      created_at: -1,
    })
    .lean();

  res.render("user/pages/checkout", {
    pageCSS: "checkout",
    pageJS: "checkout.js",
    title: "Checkout Page",
    items: checkoutItems,
    addresses,
    subtotal,
    total,
    warning,
    showHeader: true,
    showFooter: true,
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
      code: 409,
      message: warning.join(""),
      data: { warn: true },
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
    title: "Payment Success",
    pageJS: "paymentsuccess.js",
    pageCSS: "paymentsuccess",
    details,
    showFooter: false,
    showHeader: false,
  });
});

// ======================================================================
// 6. PLACE ORDER
// ======================================================================

export const placeOrder = wrapAsync(async (req, res) => {
  const user_id = req.session.user.id;

  const { addressId, paymentMethod, paymentResult } = req.body;

  const result = await userServices.placeOrderService({ ...req.body, user_id });

  if (result?.error) {
    return sendResponse(res, result.error);
  }

  req.session.orderId = result.orderId;

  return sendResponse(res, Responses.placeOrder.SUCCESS);
});

// ======================================================================
// 6. ORDER LISTING PAGE
// ======================================================================

export const orderListingPage = wrapAsync(async (req, res) => {
  const user_id = req.session.user.id;

  const orders = await Order.find({ user_id })
    .select("orderId createdAt products totalPrice orderStatus")
    .sort({ createdAt: -1 });

  res.render("user/layouts/profilelayout", {
    title: "User orders",
    pageCSS: "order",
    view: "order",
    profile: true,
    showHeader: true,
    orders,
    showFooter: true,
    pageJS: "",
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
    return sendResponse(res, res.success);
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
  const wallet = await Wallet.findOne({ user: user_id }).lean();

  if (!wallet) {
    return sendResponse(res, {
      code: 404,
      message: "There is wallet for the user",
    });
  }

  if (wallet && wallet.transactions) {
    wallet.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  return sendResponse(res, {
    code: 200,
    message: "wallet data successfully got",
    data: wallet,
  });
});

/* ==============================
   CREATE WALLET ORDER
============================== */

export const walletTopupOrder = wrapAsync(async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount < 100) {
    return sendResponse(res, Responses.walletPayment.INVALID_AMOUNT);
  }

  const order = await razorpay.orders.create({
    amount: amount * 100,
    currency: "INR",
    receipt: "wallet_" + Date.now(),
  });

  if (!order) {
    return sendResponse(res, Responses.walletPayment.ORDER_FAILED);
  }

  return sendResponse(res, {
    code: 200,
    message: "Order created",
    data: order,
  });
});

/* ==============================
   VERIFY WALLET PAYMENT
============================== */

export const verifyWalletTopup = wrapAsync(async (req, res) => {
  const user_id = req.session.user.id;

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } =
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

  await walletHandler.creditWallet(user_id, Number(amount), "Wallet Top-up");

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

import wrapAsync from "../../utils/wrapAsync.js";
import { personalInfo } from "../../validators/userValidators.js";
import * as Responses from "../../utils/responses/user/user.response.js";
import sendResponse from "../../utils/sendResponse.js";
import addressValidators from "../../validators/addressValidators.js";
import User from "../../models/userModel.js";
import Address from "../../models/addressModel.js";
import Wishlist from "../../models/wishlistModel.js";
import Variant from "../../models/varientModel.js";
import Cart from "../../models/cartModel.js";
import Product from "../../models/productModel.js";
import { generateOrderId } from "../../utils/generateOrderId.js";
import Order from "../../models/orderModel.js";
import { ObjectId } from "mongodb";
import { buildCheckoutItems } from "../../utils/buildCheckoutItems.js";
import generateInvoice from "../../utils/generateInvoice.js";
import bcrypt from "bcrypt";

// ======================================================================
// 1. CART PAGE RENDER
// ======================================================================
export const cartRender = wrapAsync(async (req, res) => {
  const user_id = req.session.user.id;

  const cart = await Cart.findOne({ user_id });

  if (!cart || cart.length) {
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

  const shippingCharge = 50;

  const priceDetails = {
    subtotal: cart.total_amount,
    total: shippingCharge + cart.total_amount,
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
  const { variant_id, value, quantity } = req.body;
  const shippingCharge = 50;

  if (!variant_id || !["plus", "minus"].includes(value)) {
    return sendResponse(res, Responses.cartQuantity.INVALID);
  }

  const cart = await Cart.findOne({ user_id });

  if (!cart) {
    return sendResponse(res, Responses.cartQuantity.CART_NOT_FOUND);
  }

  const item = cart.items.find((i) => i.variant_id.toString() === variant_id);

  const itemVariant = await Variant.findById(variant_id);

  if (!item) {
    return sendResponse(res, Responses.cartQuantity.ITEM_NOT_FOUND);
  }

  if (value === "plus") {
    if (itemVariant.stock > item.quantity) {
      item.quantity += 1;
    } else {
      return sendResponse(res, Responses.cartQuantity.STOCK_OUT);
    }
  }

  if (value === "minus") {
    if (item.quantity === 1 || parseInt(quantity) === 1) {
      return sendResponse(res, Responses.cartQuantity.QUANTITY_ZERO);
    } else {
      item.quantity -= 1;
    }
  }

  let total = 0;
  let itemTotal = 0;
  for (const cartItem of cart.items) {
    const variant = await Variant.findById(cartItem.variant_id);
    if (variant._id.toString() === variant_id) {
      itemTotal = variant.base_price * cartItem.quantity;
    }
    total += variant.base_price * cartItem.quantity;
  }

  cart.total_amount = total;
  await cart.save();

  return sendResponse(res, {
    code: 200,
    message: "Quantity changed successfully",
    data: {
      quantity: item?.quantity || 0,
      itemTotal,
      subtotal: cart.total_amount,
      total: shippingCharge + cart.total_amount,
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
  const { error } = personalInfo.validate(req.body);

  if (error) {
    return sendResponse(res, {
      code: 400,
      message: error.details[0].message,
    });
  }

  const { fullName, email, phoneNo } = req.body;

  const user = await User.findById(req.session.user.id);

  const result = await User.findByIdAndUpdate(
    user._id,
    { $set: { full_name: fullName, phone_no: phoneNo } },
    { new: true },
  );

  const matchMail = await User.findOne({
    email: email,
    _id: { $ne: user._id },
  });

  if (matchMail) {
    return sendResponse(res, Responses.personalInfoEdit.EMAIL_EXIST);
  }

  if (user.email != email) {
    return sendResponse(res, Responses.personalInfoEdit.EMAIL_CHANGE);
  }
});

// ======================================================================
// 4. EMAIL OTP VERIFICATION PAGE RENDER
// ======================================================================
export const editPassword = wrapAsync(async (req, res) => {

  const user_id = req.session.user.id;

  const {
    currentPassword,
    newPassword,
    confirmPassword,
  } = req.body;


  if (!currentPassword || !newPassword || !confirmPassword) {
    return sendResponse(res, {
      code: 400,
      message: "All fields are required",
    });
  }

  if (newPassword.length < 6) {
    return sendResponse(res, {
      code: 400,
      message: "Password must be at least 6 characters",
    });
  }

  if (newPassword !== confirmPassword) {
    return sendResponse(res, {
      code: 400,
      message: "New passwords do not match",
    });
  }

  /* =========================
     FIND USER
  ========================= */

  const user = await User.findById(user_id);

  if (!user) {
    return sendResponse(res, {
      code: 404,
      message: "User not found",
    });
  }

  /* =========================
     VERIFY CURRENT PASSWORD
  ========================= */

  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    return sendResponse(res, {
      code: 400,
      message: "Current password is incorrect",
    });
  }

  /* =========================
     UPDATE PASSWORD
  ========================= */

  // Prevent same password reuse (optional but good)
  const isSame = await user.comparePassword(newPassword);

  if (isSame) {
    return sendResponse(res, {
      code: 400,
      message: "New password must be different",
    });
  }

  // Set new password (will be hashed in pre-save hook)
  user.password = newPassword;

  await user.save();

  /* =========================
     RESPONSE
  ========================= */

  return sendResponse(res, {
    code: 200,
    message: "Password updated successfully",
  });
});


// ======================================================================
// 4. ADDRESS PAGE RENDER
// ======================================================================
export const addressPageRender = wrapAsync(async (req, res) => {
  // const user_id = req.session.user.id;

  // const addresses = await Address.find({ user_id })
  //   .sort({ is_default: -1, createdAt: -1 })
  //   .lean();

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

  // If setting this address as default → unset others
  if (value.is_default) {
    await Address.updateMany({ user_id }, { $set: { is_default: false } });
  }

  // ✅ Update ONLY the selected address
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
        select: "name images teamName", // populate product from variant
      },
    })
    .lean();

  // Safe fallback
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
  const shippingCharge = 50;

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

  if (!variant_id || !quantity || quantity < 1) {
    return sendResponse(res, Responses.addToCart.INVALID);
  }

  const variant = await Variant.findById(variant_id);

  if (!variant || !variant.is_available) {
    let size = "This";
    return sendResponse(res, {
      code: 404,
      message: `${variant.size} is not available`,
    });
  }

  if (variant.stock < quantity) {
    return sendResponse(res, {
      code: 400,
      message: `Only ${variant.stock} items left in stock`,
    });
  }

  let cart = await Cart.findOne({ user_id });

  if (!cart) {
    cart = new Cart({ user_id, items: [] });
  }

  const existingItem = cart.items.find(
    (item) => item.variant_id.toString() === variant_id,
  );

  if (existingItem) {
    const newQty = existingItem.quantity + quantity;

    if (newQty > variant.stock) {
      return sendResponse(res, {
        code: 400,
        message: `Only ${variant.stock} items left in stock`,
      });
    }

    existingItem.quantity = newQty;
  } else {
    cart.items.push({ product_id, variant_id, quantity });
  }

  let total = 0;

  for (const item of cart.items) {
    const v = await Variant.findById(item.variant_id);
    total += v.base_price * item.quantity;
  }

  const items_count = cart.items.length;

  cart.total_amount = total;
  await cart.save();

  return sendResponse(res, {
    code: 200,
    message: "Item added to cart",
    data: {
      items_count,
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
  const { variant_id } = req.body;
  const shippingCharge = 50;

  if (!variant_id) {
    return sendResponse(res, {
      code: 400,
      message: "Variant ID is required",
    });
  }

  const cart = await Cart.findOne({ user_id });

  if (!cart) {
    return sendResponse(res, {
      code: 404,
      message: "Cart not found",
    });
  }

  // Check if item exists
  const itemExists = cart.items.some(
    (item) => item.variant_id.toString() === variant_id,
  );

  if (!itemExists) {
    return sendResponse(res, {
      code: 404,
      message: "Item not found in cart",
    });
  }

  // Remove item
  cart.items = cart.items.filter(
    (item) => item.variant_id.toString() !== variant_id,
  );

  // Recalculate total
  let total = 0;
  for (const item of cart.items) {
    const variant = await Variant.findById(item.variant_id);
    total += variant.base_price * item.quantity;
  }

  cart.total_amount = total;
  await cart.save();

  return sendResponse(res, {
    code: 200,
    message: "Item removed from cart",
    data: {
      subtotal: cart.total_amount,
      total: shippingCharge + cart.total_amount,
      items_count: cart.items.length,
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
// 6. PAYMENT SUCCESS
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

  if (!addressId) {
    return sendResponse(res, {
      code: 400,
      message: "Shipping address is required",
    });
  }

  if (!paymentMethod) {
    return sendResponse(res, {
      code: 400,
      message: "Payment method is required",
    });
  }

  const cart = await Cart.findOne({ user_id });

  if (!cart || cart.items.length === 0) {
    return sendResponse(res, {
      code: 400,
      message: "Your cart is empty",
    });
  }

  const address = await Address.findOne({
    _id: addressId,
    user_id,
  });

  if (!address) {
    return sendResponse(res, {
      code: 404,
      message: "Shipping address not found",
    });
  }

  const { checkoutItems, warning } = await buildCheckoutItems(cart.items);

  if (warning.length > 0) {
    return sendResponse(res, {
      code: 409,
      message: "Some items are unavailable",
      data: { warning },
    });
  }

  if (!checkoutItems.length) {
    return sendResponse(res, {
      code: 400,
      message: "No valid items in cart",
    });
  }

  const itemsPrice = checkoutItems.reduce(
    (sum, item) => sum + item.subtotal,
    0,
  );

  const shippingCharge = 50;

  const totalPrice = itemsPrice + shippingCharge;

  let paymentStatus = "Pending";
  let paidAt = null;

  // Online payment
  if (paymentMethod !== "COD") {
    if (!paymentResult?.id) {
      return sendResponse(res, {
        code: 400,
        message: "Payment verification failed",
      });
    }

    //  In real apps → verify with gateway here

    paymentStatus = "Paid";
    paidAt = Date.now();
  }

  const products = checkoutItems.map((item) => {
    return {
      name: item.name,
      product_id: item.product_id,
      size: item.size,
      quantity: item.quantity,
      price: item.unit_price,
      subtotal: item.subtotal,
      image: item.image,
      variant_id: item.variant_id,
      subtotal: item.subtotal,
    };
  });

  const orderId = await generateOrderId();

  const order = await Order.create({
    orderId,

    user_id,

    products,

    shippingAddress: {
      full_name: address.full_name,
      phone_no: address.phone_no,
      address_line: address.address_line,
      city: address.city,
      state: address.state,
      zip_code: address.zip_code,
      country: address.country,
    },

    paymentMethod,
    paymentStatus,
    paidAt,

    itemsPrice,
    shippingCharge,
    totalPrice,

    orderStatus: "Placed",
  });

  for (const item of checkoutItems) {
    await Variant.updateOne(
      { _id: item.variant_id },
      { $inc: { stock: -item.quantity } },
    );
  }

  await Cart.deleteOne({ user_id });

  req.session.orderId = order._id;

  return sendResponse(res, {
    code: 201,
    message: "Order placed successfully",
    redirectToFrontend: "/user/order/success",
  });
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

  // Get order
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

export const orderCancelReturn = wrapAsync(async (req, res) => {
  const user_id = req.session.user.id;

  const { orderId, action, reason, items = [] } = req.body;

  console.log(req.body);

  /* =========================
     BASIC VALIDATION
  ========================= */
  if (!reason) {
    return sendResponse(res, {
      code: 400,
      message: "Please enter the reason",
    });
  }

  if (
    (action === "partial-cancel" || action === "partial-return") &&
    items.length === 0
  ) {
    return sendResponse(res, {
      code: 400,
      message: "Please select the item",
    });
  }

  if (!orderId || !action) {
    return sendResponse(res, {
      code: 400,
      message: "Missing required fields",
    });
  }

  /* =========================
     FETCH ORDER
  ========================= */

  const order = await Order.findOne({
    orderId,
    user_id,
  });

  if (!order) {
    return sendResponse(res, {
      code: 404,
      message: "Order not found",
    });
  }

  const isDelivered = order.orderStatus === "Delivered";

  /* =========================
     ACTION VALIDATION
  ========================= */

  // Cancel only before delivery
  if (action.includes("cancel") && isDelivered) {
    return sendResponse(res, {
      code: 400,
      message: "Delivered orders cannot be cancelled",
    });
  }

  // Return only after delivery
  if (action.includes("return") && !isDelivered) {
    return sendResponse(res, {
      code: 400,
      message: "Order not delivered yet",
    });
  }

  /* =========================
     NORMALIZE ACTION
  ========================= */

  let finalAction = action;

  if (action === "partial-cancel" && items.length === order.products.length) {
    finalAction = "full-cancel";
  }

  if (action === "partial-return" && items.length === order.products.length) {
    finalAction = "full-return";
  }

  /* =========================
     PROCESS CANCEL
  ========================= */

  if (finalAction.includes("cancel")) {
    await handleCancel(order, finalAction, items, reason);

    await order.save();

    return sendResponse(res, {
      code: 200,
      message: "Order cancelled successfully",
    });
  }

  /* =========================
     PROCESS RETURN
  ========================= */

  if (finalAction.includes("return")) {
    await handleReturn(order, finalAction, items, reason);

    await order.save();

    return sendResponse(res, {
      code: 200,
      message: "Return request submitted",
    });
  }

  /* ========================= */

  return sendResponse(res, {
    code: 400,
    message: "Invalid action",
  });
});

/* =================================
   HANDLE CANCEL (AUTO)
================================= */

const handleCancel = async (order, action, items, reason) => {
  let refund = 0;
  let cancelledCount = 0;

  const historyItems = [];

  for (const item of order.products) {
    if (item.status !== "Active") continue;

    // Partial cancel
    if (action === "partial-cancel" && !items.includes(item._id.toString())) {
      continue;
    }

    item.status = "Cancelled";
    item.requestStatus = "Approved";
    item.statusChangedAt = new Date();

    refund += item.price * item.quantity;
    cancelledCount++;

    historyItems.push(item._id);

    // Restore stock
    await Variant.findByIdAndUpdate(item.variant_id, {
      $inc: { stock: item.quantity },
    });
  }

  /* Update order status */

  if (cancelledCount === order.products.length) {
    order.orderStatus = "Cancelled";
  } else if (cancelledCount > 0) {
    order.orderStatus = "Partially-Cancelled";
  }

  /* Save history */

  order.cancelHistory.push({
    items: historyItems,
    reason,
    status: "Approved",
  });

  /* Refund */

  await processRefund(order, refund);
};

/* =================================
   HANDLE RETURN (REQUEST)
================================= */

const handleReturn = async (order, action, items, reason) => {
  let returnCount = 0;

  const historyItems = [];

  for (const item of order.products) {
    if (item.status !== "Active") continue;

    // Partial return
    if (action === "partial-return" && !items.includes(item._id.toString())) {
      continue;
    }

    item.requestStatus = "Pending";
    item.statusChangedAt = new Date();

    returnCount++;

    historyItems.push(item._id);
  }

  /* Update order status (pending return) */

  if (returnCount === order.products.length) {
    order.orderStatus = "Returned";
  } else if (returnCount > 0) {
    order.orderStatus = "PartiallyReturned";
  }

  /* Save history */

  order.returnHistory.push({
    items: historyItems,
    reason,
    status: "Pending",
  });
};

/* =================================
   REFUND HANDLER
================================= */

const processRefund = async (order, amount) => {
  if (order.paymentStatus !== "Paid") return;

  order.refundAmount += amount;

  order.paymentStatus = "Refunded";

  // Payment gateway refund integration later
};

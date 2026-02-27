import Cart from "../../models/cartModel.js";
import User from "../../models/userModel.js";
import Variant from "../../models/variantModel.js";
import Address from "../../models/addressModel.js";
import Order from "../../models/orderModel.js";
import Otp from "../../models/otpModel.js";
import sendResponse from "../../utils/sendResponse.js";
import buildCheckoutItems from "../../utils/buildCheckoutItems.js";
import wrapAsync from "../../utils/wrapAsync.js";
import generateOrderId from "../../utils/generateOrderId.js";
import * as Responses from "../../utils/responses/user/user.response.js";
import * as userValidators from "../../validators/userValidators.js";
import * as userConstants from "../../constants/userConstants.js";
import * as handleReturnCancel from "../../utils/handleReturnCancel.js";
import Wishlist from "../../models/wishlistModel.js";
import * as offerCalculator from "../../utils/offerApply.js";
import gstCalculator from "../../utils/gstCalculator.js";
import * as couponChecks from "../../utils/checkCoupon.js";
import razorpay from "../../config/razorpay.js";
import Wallet from "../../models/walletModel.js";

// ======================================================================
// CART PAGE RENDER
// ======================================================================
export const cartQuantityService = async ({
  cart,
  variant_id,
  value,
  quantity,
}) => {
  if (!variant_id || !["plus", "minus"].includes(value)) {
    return { error: Responses.cartQuantity.INVALID };
  }

  if (!cart) {
    return { error: Responses.cartQuantity.CART_NOT_FOUND };
  }

  const item = cart.items.find((i) => i.variant_id.toString() === variant_id);

  const itemVariant = await Variant.findById(variant_id);

  if (!item) {
    return { error: Responses.cartQuantity.ITEM_NOT_FOUND };
  }

  if (value === "plus") {
    if (itemVariant.stock > item.quantity) {
      item.quantity += 1;
    } else {
      return { error: Responses.cartQuantity.STOCK_OUT };
    }
  }

  if (value === "minus") {
    if (item.quantity === 1 || parseInt(quantity) === 1) {
      return { error: Responses.cartQuantity.QUANTITY_ZERO };
    } else {
      item.quantity -= 1;
    }
  }

  const result = await offerCalculator.checkOfferApply(cart.items, variant_id);

  cart.total_amount = result.total;
  await cart.save();

  return {
    quantity: item?.quantity || 0,
    itemTotal: result.itemTotal,
    subtotal: cart.total_amount,
    total: userConstants.SHIPPING_CHARGE + cart.total_amount,
  };
};

// ======================================================================
// EDIT PERSONAL INFO
// ======================================================================

export const editPersonalInfoService = async ({
  fullName,
  email,
  phoneNo,
  user,
}) => {
  const { error } = userValidators.personalInfo.validate({
    fullName,
    email,
    phoneNo,
  });

  if (error) {
    return {
      error: {
        code: 400,
        message: error.details[0].message,
      },
    };
  }

  const matchMail = await User.findOne({
    email: email,
    _id: { $ne: user._id },
  });

  if (matchMail) {
    return {
      error: Responses.personalInfoEdit.EMAIL_EXIST,
    };
  }

  const result = await User.findByIdAndUpdate(
    user._id,
    { $set: { full_name: fullName, phone_no: phoneNo } },
    { new: true },
  );

  return {
    data: result,
    email,
  };
};

// ======================================================================
// 1. CART PAGE RENDER
// ======================================================================

export const emailVerificationService = async ({
  email,
  purpose,
  otpValue,
  user_id,
}) => {
  const { error } = userValidators.otpSchema.validate({ otpValue });

  if (error) {
    return {
      error: {
        code: 400,
        message: error.details[0].message,
      },
    };
  }

  const otpDoc = await Otp.findOne({ email, purpose, is_used: false });

  if (!otpDoc) {
    return { error: Responses.emailVerify.OTP_EXPIRED };
  }

  if (otpValue !== otpDoc.otp_code) {
    return { error: Responses.emailVerify.INCORRECT };
  }

  otpDoc.is_used = true;
  const user = await User.findById(user_id);

  user.email = email;

  user.save();

  return { success: true };
};

// ======================================================================
// 1. CART PAGE RENDER
// ======================================================================

export const editPasswordSerive = async (body, user_id) => {
  const { error } = userValidators.newPassword.validate(body);

  if (error) {
    return {
      error: {
        code: 400,
        message: error.details[0].message,
      },
    };
  }

  const { currentPassword, newPassword, confirmPassword } = body;

  const user = await User.findById(user_id);

  if (!user) {
    return { error: Responses.editPassword.USER_NOT_FOUND };
  }

  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    return { error: Responses.editPassword.CURRENT_PASS_INCORRECT };
  }

  const isSame = await user.comparePassword(newPassword);

  if (isSame) {
    return { error: Responses.editPassword.SAME_NEW_PASS };
  }

  user.password_hash = newPassword;

  await user.save();

  return { success: true };
};

//

//

export const addToCartService = async (
  product_id,
  variant_id,
  quantityValue,
  user_id,
) => {
  if (!variant_id || !quantityValue || quantityValue < 1) {
    return { error: Responses.addToCart.INVALID };
  }

  const quantity = Number(quantityValue);

  const variant = await Variant.findById(variant_id);

  if (!variant || !variant.is_available) {
    let size = "This";
    return {
      error: {
        code: 404,
        message: `${variant.size} is not available`,
      },
    };
  }

  if (variant.stock < quantity) {
    return {
      error: {
        code: 400,
        message: `Only ${variant.stock} items left in stock`,
      },
    };
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
      return {
        error: {
          code: 400,
          message: `Only ${variant.stock} items left in stock`,
        },
      };
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

  const wishlist = await Wishlist.findOne({ user_id });
  if (!wishlist) return { items_count, success: true };

  wishlist.items = wishlist.items.filter(
    (item) => item.variant_id.toString() !== variant_id.toString(),
  );

  wishlist.save();

  return { items_count, success: true };
};

//

//

export const deleteCartItemService = async ({ variant_id, user_id }) => {
  if (!variant_id) {
    return { error: Responses.deleteCartItem.NO_VARIANT_ID };
  }

  const cart = await Cart.findOne({ user_id });

  if (!cart) {
    return { error: Responses.deleteCartItem.NO_CART };
  }

  const itemExists = cart.items.some(
    (item) => item.variant_id.toString() === variant_id,
  );

  if (!itemExists) {
    return { error: Responses.deleteCartItem.NO_ITEM };
  }

  cart.items = cart.items.filter(
    (item) => item.variant_id.toString() !== variant_id,
  );

  const result = await offerCalculator.deleteCartOffer(cart.items);

  cart.total_amount = result.total;
  await cart.save();

  return {
    subtotal: cart.total_amount,
    total: userConstants.SHIPPING_CHARGE + cart.total_amount,
    items_count: cart.items.length,
  };
};

//

//

export const placeOrderService = async ({
  addressId,
  paymentMethod,
  couponCode,
  user_id,
}) => {
  if (!addressId) {
    return { error: Responses.placeOrder.NO_ADDRESS };
  }

  if (!paymentMethod) {
    return { error: Responses.placeOrder.NO_PAY_METHOD };
  }

  const cart = await Cart.findOne({ user_id });

  if (!cart || cart.items.length === 0) {
    return { error: Responses.placeOrder.EMPTY_CART };
  }

  const address = await Address.findOne({
    _id: addressId,
    user_id,
  });

  if (!address) {
    return { error: Responses.placeOrder.ADDRESS_NOT_FOUND };
  }

  const { checkoutItems, warning } = await buildCheckoutItems(cart.items);

  const items = await offerCalculator.applyOffer(checkoutItems);

  const gstAmount = await gstCalculator(items);

  if (warning.length > 0) {
    return {
      error: {
        code: 409,
        message: "Some items are unavailable",
        data: { warning },
      },
    };
  }

  if (!items.length) {
    return { error: Responses.placeOrder.NO_ITEMS };
  }

  const itemsPrice = items.reduce((sum, item) => sum + item.subtotal, 0);

  let price = itemsPrice;
  let isCouponed = false;
  let coupon = {};

  if (couponCode) {
    const result = await couponChecks.couponApply(user_id, couponCode, price);

    if (result?.error) {
      return sendResponse(res, result.error);
    }
    price = result.finalAmount;
    isCouponed = true;
    coupon = {
      code: result.code,
      discountType: result.discountType,
      discountValue: result.discountValue,
      discountAmount: result.discountAmount,
    };
  }

  const totalPrice = price + userConstants.SHIPPING_CHARGE + gstAmount;

  let paymentStatus = "Pending";
  let paidAt = null;

  if (paymentMethod === "COD" && totalPrice > 500) {
    return {
      error: {
        code: 403,
        message: "Cash on Delivery is not available for orders above ₹500",
      },
    };
  }

  const products = items.map((item) => {
    return {
      name: item.name,
      product_id: item.product_id,
      size: item.size,
      quantity: item.quantity,
      price: item.unit_price,
      subtotal: item.subtotal,
      image: item.image,
      variant_id: item.variant_id,
      gst_rate: item.gst_rate,
      unit_gst: item.unit_gst,
      total_gst: item.total_gst,
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
    shippingCharge: userConstants.SHIPPING_CHARGE,
    totalGST: gstAmount,
    totalPrice,

    is_couponed: isCouponed,
    coupon: isCouponed ? coupon : null,

    orderStatus: paymentMethod === "Razorpay" ? "Pending" : "Placed",
  });

  if (paymentMethod === "Wallet") {
    const wallet = await Wallet.findOne({ user: user_id });

    if (!wallet) {
      return {
        error: {
          code: 404,
          message: "Wallet not found",
        },
      };
    }

    if (wallet.balance < totalPrice) {
      return {
        error: {
          code: 400,
          message: "Insufficient wallet balance",
        },
      };
    }

    wallet.balance -= totalPrice;

    wallet.transactions.push({
      type: "debit",
      amount: totalPrice,
      reason: "Order Payment",
      orderId: order._id, // internal order reference
      status: "SUCCESS",
    });

    wallet.save();
  }

  if (order.paymentMethod === "Razorpay") {
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.totalPrice * 100), // paise
      currency: "INR",
      receipt: order.orderId,
    });

    order.razorpay = {
      orderId: razorpayOrder.id,
    };
    await order.save();

    return {
      success: true,
      paymentMethod: "Razorpay",
      razorpay: {
        key: process.env.RAZORPAY_KEY,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: "INR",
        name: "JerseyGarage",
        description: "Order Payment",
      },
      orderId: order._id,
    };
  }

  if (isCouponed) {
    const couponUsage = await couponChecks.applyCouponUsage(
      couponCode,
      user_id,
    );

    if (couponUsage?.error) {
      return { error: couponUsage.error };
    }
  }

  for (const item of items) {
    await Variant.updateOne(
      { _id: item.variant_id },
      { $inc: { stock: -item.quantity } },
    );
  }

  await Cart.deleteOne({ user_id });

  return {
    success: true,
    paymentMethod,
    orderId: order._id,
  };
};

//

//

export const orderCancelReturnService = async (
  user_id,
  orderId,
  action,
  reason,
  items,
) => {
  if (!reason) {
    return { error: Responses.orderCancelReturn.NO_REASON };
  }

  if (
    (action === "partial-cancel" || action === "partial-return") &&
    items.length === 0
  ) {
    return { error: Responses.orderCancelReturn.NO_ITEMS };
  }

  if (!orderId || !action) {
    return { error: Responses.orderCancelReturn.MISSING_FIELDS };
  }

  const order = await Order.findOne({
    orderId,
    user_id,
  });

  if (!order) {
    return { error: Responses.orderCancelReturn.NO_ORDER };
  }

  const isDelivered = order.orderStatus === "Delivered";

  if (action.includes("cancel") && isDelivered) {
    return { error: Responses.orderCancelReturn.NO_ORDER };
  }

  if (action.includes("return") && !isDelivered) {
    return { error: Responses.orderCancelReturn.NO_RETURN };
  }

  let finalAction = action;

  if (action === "partial-cancel" && items.length === order.products.length) {
    finalAction = "full-cancel";
  }

  if (action === "partial-return" && items.length === order.products.length) {
    finalAction = "full-return";
  }

  if (finalAction.includes("cancel")) {
    await handleReturnCancel.handleCancel(order, finalAction, items, reason);

    await order.save();

    return { success: Responses.orderCancelReturn.CANCEL_SUCCESS };
  }

  if (finalAction.includes("return")) {
    await handleReturnCancel.handleReturn(order, finalAction, items, reason);

    await order.save();
    return { success: Responses.orderCancelReturn.RETURN_SUCCESS };
  }

  return { error: Responses.orderCancelReturn.INVALID_ACTION };
};

import statusCode from "../../../constants/statusCode.js";

export const personalInfoEdit = Object.freeze({
  USER_NOT_FOUND: {
    code: statusCode.CLIENT.NOT_FOUND,
    message: "User not found!",
  },
  PASSWORD_NOT_MATCH: {
    code: statusCode.CLIENT.UNAUTHORIZED,
    message: "Invalid password!",
  },
  EMAIL_EXIST: {
    code: statusCode.CLIENT.CONFLICT,
    message: "An account with this email already exists.",
  },
  NO_IMAGE: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "No image provided",
  },
  EMAIL_CHANGE: {
    code: statusCode.SUCCESS.OK,
    message: "Email change",
    redirectToFrontend: "/user/email-verify",
  },
});

export const addAddress = Object.freeze({
  ADDRESS_ADDED: {
    code: statusCode.SUCCESS.CREATED,
    message: "Address added successfully!!",
  },
});

export const editAddress = Object.freeze({
  NOT_FOUND: {
    code: statusCode.CLIENT.NOT_FOUND,
    message: "Address not found",
  },
  ADDRESS_EDITED: {
    code: statusCode.SUCCESS.CREATED,
    message: "Address edited successfully!!",
  },
});

export const removeAddress = Object.freeze({
  REMOVED: {
    code: statusCode.SUCCESS.CREATED,
    message: "Address removed successfully!!",
  },
});

export const addWishlist = Object.freeze({
  ALREADY_EXIST: {
    code: statusCode.SUCCESS.CREATED,
    message: "Product removed from wishlist!!",
    data: false,
  },
  PRODUCT_ADDED: {
    code: statusCode.SUCCESS.OK,
    message: "Product added to wishlist!!",
    data: true,
  },
});

export const removeWishlist = Object.freeze({
  REMOVED: {
    code: statusCode.SUCCESS.CREATED,
    message: "Product removed from wishlist!!",
  },
});

export const buyNowRes = Object.freeze({
  NO_USER: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Login Required!",
  },
  INVALID: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Invalid Request!!",
  },
  SUCCESS: {
    code: statusCode.SUCCESS.OK,
    message: "Buy now successfull!!",
    redirectToFrontend: "/user/checkout",
  },
});

export const addToCart = Object.freeze({
  INVALID: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Invalid cart data",
  },
});

export const cartQuantity = Object.freeze({
  INVALID: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Invalid quantity update request",
  },
  CART_NOT_FOUND: {
    code: statusCode.CLIENT.NOT_FOUND,
    message: "Cart not found",
  },
  ITEM_NOT_FOUND: {
    code: statusCode.CLIENT.NOT_FOUND,
    message: "Item not found in cart",
  },
  QUANTITY_ZERO: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Quantity can't be zero",
  },
  STOCK_OUT: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "The stock is out!!",
  },
});

export const cartCheck = Object.freeze({
  EMPTY_CART: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Your cart is empty",
  },
  SUCCESS: {
    code: statusCode.SUCCESS.OK,
    message: "All items are in stock. Proceed to checkout.",
    redirectToFrontend: "/user/checkout",
  },
});

export const emailVerify = Object.freeze({
  OTP_EXPIRED: {
    code: 410,
    message: "OTP expired",
  },
  INCORRECT: {
    code: statusCode.CLIENT.UNAUTHORIZED,
    message: "Incorrect OTP. Please try again!",
  },
  SUCCESS: {
    code: statusCode.SUCCESS.OK,
    message: "Otp verification successfull",
    redirectToFrontend: "/user/profile",
  },
});

export const editPassword = Object.freeze({
  USER_NOT_FOUND: {
    code: statusCode.CLIENT.NOT_FOUND,
    message: "User not found",
  },
  CURRENT_PASS_INCORRECT: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Current password is incorrect",
  },
  SAME_NEW_PASS: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "New password must be different",
  },
  SUCCESS: {
    code: statusCode.SUCCESS.OK,
    message: "Password updated successfully",
  },
});

export const order = Object.freeze({
  NO_ORDER: {
    code: statusCode.CLIENT.NOT_FOUND,
    message: "Order not found",
  },
  RAZORPAY_FAILED: {
    code: statusCode.SUCCESS.OK,
    message: "Razorpay payment Failed",
    redirectToFrontend: "/user/order/failed",
  },
});

export const wallet = Object.freeze({
  PROCESSED: {
    code: statusCode.CLIENT.CONFLICT,
    message: "Wallet top-up already processed",
  },
  INSUFFICIENT: {
    code: statusCode.CLIENT.PAYMENT_REQUIRED,
    message: "Insufficient wallet balance",
  },
});

export const deleteCartItem = Object.freeze({
  NO_VARIANT_ID: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Variant ID is required",
  },
  NO_CART: {
    code: statusCode.CLIENT.NOT_FOUND,
    message: "Cart not found",
  },
  NO_ITEM: {
    code: statusCode.CLIENT.NOT_FOUND,
    message: "Item not found in cart",
  },
});

export const placeOrder = Object.freeze({
  NO_ADDRESS: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Shipping address is required",
  },
  NO_PAY_METHOD: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Payment method is required",
  },
  EMPTY_CART: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Your cart is empty",
  },
  ADDRESS_NOT_FOUND: {
    code: statusCode.CLIENT.NOT_FOUND,
    message: "Shipping address not found",
  },
  NO_ITEMS: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "No valid items in cart",
  },
  PAY_VERIFY_FAILED: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Payment verification failed",
  },
  COD_NOT_AVAILABLE: {
    code: statusCode.CLIENT.FORBIDDEN,
    message: "Cash on Delivery is not available for orders above ₹1000",
  },
  SUCCESS: {
    code: statusCode.SUCCESS.CREATED,
    message: "Order placed successfully",
    redirectToFrontend: "/user/order/success",
  },
});

export const orderCancelReturn = Object.freeze({
  NO_REASON: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Please enter the reason",
  },
  NO_ITEMS: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Please select the item",
  },
  MISSING_FIELDS: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Missing required fields",
  },
  NO_ORDER: {
    code: statusCode.CLIENT.NOT_FOUND,
    message: "Order not found",
  },
  NO_CANCEL: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Delivered orders cannot be cancelled",
  },
  NO_RETURN: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Order not delivered yet",
  },
  CANCEL_SUCCESS: {
    code: statusCode.SUCCESS.OK,
    message: "Order cancelled successfully",
  },
  RETURN_SUCCESS: {
    code: statusCode.SUCCESS.OK,
    message: "Return request submitted",
  },
  INVALID_ACTION: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Invalid action",
  },
});

export const walletPayment = Object.freeze({
  INVALID_AMOUNT: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Invalid amount",
  },

  ORDER_FAILED: {
    code: statusCode.SERVER.INTERNAL_SERVER_ERROR,
    message: "Order creation failed",
  },

  PAYMENT_FAILED: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Payment verification failed",
  },

  SUCCESS: {
    code: statusCode.SUCCESS.OK,
    message: "Wallet credited successfully",
  },
});

export const razorpayOrderVerify = Object.freeze({
  PAYMENT_FAILED: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Payment verification failed",
  },

  SUCCESS: {
    code: statusCode.SUCCESS.CREATED,
    message: "Order placed successfully",
    redirectToFrontend: "/user/order/success",
  },
});

export const couponCheck = Object.freeze({
  NOT_APPLIED: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "No coupon applied",
  },

  INVALID_CODE: {
    code: statusCode.CLIENT.NOT_FOUND,
    message: "Invalid coupon code",
  },

  COUPON_EXPIRED: {
    code: 410,
    message: "Coupon has expired",
  },

  USAGE_LIMIT: {
    code: statusCode.CLIENT.CONFLICT,
    message: "Coupon usage limit reached",
  },

  ALREADY_USED: {
    code: statusCode.CLIENT.CONFLICT,
    message: "You have already used this coupon",
  },
});

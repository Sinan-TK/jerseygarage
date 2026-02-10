export const personalInfoEdit = Object.freeze({
  USER_NOT_FOUND: {
    code: 404,
    message: "User not found!",
  },
  PASSWORD_NOT_MATCH: {
    code: 401,
    message: "Invalid password!",
  },
  EMAIL_EXIST: {
    code: 409,
    message: "An account with this email already exists.",
  },
  // INFO_EDITED: {
  //   code: 200,
  //   message: "Personal Info edited",
  // },
  EMAIL_CHANGE: {
    code: 200,
    message: "Email change",
    redirectToFrontend: "/user/email-verify",
  },
});

export const addAddress = Object.freeze({
  ADDRESS_ADDED: {
    code: 201,
    message: "Address added successfully!!",
  },
});

export const editAddress = Object.freeze({
  ADDRESS_EDITED: {
    code: 201,
    message: "Address edited successfully!!",
  },
});

export const removeAddress = Object.freeze({
  REMOVED: {
    code: 201,
    message: "Address removed successfully!!",
  },
});

export const addWishlist = Object.freeze({
  ALREADY_EXIST: {
    code: 201,
    message: "Product removed from wishlist!!",
    data: false,
  },
  PRODUCT_ADDED: {
    code: 200,
    message: "Product added to wishlist!!",
    data: true,
  },
});

export const removeWishlist = Object.freeze({
  REMOVED: {
    code: 201,
    message: "Product removed from wishlist!!",
  },
});

export const buyNowRes = Object.freeze({
  NO_USER: {
    code: 400,
    message: "Login Required!",
  },
  INVALID: {
    code: 400,
    message: "Invalid Request!!",
  },
  SUCCESS: {
    code: 200,
    message: "Buy now successfull!!",
    redirectToFrontend: "/user/checkout",
  },
});

export const addToCart = Object.freeze({
  INVALID: {
    code: 400,
    message: "Invalid cart data",
  },
  // NO_VARIANT: {
  //   code: 404,
  //   message: "Variant not available",
  // },
  // SUCCESS: {
  //   code: 200,
  //   message: "Item added to cart",
  // },
});

export const cartQuantity = Object.freeze({
  INVALID: {
    code: 400,
    message: "Invalid quantity update request",
  },
  CART_NOT_FOUND: {
    code: 404,
    message: "Cart not found",
  },
  ITEM_NOT_FOUND: {
    code: 404,
    message: "Item not found in cart",
  },
  QUANTITY_ZERO: {
    code: 400,
    message: "Quantity can't be zero",
  },
  STOCK_OUT: {
    code: 400,
    message: "The stock is out!!",
  },
});

export const cartCheck = Object.freeze({
  EMPTY_CART: {
    code: 400,
    message: "Your cart is empty",
  },
  SUCCESS: {
    code: 200,
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
    code: 401,
    message: "Incorrect OTP. Please try again!",
  },
  SUCCESS: {
    code: 200,
    message: "Otp verification successfull",
    redirectToFrontend: "/user/profile",
  },
});

export const editPassword = Object.freeze({
  USER_NOT_FOUND: {
    code: 404,
    message: "User not found",
  },
  CURRENT_PASS_INCORRECT: {
    code: 400,
    message: "Current password is incorrect",
  },
  SAME_NEW_PASS: {
    code: 400,
    message: "New password must be different",
  },
  SUCCESS: {
    code: 200,
    message: "Password updated successfully",
  },
});

export const deleteCartItem = Object.freeze({
  NO_VARIANT_ID: {
    code: 400,
    message: "Variant ID is required",
  },
  NO_CART: {
    code: 404,
    message: "Cart not found",
  },
  NO_ITEM: {
    code: 404,
    message: "Item not found in cart",
  },
});

export const placeOrder = Object.freeze({
  NO_ADDRESS: {
    code: 400,
    message: "Shipping address is required",
  },
  NO_PAY_METHOD: {
    code: 400,
    message: "Payment method is required",
  },
  EMPTY_CART: {
    code: 400,
    message: "Your cart is empty",
  },
  ADDRESS_NOT_FOUND: {
    code: 404,
    message: "Shipping address not found",
  },
  NO_ITEMS: {
    code: 400,
    message: "No valid items in cart",
  },
  PAY_VERIFY_FAILED: {
    code: 400,
    message: "Payment verification failed",
  },
  SUCCESS: {
    code: 201,
    message: "Order placed successfully",
    redirectToFrontend: "/user/order/success",
  },
});

export const orderCancelReturn = Object.freeze({
  NO_REASON: {
    code: 400,
    message: "Please enter the reason",
  },
  NO_ITEMS: {
    code: 400,
    message: "Please select the item",
  },
  MISSING_FIELDS: {
    code: 400,
    message: "Missing required fields",
  },
  NO_ORDER: {
    code: 404,
    message: "Order not found",
  },
  NO_CANCEL: {
    code: 400,
    message: "Delivered orders cannot be cancelled",
  },
  NO_RETURN: {
    code: 400,
    message: "Order not delivered yet",
  },
  CANCEL_SUCCESS: {
    code: 200,
    message: "Order cancelled successfully",
  },
  RETURN_SUCCESS: {
    code: 200,
    message: "Return request submitted",
  },
  INVALID_ACTION: {
    code: 400,
    message: "Invalid action",
  },
});

export const walletPayment = {
  INVALID_AMOUNT: {
    code: 400,
    message: "Invalid amount",
  },

  ORDER_FAILED: {
    code: 500,
    message: "Order creation failed",
  },

  PAYMENT_FAILED: {
    code: 400,
    message: "Payment verification failed",
  },

  SUCCESS: {
    code: 200,
    message: "Wallet credited successfully",
  },
};

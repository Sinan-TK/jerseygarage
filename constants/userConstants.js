export const SHIPPING_CHARGE = 50;

export const OTPPURPOSE = Object.freeze({
  SIGNUP: "signup",
  FORGOTPASSWORD: "forget_password",
  CHANGEEMAIL: "ChangeMailAddress",
});

export const REFERRAL_BONUS = 50;

export const OTP_MESSAGES = Object.freeze({
  SIGNUP: "SignUp Verification OTP",
  FORGOTPASSWORD: "Forget password OTP",
  CHANGEEMAIL: "Email verification OTP",
});

export const TRANSACTION_STATUS = Object.freeze({
  SUCCESS: "SUCCESS",
  PENDING: "PENDING",
  FAILED: "FAILED",
});

export const TRANSACTION_REASON = Object.freeze({
  REF: "Referral Bouns",
  ORDER: "Order Payment",
  TOPUP: "Wallet Top-up",
});

export const CART_QUANTITY = Object.freeze({
  PLUS: "plus",
  MINUS: "minus",
});

export const ORDER_PAY_STATUS = Object.freeze({
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
});

export const ORDER_STATUS = Object.freeze({
  PENDING: "Pending",
  PLACED: "Placed",
  DELIVERED: "Delivered",
  FAILED: "Failed",
});

export const PAY_METHOD = Object.freeze({
  COD: "COD",
  WALLET: "Wallet",
  RAZORPAY: "Razorpay",
});

export const PAY_DETAILS = Object.freeze({
  CURRENCY: "INR",
  NAME: "JerseyGarage",
  DES: "Order Payment",
});

export const ACTION_TYPE = Object.freeze({
  CANCEL: "cancel",
  RETURN: "return",
  PARTIALCANCEL: "partial-cancel",
  PARTIALRETURN: "partial-return",
  FULLCANCEL: "full-cancel",
  FULLRETURN: "full-return",
});

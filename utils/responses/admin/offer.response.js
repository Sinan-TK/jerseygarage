export const addCoupon = Object.freeze({
  COUPON_EXIST: {
    code: 409,
    message: "Coupon code already exists!",
  },
  SUCCESS: {
    code: 201,
    message: "Coupon created successfully",
    redirectToFrontend: "/admin/coupons",
  },
});

export const editCoupon = Object.freeze({
  COUPON_EXIST: {
    code: 409,
    message: "Coupon code already exists!",
  },
  NO_COUPONID: {
    code: 400,
    message: "Coupon ID is required",
  },
  SUCCESS: {
    code: 201,
    message: "Coupon edited successfully",
    redirectToFrontend: "/admin/coupons",
  },
});

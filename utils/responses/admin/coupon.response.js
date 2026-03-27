import statusCode from "../../../constants/statusCode.js";

export const addCoupon = Object.freeze({
  COUPON_EXIST: {
    code: statusCode.CLIENT.CONFLICT,
    message: "Coupon code already exists!",
  },
  SUCCESS: {
    code: statusCode.SUCCESS.CREATED,
    message: "Coupon created successfully",
    redirectToFrontend: "/admin/coupons",
  },
});

export const editCoupon = Object.freeze({
  COUPON_EXIST: {
    code: statusCode.CLIENT.CONFLICT,
    message: "Coupon code already exists!",
  },
  NO_COUPONID: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Coupon ID is required",
  },
  SUCCESS: {
    code: statusCode.SUCCESS.CREATED,
    message: "Coupon edited successfully",
    redirectToFrontend: "/admin/coupons",
  },
});

export const deleteCoupon = Object.freeze({
  NOT_FOUND: {
    code: statusCode.CLIENT.NOT_FOUND,
    message: "Coupon not found",
  },
  DELETED: {
    code: statusCode.SUCCESS.OK,
    message: "Coupon deleted successfully",
  },
});

import Category from "../../models/categoryModel.js";
import Offer from "../../models/offerModel.js";
import Product from "../../models/productModel.js";
import wrapAsync from "../../utils/wrapAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import { couponSchema } from "../../validators/couponValidator.js";
import offerSchema from "../../validators/offerValidator.js";
import paginate from "../../utils/pagination.js";
import { ObjectId } from "mongodb";
import * as Responses from "../../utils/responses/admin/coupon.response.js";
import Coupon from "../../models/couponModel.js";

// ======================================================================
// 1. RENDER COUPON PAGE
// ======================================================================

export const couponPage = (req, res) => {
  res.render("admin/pages/coupons", {
    title: "Coupons",
    showLayout: true,
    cssFile: "/css/admin/coupons.css",
    pageJS: "coupons.js",
  });
};

// ======================================================================
// 2. COUPON DATA
// ======================================================================

export const fetchCoupons = wrapAsync(async (req, res) => {
  const { search, statusFilter, page } = req.query;

  let filter = {};

  if (search) {
    filter.code = {
      $regex: search,
      $options: "i",
    };
  }

  if (statusFilter === "active") {
    filter.isActive = true;
  }

  if (statusFilter === "inactive") {
    filter.isActive = false;
  }

  const pagination = await paginate(Coupon, page, 10, filter);

  return sendResponse(res, {
    code: 200,
    message: "coupons fetched successfully",
    data: { coupons: pagination.data, pagination: pagination.meta },
  });
});

// ======================================================================
// 3. ADD COUPON PAGE
// ======================================================================

export const addCouponPage = (req, res) => {
  res.render("admin/pages/addcoupon", {
    title: "Add Coupon",
    showLayout: true,
    cssFile: "/css/admin/addCoupon.css",
    pageJS: "addCoupon.js",
  });
};

// ======================================================================
// 4. ADD COUPON
// ======================================================================

export const addCoupon = wrapAsync(async (req, res) => {
  const { error, value } = couponSchema.validate(req.body, {
    abortEarly: true,
  });

  if (error) {
    return sendResponse(res, {
      code: 400,
      message: error.details[0].message,
    });
  }

  const {
    code,
    discountType,
    discountValue,
    minPurchaseAmount,
    maxDiscountAmount,
    usageLimit,
    perUserLimit,
    expiryDate,
    description,
    isActive,
  } = value;

  const escapedCode = code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const isMatch = await Coupon.findOne({
    code: { $regex: `^${escapedCode}$`, $options: "i" },
  });

  if (isMatch) {
    return sendResponse(res, Responses.addCoupon.COUPON_EXIST);
  }

  const coupon = await Coupon.create({
    code: code.toUpperCase(),
    discountType,
    discountValue,
    minPurchaseAmount,
    maxDiscountAmount,
    usageLimit,
    perUserLimit,
    expiryDate,
    description,
    isActive,
  });

  return sendResponse(res, Responses.addCoupon.SUCCESS);
});

// ======================================================================
// 5. EDIT COUPON PAGE
// ======================================================================

export const editCouponPage = (req, res) => {
  res.render("admin/pages/addcoupon", {
    title: "Edit Coupon",
    showLayout: true,
    cssFile: "/css/admin/addCoupon.css",
    pageJS: "editCoupon.js",
  });
};

// ======================================================================
// 6. EDIT COUPON DATA
// ======================================================================

export const editCouponData = wrapAsync(async (req, res) => {
  const { couponId } = req.params;

  if (!couponId) {
    return sendResponse(res, Responses.editCoupon.NO_COUPONID);
  }

  const coupon = await Coupon.findById(couponId);

  return sendResponse(res, {
    code: 200,
    message: "coupon data fetched",
    data: coupon,
  });
});

// ======================================================================
// 7. EDIT COUPON
// ======================================================================

export const editCoupon = wrapAsync(async (req, res) => {
  const { couponId } = req.params;

  if (!couponId) {
    return sendResponse(res, Responses.editCoupon.NO_COUPONID);
  }

  const coupon = await Coupon.findById(couponId);

  if (!coupon) {
    return sendResponse(res, Responses.editCoupon.NO_COUPONID);
  }

  const { error, value } = couponSchema.validate(req.body, {
    abortEarly: true,
  });

  if (error) {
    return sendResponse(res, {
      code: 400,
      message: error.details[0].message,
    });
  }

  const {
    code,
    discountType,
    discountValue,
    minPurchaseAmount,
    maxDiscountAmount,
    usageLimit,
    perUserLimit,
    expiryDate,
    description,
    isActive,
  } = value;

  const escapedCode = code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const isMatch = await Coupon.findOne({
    code: { $regex: `^${escapedCode}$`, $options: "i" },
    _id: { $ne: couponId },
  });

  if (isMatch) {
    return sendResponse(res, Responses.editCoupon.COUPON_EXIST);
  }

  coupon.code = code.toUpperCase();
  coupon.discountType = discountType;
  coupon.discountValue = discountValue;
  coupon.minPurchaseAmount = minPurchaseAmount;
  coupon.maxDiscountAmount = maxDiscountAmount;
  coupon.usageLimit = usageLimit;
  coupon.perUserLimit = perUserLimit;
  coupon.expiryDate = expiryDate;
  coupon.description = description;
  coupon.isActive = isActive;
  coupon.save();

  return sendResponse(res, Responses.editCoupon.SUCCESS);
});

// ======================================================================
// 8. COUPON DETAILS PAGE
// ======================================================================

export const couponDetailsPage = wrapAsync(async (req, res) => {
  const { couponId } = req.params;

  if (!couponId) {
    return sendResponse(res, Responses.editCoupon.NO_COUPONID);
  }

  const coupon = await Coupon.findById(couponId);

  res.render("admin/pages/couponDetails", {
    title: `${coupon.code}`,
    coupon,
    showLayout: true,
    cssFile: "/css/admin/couponDetails.css",
    pageJS: "",
  });
});

// ======================================================================
// 9. DELETE COUPON
// ======================================================================

export const deleteCoupon = wrapAsync(async (req, res) => {
  const { couponId } = req.params;

  const deleted = await Coupon.findByIdAndDelete(couponId);

  if (!deleted) {
    return sendResponse(res, Responses.deleteCoupon.NOT_FOUND);
  }

  return sendResponse(res, Responses.deleteCoupon.DELETED);
});

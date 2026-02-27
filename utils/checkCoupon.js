import Coupon from "../models/couponModel.js";
import wrapAsync from "../utils/wrapAsync.js";
import User from "../models/userModel.js";
import * as Responses from "./responses/user/user.response.js";

export const checkCoupon = async (userId, total) => {
  const now = new Date();

  const coupons = await Coupon.find({
    isActive: true,
    expiryDate: { $gt: now },
    minPurchaseAmount: { $lte: total },
  });

  const validCoupons = coupons.filter((coupon) => {
    if (coupon.usedCount >= coupon.usageLimit) {
      return false;
    }

    const userUsage = coupon.usersUsed.find(
      (u) => u.userId.toString() === userId.toString(),
    );

    if (userUsage && userUsage.count >= coupon.perUserLimit) {
      return false;
    }

    return true;
  });

  return validCoupons.map((coupon) => ({
    id: coupon._id,
    code: coupon.code,
    description: coupon.description,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    maxDiscountAmount: coupon.maxDiscountAmount,
    minPurchaseAmount: coupon.minPurchaseAmount,
    expiryDate: coupon.expiryDate,
  }));
};

//

//

export const couponApply = async (userId, couponCode, total) => {
  if (!couponCode) {
    return { error: Responses.couponCheck.NOT_APPLIED };
  }

  const coupon = await Coupon.findOne({
    code: couponCode.toUpperCase(),
    isActive: true,
  });

  if (!coupon) {
    return { error: Responses.couponCheck.INVALID_CODE };
  }

  const now = new Date();

  if (coupon.expiryDate < now) {
    return { error: Responses.couponCheck.COUPON_EXPIRED };
  }

  if (total < coupon.minPurchaseAmount) {
    return {
      error: {
        code: 400,
        message: `Minimum purchase amount is ₹${coupon.minPurchaseAmount}`,
      },
    };
  }

  if (coupon.usedCount >= coupon.usageLimit) {
    return { error: Responses.couponCheck.USAGE_LIMIT };
  }

  const userUsage = coupon.usersUsed.find(
    (u) => u.userId.toString() === userId.toString(),
  );

  if (userUsage && userUsage.count >= coupon.perUserLimit) {
    return {
      error: Responses.couponCheck.ALREADY_USED,
    };
  }

  let discount = 0;

  if (coupon.discountType === "percentage") {
    discount = (total * coupon.discountValue) / 100;

    if (coupon.maxDiscountAmount) {
      discount = Math.min(discount, coupon.maxDiscountAmount);
    }
  } else {
    discount = coupon.discountValue;
  }

  discount = Math.min(discount, total);

  return {
    couponId: coupon._id,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountAmount: discount,
    finalAmount: total - discount,
  };
};

export const applyCouponUsage = async (code, userId) => {
  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
  });

  if (!coupon) {
    return {
      error: Responses.couponCheck.INVALID_CODE,
    };
  }

  const now = new Date();

  if (coupon.expiryDate < now) {
    return {
      error: Responses.couponCheck.COUPON_EXPIRED,
    };
  }

  // Global usage limit
  if (coupon.usedCount >= coupon.usageLimit) {
    return {
      error: Responses.couponCheck.USAGE_LIMIT,
    };
  }

  // Per-user usage check
  const userUsage = coupon.usersUsed.find(
    (u) => u.userId.toString() === userId.toString(),
  );

  if (userUsage) {
    if (userUsage.count >= coupon.perUserLimit) {
      return {
        error: Responses.couponCheck.ALREADY_USED,
      };
    }
    userUsage.count += 1;
  } else {
    coupon.usersUsed.push({
      userId,
      count: 1,
    });
  }

  // Increment global usage
  coupon.usedCount += 1;

  await coupon.save();

  return { success: true };
};

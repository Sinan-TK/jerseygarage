import User from "../../models/userModel.js";
import Product from "../../models/productModel.js";
import Wishlist from "../../models/wishlistModel.js";
import Offer from "../../models/offerModel.js";
import mongoose from "mongoose";
import * as Responses from "../../utils/responses/user/auth.responses.js";
import generateOtp from "../../utils/GenerateOtp.js";
import { ObjectId } from "mongodb";
import buildBreadcrumbs from "../../utils/breadcrumbs/product.crumb.js";
import Otp from "../../models/otpModel.js";
import * as userConstants from "../../constants/userConstants.js";

//=============================================================================
// 1.USER LOGIN VERIFICATION
//=============================================================================

export const verifyUserLogin = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    return { error: Responses.loginUser.USER_NOT_FOUND };
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return { error: Responses.loginUser.PASSWORD_NOT_MATCH };
  }

  if (user.is_blocked) {
    return { error: Responses.loginUser.USER_BLOCKED };
  }

  return {
    user: {
      id: user._id,
      email: user.email,
      blocked: user.is_blocked,
    },
  };
};

//=============================================================================
// 2. SAVE NEW USER
//=============================================================================

export const signupVerificationService = async (email, referralCode) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return { error: Responses.registerLogic.USER_FOUND };
  }

  let referredBy = null;

  if (referralCode) {
    const code = referralCode.trim().toUpperCase();

    referredBy = await User.findOne({ referral_code: code });

    if (!referredBy) {
      return { error: Responses.registerLogic.INVALID_REF_CODE };
    }
  }

  await generateOtp(
    email,
    userConstants.OTPPURPOSE.SIGNUP,
    userConstants.OTP_MESSAGES.SIGNUP,
  );

  return {
    data: {
      email,
      purpose: userConstants.OTPPURPOSE.SIGNUP,
      ...(referredBy && { referredBy: referredBy._id }),
    },
  };
};

//=============================================================================
// 3.OTP VERIFICATION
//=============================================================================

export const otpVerify = async (email, purpose, otpValue) => {
  const otpDoc = await Otp.findOne({ email, purpose, is_used: false });

  if (!otpDoc) {
    return { error: Responses.otpVerify.OTP_EXPIRED };
  }

  if (otpDoc.otp_code !== otpValue) {
    return { error: Responses.otpVerify.INCORRECT_OTP };
  }

  otpDoc.is_used = true;
  await otpDoc.save();

  return { success: true };
};

//
//
//

export const productDetailPage = async (productId) => {
  const product = await Product.aggregate([
    { $match: { _id: new ObjectId(productId), is_active: true } },
    {
      $lookup: {
        from: "variants",
        localField: "_id",
        foreignField: "product_id",
        as: "variants",
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category_details",
      },
    },
  ]);

  const productData = product[0];

  const now = new Date();

  const offers = await Offer.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
    $or: [
      {
        offerApplyType: "product",
        productIds: productData._id,
      },
      {
        offerApplyType: "category",
        categoryIds: productData.category,
      },
    ],
  }).lean();

  if (offers.length > 0) {
    const referencePrice = Math.min(
      ...productData.variants.map((v) => v.base_price),
    );

    let bestOffer = null;
    let bestPrice = referencePrice;

    for (const offer of offers) {
      let priceAfterOffer = referencePrice;

      if (offer.discountType === "percentage") {
        priceAfterOffer -= (priceAfterOffer * offer.discountValue) / 100;
      } else if (offer.discountType === "flat") {
        priceAfterOffer -= offer.discountValue;
      }

      if (priceAfterOffer < 0) priceAfterOffer = 0;

      if (priceAfterOffer < bestPrice) {
        bestPrice = priceAfterOffer;
        bestOffer = offer;
      }
    }

    if (bestOffer) {
      productData.offer = bestOffer;
      for (const variant of productData.variants) {
        let price = variant.base_price;

        if (bestOffer.discountType === "percentage") {
          price -= (price * bestOffer.discountValue) / 100;
        } else if (bestOffer.discountType === "flat") {
          price -= bestOffer.discountValue;
        }

        variant.offer_price = Math.max(price, 0);
      }
    }
  }

  const relatedProducts = await Product.aggregate([
    {
      $match: {
        category: new ObjectId(product[0].category),
        _id: { $ne: new ObjectId(productId) },
        is_active: true,
      },
    },
    {
      $lookup: {
        from: "variants",
        localField: "_id",
        foreignField: "product_id",
        as: "variants",
      },
    },
  ]);

  let finalRelatedProducts = [...relatedProducts];

  if (finalRelatedProducts.length < 4) {
    const remaining = 4 - finalRelatedProducts.length;

    const extraProducts = await Product.aggregate([
      {
        $match: {
          _id: {
            $nin: [
              new mongoose.Types.ObjectId(productId),
              ...finalRelatedProducts.map((p) => p._id),
            ],
          },
          is_active: true,
        },
      },
      { $sample: { size: remaining } },
      {
        $lookup: {
          from: "variants",
          localField: "_id",
          foreignField: "product_id",
          as: "variants",
        },
      },
    ]);

    finalRelatedProducts = finalRelatedProducts.concat(extraProducts);
  }

  finalRelatedProducts.sort(() => 0.5 - Math.random());

  const pCategory = product[0].category_details[0].name;
  const pName = product[0].name;

  const breadcrumbs = buildBreadcrumbs({ category: pCategory, product: pName });

  return {
    product: productData,
    relatedProducts: finalRelatedProducts,
    breadcrumbs,
  };
};

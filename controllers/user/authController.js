import bcrypt from "bcrypt";
import User from "../../models/userModel.js";
import Otp from "../../models/otpModel.js";
import Product from "../../models/productModel.js";
import Variant from "../../models/variantModel.js";
import Category from "../../models/categoryModel.js";
import Wishlist from "../../models/wishlistModel.js";
import Wallet from "../../models/walletModel.js";
import sendOTP from "../../utils/sendOtp.js";
import generateOtp from "../../utils/GenerateOtp.js";
import * as Responses from "../../utils/responses/user/auth.responses.js";
import sendResponse from "../../utils/sendResponse.js";
import wrapAsync from "../../utils/wrapAsync.js";
import * as userValidators from "../../validators/userValidators.js";
import paginate from "../../utils/pagination.js";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import { createUniqueReferralCode } from "../../utils/referralCodeGenerator.js";
import productBreadcrumbs from "../../utils/breadcrumbs/product.crumb.js";
import buildBreadcrumbs from "../../utils/breadcrumbs/product.crumb.js";
import * as authServices from "../../services/user/authServices.js";
import * as userConstants from "../../constants/userConstants.js";
import Offer from "../../models/offerModel.js";
import WalletTransaction from "../../models/walletTransactionModel.js";

// ======================================================================
// 1. LOGIN PAGE
// ======================================================================

export const loginPage = wrapAsync((req, res) => {
  res.render("user/pages/login", {
    title: "Login",
    pageCSS: "login",
    showHeader: true,
    showFooter: true,
    pageJS: "login.js",
  });
});

// ======================================================================
// 2. GOOGLE AUTHENTICATION TRUE
// ======================================================================

export const googleCallback = wrapAsync((req, res) => {
  const user = req.user;
  req.session.user = {
    id: user._id,
    email: user.email,
    blocked: user.is_blocked,
  };
  res.redirect("/");
});

// ======================================================================
// 3. USER LOGIN VERIFICATION
// ======================================================================

export const userVerification = wrapAsync(async (req, res) => {
  const { error } = userValidators.userSchema.validate(req.body);

  if (error) {
    return sendResponse(res, {
      code: 400,
      message: error.details[0].message,
    });
  }

  const { email, password } = req.body;

  const result = await authServices.verifyUserLogin(email, password);

  if (result?.error) {
    return sendResponse(res, result.error);
  }

  req.session.user = result.user;

  return sendResponse(res, Responses.loginUser.LOGIN);
});

// ======================================================================
// 6. RENDER OTP PAGE
// ======================================================================

export const renderOtpPage = wrapAsync((req, res) => {
  res.render("user/pages/otp-verify", {
    title: "OTP Verification",
    pageCSS: "otp-verify",
    showHeader: true,
    showFooter: true,
    pageJS: "otp-verify.js",
  });
});

// ======================================================================
// 7. VERIFY OTP (SIGNUP / FORGOT PASSWORD)
// ======================================================================

export const otpVerification = wrapAsync(async (req, res) => {
  const email = req.session.tempEmail || req.session.userData?.email;
  const purpose = req.session.otpPurpose;

  if (!email || !purpose) {
    return sendResponse(res, Responses.otpVerify.DATA_NOT_FOUND);
  }

  const { error } = userValidators.otpSchema.validate(req.body);

  if (error) {
    return sendResponse(res, {
      code: 400,
      message: error.details[0].message,
    });
  }

  const { otpValue } = req.body;

  const result = await authServices.otpVerify(email, purpose, otpValue);

  if (result?.error) {
    return sendResponse(res, result.error);
  }

  if (purpose === "signup") {
    const userData = req.session.userData;
    const email = req.session.tempEmail;

    const referral_code = await createUniqueReferralCode(userData.fullName);

    const newUser = await User.create({
      full_name: userData.fullName,
      email,
      password_hash: userData.password,
      referral_code,
    });

    if (userData.referredBy) {
      const referredBy = await User.findById(userData.referredBy);

      referredBy.referral_count = (referredBy.referral_count || 0) + 1;

      referredBy.save();

      let wallet = await Wallet.findOne({ user: referredBy._id });
      const amount = Number(userConstants.REFERRAL_BONUS);

      // Auto-create (safety)
      if (!wallet) {
        wallet = await Wallet.create({
          user: referredBy._id,
        });
      }

      await WalletTransaction.create({
        wallet:wallet._id,
        user:wallet.user,
        type:"credit",
        reason:"Referral Bouns",
        amount,
      })   

      wallet.balance += amount;

      await wallet.save();

      newUser.referred_by = userData.referredBy;
    }

    const wallet = await Wallet.create({
      user: newUser._id,
      balance: 0,
    });

    newUser.wallet = wallet._id;

    await newUser.save();

    delete req.session.userData;
    delete req.session.otpPurpose;
    delete req.session.tempEmail;

    return sendResponse(res, Responses.otpVerify.REGISTER);
  }
  return sendResponse(res, Responses.otpVerify.NEWPASSWORD);
});

// ======================================================================
// 8. RESEND OTP
// ======================================================================

export const resendOtp = wrapAsync(async (req, res) => {
  const email = req.session.tempEmail;
  const purpose = req.session.otpPurpose;

  if (!email || !purpose) {
    return sendResponse(res, Responses.resendOtp.DATA_NOT_FOUND);
  }

  await generateOtp(email, purpose, "Resend OTP. ");

  return sendResponse(res, Responses.resendOtp.RESEND_OTP);
});

// ======================================================================
// 9. SHOW REGISTER PAGE
// ======================================================================

export const signUpPage = wrapAsync((req, res) => {
  res.render("user/pages/register", {
    title: "Register",
    pageCSS: "register",
    showHeader: true,
    showFooter: true,
    pageJS: "register.js",
  });
});

// ======================================================================
// 10. SAVE NEW USER (FINAL REGISTER PAGE)
// ======================================================================

export const signupVerification = wrapAsync(async (req, res) => {
  const { error } = userValidators.registerSchema.validate(req.body);

  if (error) {
    return sendResponse(res, {
      code: 400,
      message: error.details[0].message,
    });
  }

  const { email, fullName, password, confirmPassword, referralCode } = req.body;

  const result = await authServices.signupVerificationService(
    email,
    referralCode,
  );

  if (result?.error) {
    return sendResponse(res, result.error);
  }

  req.session.userData = {
    fullName,
    password,
    ...(result.data.referredBy && {
      referredBy: result.data.referredBy,
    }),
  };
  req.session.tempEmail = email;
  req.session.otpPurpose = result.data.purpose;

  return sendResponse(res, Responses.registerLogic.ACCOUNT_CREATED);
});

// ======================================================================
// 11. FORGET PASSWORD PAGE
// ======================================================================

export const renderForgetPasswordPage = wrapAsync((req, res) => {
  res.render("user/pages/forgotpassword", {
    title: "Forget Password",
    pageCSS: "forgotpassword",
    showHeader: true,
    showFooter: true,
    pageJS: "forgotpassword.js",
  });
});

// ======================================================================
// 12. EMAIL SUBMIT (FORGOT PASSWORD)
// ======================================================================

export const emailVerification = wrapAsync(async (req, res) => {
  const { error } = userValidators.emailCheck.validate(req.body);

  if (error) {
    return sendResponse(res, {
      code: 400,
      message: error.details[0].message,
    });
  }

  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return sendResponse(res, Responses.forgetPass.NOT_FOUND);

  await generateOtp(email, "forget_password", "Forget password OTP. ");

  req.session.tempEmail = email;
  req.session.otpPurpose = "forget_password";

  return sendResponse(res, Responses.forgetPass.OTP_GENERATED);
});

// ======================================================================
// 13. NEW PASSWORD PAGE
// ======================================================================

export const renderNewPassPage = (req, res) => {
  res.render("user/pages/newpassword", {
    title: "New Password",
    pageCSS: "newpassword",
    showHeader: true,
    showFooter: true,
    pageJS: "newpassword.js",
  });
};

// ======================================================================
// 14. UPDATE PASSWORD
// ======================================================================

export const newPassValidation = wrapAsync(async (req, res) => {
  const email = req.session.tempEmail;
  if (!email) return sendResponse(res, Responses.registerLogic.DATA_NOT_FOUND);

  const { error } = userValidators.newPassSchema.validate(req.body);

  if (error) {
    return sendResponse(res, {
      code: 400,
      message: error.details[0].message,
    });
  }

  const { password, confirmPassword } = req.body;

  const user = await User.findOne({ email });
  if (!user) return sendResponse(res, Responses.forgetPass.NOT_FOUND);

  user.password_hash = password;
  await user.save();

  delete req.session.tempEmail;
  delete req.session.otpPurpose;

  return sendResponse(res, Responses.forgetPass.PASS_CHANGE);
});

// ======================================================================
// 15.HOME PAGE
// ======================================================================

export const renderHomePage = wrapAsync(async (req, res) => {
  const products = await Product.aggregate([
    { $match: { is_active: true } },
    { $sample: { size: 8 } },
    {
      $lookup: {
        from: "variants",
        localField: "_id",
        foreignField: "product_id",
        as: "variants",
      },
    },
    {
      $addFields: {
        variants: {
          $filter: {
            input: "$variants",
            as: "variant",
            cond: { $eq: ["$$variant.is_available", true] },
          },
        },
      },
    },
  ]);

  let wishlist = null;

  if (req.session.user) {
    const user_id = new ObjectId(req.session.user.id);
    wishlist = await Wishlist.findOne({ user_id }).select("items").lean();
  }

  const now = new Date();

  const offers = await Offer.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  }).lean();

  // console.log(offers)

  res.render("user/pages/home", {
    title: "Home",
    pageCSS: "home",
    showHeader: true,
    showFooter: true,
    offers,
    wishlist,
    pageJS: "home.js",
    products,
  });
});

// ======================================================================
// 16.SHOP PAGE
// ======================================================================

export const renderShopPage = wrapAsync(async (req, res) => {
  const categories = await Category.find(
    { is_active: true },
    { _id: 1, name: 1 },
  );

  const teamNames = await Product.aggregate([
    { $match: { is_active: true } },
    { $group: { _id: "$teamName" } },
  ]);

  return res.render("user/pages/shop", {
    title: "Shop",
    pageCSS: "shop",
    showFooter: true,
    showHeader: true,
    categories,
    teamNames,
    pageJS: "shop.js",
  });
});

// ======================================================================
// 16.SHOP PAGE
// ======================================================================

export const shopPageProducts = wrapAsync(async (req, res) => {
  const { category, team, size, minRange, maxRange, sort, page, search } =
    req.query;

  const currentPage = parseInt(page) || 1;
  const limit = 6;
  const skip = (currentPage - 1) * limit;

  const variantFilter = {};

  if (size) {
    variantFilter.size = Array.isArray(size) ? { $in: size } : size;
  }

  if (minRange || maxRange) {
    variantFilter.base_price = {
      ...(minRange && { $gte: Number(minRange) }),
      ...(maxRange && { $lte: Number(maxRange) }),
    };
  }

  let productIds = [];

  if (Object.keys(variantFilter).length > 0) {
    const variants = await Variant.find(variantFilter).select("product_id");
    productIds = variants.map((v) => v.product_id);

    if (!productIds.length) {
      return sendResponse(res, {
        code: 200,
        message: "Filter products rendered(0 products)",

        data: {
          products: [],
        },
      });
    }
  }

  const filter = { is_active: true };

  if (search) {
    filter.name = {
      $regex: search,
      $options: "i",
    };
  }

  if (category) {
    const categoryDoc = await Category.findOne({ name: category }).select(
      "_id",
    );
    if (categoryDoc) filter.category = categoryDoc._id;
  }

  if (team) {
    filter.teamName = Array.isArray(team) ? { $in: team } : team;
  }

  if (productIds.length) {
    filter._id = { $in: productIds };
  }

  let sortStage = { createdAt: -1 };
  if (sort === "price_low") sortStage = { sPrice: 1 };
  if (sort === "price_high") sortStage = { sPrice: -1 };
  if (sort === "az") sortStage = { name: 1 };
  if (sort === "za") sortStage = { name: -1 };

  const totalProducts = await Product.countDocuments(filter);
  const totalPages = Math.ceil(totalProducts / limit);

  const products = await Product.aggregate([
    { $match: filter },

    {
      $lookup: {
        from: "variants",
        let: { productId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$product_id", "$$productId"] },
                  { $eq: ["$size", "S"] },
                ],
              },
            },
          },
        ],
        as: "variants",
      },
    },

    {
      $addFields: {
        sPrice: { $arrayElemAt: ["$variants.base_price", 0] },
      },
    },

    { $sort: sortStage },
    { $skip: skip },
    { $limit: limit },
  ]);

  let wishlist = null;

  if (req.session.user) {
    const user_id = new ObjectId(req.session.user.id);
    wishlist = await Wishlist.findOne({ user_id }).select("items").lean();
  }

  const now = new Date();

  const offers = await Offer.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  });

  return sendResponse(res, {
    code: 200,
    message: "Filter products rendered",

    data: {
      products,
      user: Boolean(req.session.user),
      wishlist,
      pagination: {
        currentPage,
        totalPages,
      },
    },
  });
});
// ======================================================================
// 17.PRODUCT DETAIL PAGE RENDER
// ======================================================================

export const productDetailPage = wrapAsync(async (req, res) => {
  const id = req.params.id;

  const product = await Product.aggregate([
    { $match: { _id: new ObjectId(id), is_active: true } },
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
        _id: { $ne: new ObjectId(id) },
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
              new mongoose.Types.ObjectId(id),
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

  res.render("user/pages/productdetails", {
    title: "Product detail",
    pageCSS: "productdetails",
    product: productData,
    relatedProducts: finalRelatedProducts,
    showFooter: true,
    showHeader: true,
    pageJS: "productdetails.js",
    breadcrumbs,
  });
});

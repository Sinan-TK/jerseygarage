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
import * as authServices from "../../services/user/authServices.js";
import * as userConstants from "../../constants/userConstants.js";
import Offer from "../../models/offerModel.js";
import WalletTransaction from "../../models/walletTransactionModel.js";
import * as walletHandler from "../../utils/walletHandler.js";

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
// 4. RENDER OTP PAGE
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
// 5. VERIFY OTP (SIGNUP / FORGOT PASSWORD)
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

      const amount = Number(userConstants.REFERRAL_BONUS);

      let wallet = await Wallet.findOne({ user: referredBy._id });

      await walletHandler.creditWallet(
        referredBy._id,
        amount,
        userConstants.TRANSACTION_STATUS.SUCCESS,
        userConstants.TRANSACTION_REASON.REF,
      );

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
// 6. RESEND OTP
// ======================================================================

export const resendOtp = wrapAsync(async (req, res) => {
  const email = req.session.tempEmail;
  const purpose = req.session.otpPurpose;

  if (!email || !purpose) {
    return sendResponse(res, Responses.resendOtp.DATA_NOT_FOUND);
  }

  await generateOtp(
    email,
    purpose,
    `Resend OTP - ${purpose === userConstants.OTPPURPOSE.SIGNUP ? userConstants.OTP_MESSAGES.SIGNUP : userConstants.OTP_MESSAGES.FORGOTPASSWORD} `,
  );

  return sendResponse(res, Responses.resendOtp.RESEND_OTP);
});

// ======================================================================
// 7. SHOW REGISTER PAGE
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
// 8. SAVE NEW USER (FINAL REGISTER PAGE)
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
// 9. FORGET PASSWORD PAGE
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
// 10. EMAIL SUBMIT (FORGOT PASSWORD)
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

  await generateOtp(
    email,
    userConstants.OTPPURPOSE.FORGOTPASSWORD,
    userConstants.OTP_MESSAGES.FORGOTPASSWORD,
  );

  req.session.tempEmail = email;
  req.session.otpPurpose = userConstants.OTPPURPOSE.FORGOTPASSWORD;

  return sendResponse(res, Responses.forgetPass.OTP_GENERATED);
});

// ======================================================================
// 11. NEW PASSWORD PAGE
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
// 12. UPDATE PASSWORD
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
// 13.HOME PAGE
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
// 14.SHOP PAGE
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
// 15.SHOP PAGE DATA
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
      offers,
      pagination: {
        currentPage,
        totalPages,
      },
    },
  });
});

// ======================================================================
// 16.PRODUCT DETAIL PAGE RENDER
// ======================================================================

export const productDetailPage = wrapAsync(async (req, res) => {
  const id = req.params.id;

  const result = await authServices.productDetailPage(id);

  res.render("user/pages/productdetails", {
    title: "Product detail",
    pageCSS: "productdetails",
    product: result.product,
    relatedProducts: result.relatedProducts,
    showFooter: true,
    showHeader: true,
    pageJS: "productdetails.js",
    breadcrumbs: result.breadcrumbs,
  });
});

// ======================================================================
// 17.ABOUT PAGE
// ======================================================================

export const aboutPage = wrapAsync((req, res) => {
  res.render("user/pages/about", {
    title: "About-JerseyGarage",
    pageCSS: "about",
    showHeader: true,
    showFooter: true,
    pageJS: "",
  });
});

// ======================================================================
// 18. CONTACT PAGE
// ======================================================================

export const contactPage = wrapAsync((req, res) => {
  res.render("user/pages/contact", {
    title: "Contact-JerseyGarage",
    pageCSS: "contact",
    showHeader: true,
    showFooter: true,
    pageJS: "contact.js",
  });
});

// ======================================================================
// 19. PRIVACY AND POLICY PAGE
// ======================================================================

export const privacyPage = wrapAsync((req, res) => {
  res.render("user/pages/privacy", {
    title: "Privacy And Policy-JerseyGarage",
    pageCSS: "privacy",
    showHeader: true,
    showFooter: true,
    pageJS: "",
  });
});

// ======================================================================
// 20. TERMS AND CONDITIONS PAGE
// ======================================================================

export const termsPage = wrapAsync((req, res) => {
  res.render("user/pages/terms", {
    title: "Terms And Conditions-JerseyGarage",
    pageCSS: "terms",
    showHeader: true,
    showFooter: true,
    pageJS: "",
  });
});

// ======================================================================
// 21. RETURN POLICY PAGE
// ======================================================================

export const returnPolicy = wrapAsync((req, res) => {
  res.render("user/pages/returnpolicy", {
    title: "Return And Cancellation Policy-JerseyGarage",
    pageCSS: "returnpolicy",
    showHeader: true,
    showFooter: true,
    pageJS: "",
  });
});

// ======================================================================
// 22. FAQS PAGE
// ======================================================================

export const faqPage = wrapAsync((req, res) => {
  res.render("user/pages/faq", {
    title: "FAQs-JerseyGarage",
    pageCSS: "faq",
    showHeader: true,
    showFooter: true,
    pageJS: "faq.js",
  });
});

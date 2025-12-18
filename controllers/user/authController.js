import bcrypt from "bcrypt";
import User from "../../models/userModel.js";
import Otp from "../../models/otpModel.js";
import Product from "../../models/productModel.js";
import Variant from "../../models/varientModel.js";
import Category from "../../models/categoryModel.js";
import sendOTP from "../../utils/sendOtp.js";
import { generateOtp } from "../../utils/GenerateOtp.js";
import * as Responses from "../../utils/responses/user/auth.responses.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { wrapAsync } from "../../utils/wrapAsync.js";
import * as userValidators from "../../validators/userValidators.js";
import { paginate } from "../../utils/pagination.js";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import productBreadcrumbs from "../../utils/breadcrumbs/product.crumb.js";
import buildBreadcrumbs from "../../utils/breadcrumbs/product.crumb.js";

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
  req.session.user = true;
  // User logged in successfully
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

  const user = await User.findOne({ email });
  if (!user) {
    return sendResponse(res, Responses.loginUser.USER_NOT_FOUND);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return sendResponse(res, Responses.loginUser.PASSWORD_NOT_MATCH);
  }

  // Store session
  req.session.user = {
    id: user._id,
    email: user.email,
  };

  return sendResponse(res, Responses.loginUser.LOGIN);
});

// ======================================================================
// 4. SIGNUP PAGE (EMAIL PAGE)
// ======================================================================

export const signUpPage = wrapAsync((req, res) => {
  res.render("user/pages/signup", {
    title: "Email SignUp",
    pageCSS: "signup",
    showHeader: true,
    showFooter: true,
    pageJS: "signup.js",
  });
});

// ======================================================================
// 5. USER SUBMITS EMAIL (SIGNUP) → GENERATE OTP
// ======================================================================

export const getEmail = wrapAsync(async (req, res) => {
  const { error } = userValidators.userMailSchema.validate(req.body);

  if (error) {
    return sendResponse(res, {
      code: 400,
      message: error.details[0].message,
    });
  }

  const { email } = req.body;

  console.log(email);

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return sendResponse(res, Responses.signupUserEmail.USER_FOUND);
  }

  await generateOtp(email, "signup", "SignUp OTP. ");

  req.session.tempEmail = email;
  req.session.otpPurpose = "signup";

  return sendResponse(res, Responses.signupUserEmail.EMAIL_OK);
});

// ======================================================================
// 6. RENDER OTP PAGE
// ======================================================================

export const renderOtpPage = wrapAsync((req, res) => {
  res.render("user/pages/otp-verify", {
    title: "OTP Verification",
    errorMessage: "",
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
  const email = req.session.tempEmail;
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
  console.log(otpValue);

  const otpDoc = await Otp.findOne({ email, purpose, is_used: false });

  if (!otpDoc) {
    return sendResponse(res, Responses.otpVerify.OTP_EXPIRED);
  }

  if (otpDoc.otp_code !== otpValue) {
    return sendResponse(res, Responses.otpVerify.INCORRECT_OTP);
  }

  otpDoc.is_used = true;
  await otpDoc.save();

  if (purpose === "signup") {
    return sendResponse(res, Responses.otpVerify.REGISTER);
  } else {
    return sendResponse(res, Responses.otpVerify.NEWPASSWORD);
  }
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

export const renderSignupDetails = wrapAsync((req, res) => {
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

export const saveSignupDetails = wrapAsync(async (req, res) => {
  const email = req.session.tempEmail;

  if (!email) return sendResponse(res, Responses.registerLogic.DATA_NOT_FOUND);

  const { error } = userValidators.registerSchema.validate(req.body);

  if (error) {
    return sendResponse(res, {
      code: 400,
      message: error.details[0].message,
    });
  }

  const { fullName, password, confirmPassword } = req.body;

  const newUser = new User({
    full_name: fullName,
    email,
    password_hash: password,
  });

  await newUser.save();

  delete req.session.tempEmail;
  delete req.session.otpPurpose;

  return sendResponse(res, Responses.registerLogic.ACCOUNT_CREATED);
});

// ======================================================================
// 11. FORGET PASSWORD PAGE
// ======================================================================

export const renderForgetPasswordPage = wrapAsync((req, res) => {
  res.render("user/pages/signup", {
    title: "Forget Password",
    pageCSS: "signup",
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
  console.log(email);

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

  res.render("user/pages/home", {
    title: "Home",
    pageCSS: "home",
    showHeader: true,
    showFooter: true,
    pageJS: "home.js",
    products,
  });
});

// ======================================================================
// 16.SHOP PAGE
// ======================================================================

export const renderShopPage = wrapAsync(async (req, res) => {
  const { category, team, size, minRange, maxRange, sort } = req.query;

  console.log(sort);

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

    if (productIds.length === 0) {
      return res.render("user/pages/shop", {
        title: "Shop",
        pageCSS: "shop",
        showFooter: true,
        showHeader: true,
        pageJS: "",
        categories: await Category.find({}, { _id: 1, name: 1 }),
        products: [],
      });
    }
  }

  const filter = {};

  if (category) {
    const categoryDoc = await Category.findOne({ name: category }).select(
      "_id"
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
  if (sort === "all") sortStage = { createdAt: -1 };
  if (sort === "price_low") sortStage = { sPrice: 1 };
  if (sort === "price_high") sortStage = { sPrice: -1 };
  if (sort === "az") sortStage = { name: 1 };
  if (sort === "za") sortStage = { name: -1 };

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
  ]);

  products.forEach((element) => {
    console.log(element.name);
  });

  const categories = await Category.find({}, { _id: 1, name: 1 });

  const teamNames = await Product.find().select("teamName");

  res.render("user/pages/shop", {
    title: "Shop",
    pageCSS: "shop",
    showFooter: true,
    showHeader: true,
    pageJS: "",
    teamNames,
    categories,
    products,

    selectedCategory: category || "",
    selectedTeam: team || "",
    selectedSize: size || "",
    minRange: minRange || 0,
    maxRange: maxRange || 2000,
    selectedSort: sort || "",
  });
});

// ======================================================================
// 17.PRODUCT DETAIL PAGE RENDER
// ======================================================================

export const productDetailPage = wrapAsync(async (req, res) => {
  const id = req.params.id;

  const product = await Product.aggregate([
    { $match: { _id: new ObjectId(id) } },
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

  const relatedProducts = await Product.aggregate([
    {
      $match: {
        category: new ObjectId(product[0].category),
        _id: { $ne: new ObjectId(id) },
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
  const pName = { id: product[0]._id ,name: product[0].name,}

  const breadcrumbs = buildBreadcrumbs({ category: pCategory, product: pName });

  res.render("user/pages/productdetails", {
    title: "Product detail",
    pageCSS: "productdetails",
    product,
    relatedProducts: finalRelatedProducts,
    showFooter: true,
    showHeader: true,
    pageJS: "productdetails.js",
    breadcrumbs,
  });
});

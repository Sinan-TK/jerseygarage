import Category from "../../models/categoryModel.js";
import Offer from "../../models/offerModel.js";
import Product from "../../models/productModel.js";
import wrapAsync from "../../utils/wrapAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import offerSchema from "../../validators/offerValidator.js";
import paginate from "../../utils/pagination.js";
import { ObjectId } from "mongodb";
import * as Responses from "../../utils/responses/admin/offer.response.js";

// ======================================================================
// 1. OFFER LISTING PAGE
// ======================================================================

export const offerListingPage = wrapAsync(async (req, res) => {
  res.render("admin/pages/offers", {
    title: "Offers",
    showLayout: true,
    cssFile: "/css/admin/offers.css",
    pageJS: "offers.js",
  });
});

// ======================================================================
// 2. OFFER DATA
// ======================================================================

export const offerData = wrapAsync(async (req, res) => {
  const { search, typeFilter, statusFilter, page } = req.query;

  let filter = {};

  if (search) {
    filter.name = {
      $regex: search,
      $options: "i",
    };
  }
  if (typeFilter) {
    filter.offerApplyType = typeFilter;
  }
  if (statusFilter === "active") {
    filter.isActive = true;
  }

  if (statusFilter === "inactive") {
    filter.isActive = false;
  }

  const pagination = await paginate(Offer, page, 10, filter);

  const products = await Product.find({ is_active: true }).select("name");
  const categories = await Category.find({ is_active: true }).select("name");
  return sendResponse(res, {
    code: 200,
    message: "Offers listed successfully",
    data: {
      offers: pagination.data,
      products,
      categories,
      pagination: pagination.meta,
    },
  });
});

// ======================================================================
// 3. ADD OFFER
// ======================================================================

export const addOffer = wrapAsync(async (req, res) => {
  const { error } = offerSchema.validate(req.body);

  if (error) {
    return sendResponse(res, {
      code: 400,
      message: error.details[0].message,
    });
  }

  const {
    name,
    offerApplyType,
    productIds = [],
    categoryIds = [],
    discountType,
    discountValue,
    startDate,
    endDate,
    isActive,
  } = req.body;

  if (discountType === "percentage" && discountValue > 100) {
    return sendResponse(res, Responses.offerRes.EXCEED_100);
  }

  if (offerApplyType === "product") {
    const validProducts = await Product.find({
      _id: { $in: productIds },
      is_active: true,
    });

    if (validProducts.length !== productIds.length) {
      return sendResponse(res, Responses.offerRes.INVALID_PRODUCT);
    }
  }
  if (offerApplyType === "category") {
    const validCategories = await Category.find({
      _id: { $in: categoryIds },
      is_active: true,
    });

    if (validCategories.length !== categoryIds.length) {
      return sendResponse(res, Responses.offerRes.INVALID_CATEGORY);
    }
  }
  const existing = await Offer.findOne({
    name: { $regex: `^${name}$`, $options: "i" },
  });

  if (existing) {
    return sendResponse(res, Responses.offerRes.NAME_EXIST);
  }

  const newOffer = new Offer({
    name,
    offerApplyType,
    productIds: offerApplyType === "product" ? productIds : [],
    categoryIds: offerApplyType === "category" ? categoryIds : [],
    discountType,
    discountValue,
    startDate,
    endDate,
    isActive,
  });

  await newOffer.save();

  return sendResponse(res, Responses.offerRes.CREATED);
});

// ======================================================================
// 4. EDIT OFFER
// ======================================================================

export const editOffer = wrapAsync(async (req, res) => {
  const id = req.params.id;

  const offer = await Offer.findById(id);

  if (!offer) {
    return sendResponse(res, Responses.offerRes.NOT_FOUND);
  }

  const { error } = offerSchema.validate(req.body);

  if (error) {
    return sendResponse(res, {
      code: 400,
      message: error.details[0].message,
    });
  }

  const {
    name,
    offerApplyType,
    productIds = [],
    categoryIds = [],
    discountType,
    discountValue,
    startDate,
    endDate,
    isActive,
  } = req.body;

  if (discountType === "percentage" && discountValue > 100) {
    return sendResponse(res, Responses.offerRes.EXCEED_100);
  }

  if (offerApplyType === "product") {
    const validProducts = await Product.find({
      _id: { $in: productIds },
      is_active: true,
    });

    if (validProducts.length !== productIds.length) {
      return sendResponse(res, Responses.offerRes.INVALID_PRODUCT);
    }
  }

  if (offerApplyType === "category") {
    const validCategories = await Category.find({
      _id: { $in: categoryIds },
      is_active: true,
    });

    if (validCategories.length !== categoryIds.length) {
      return sendResponse(res, Responses.offerRes.INVALID_CATEGORY);
    }
  }

  const existing = await Offer.findOne({
    name: { $regex: `^${name}$`, $options: "i" },
    _id: { $ne: id },
  });

  if (existing) {
    return sendResponse(res, Responses.offerRes.NAME_EXIST);
  }

  await Offer.findByIdAndUpdate(id, {
    name,
    offerApplyType,
    productIds: offerApplyType === "product" ? productIds : [],
    categoryIds: offerApplyType === "category" ? categoryIds : [],
    discountType,
    discountValue,
    startDate,
    endDate,
    isActive,
  });

  return sendResponse(res, Responses.offerRes.UPDATED);
});

// ======================================================================
// 5. DELETE OFFER
// ======================================================================

export const deleteOffer = wrapAsync(async (req, res) => {
  const { id } = req.params;

  const deleted = await Offer.findByIdAndDelete(id);

  if (!deleted) {
    return sendResponse(res, Responses.offerRes.NOT_FOUND);
  }

  return sendResponse(res, Responses.offerRes.DELETED);
});

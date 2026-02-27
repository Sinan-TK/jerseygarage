import Category from "../../models/categoryModel.js";
import Offer from "../../models/offerModel.js";
import Product from "../../models/productModel.js";
import wrapAsync from "../../utils/wrapAsync.js";
import sendResponse from "../../utils/sendResponse.js";

import offerSchema from "../../validators/offerValidator.js";
import paginate from "../../utils/pagination.js";
import { ObjectId } from "mongodb";
import * as Responses from "../../utils/responses/admin/offer.response.js";

//

//

export const offerListingPage = wrapAsync(async (req, res) => {
  res.render("admin/pages/offers", {
    title: "Offers",
    showLayout: true,
    cssFile: "/css/admin/offers.css",
    pageJS: "offers.js",
  });
});

//

//

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

//

//

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

  if (offerApplyType === "product") {
    const validProducts = await Product.find({
      _id: { $in: productIds },
      is_active: true,
    });

    if (validProducts.length !== productIds.length) {
      return sendResponse(res, {
        code: 400,
        message: "One or more selected products are invalid or blocked",
      });
    }
  }
  if (offerApplyType === "category") {
    const validCategories = await Category.find({
      _id: { $in: categoryIds },
      is_active: true,
    });

    if (validCategories.length !== categoryIds.length) {
      return sendResponse(res, {
        code: 400,
        message: "One or more selected categories are invalid or blocked",
      });
    }
  }
  const existing = await Offer.findOne({
    name: { $regex: `^${name}$`, $options: "i" },
  });

  if (existing) {
    return sendResponse(res, {
      code: 400,
      message: "Offer name already exists",
    });
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

  return sendResponse(res, {
    code: 201,
    message: "Offer created successfully",
  });
});

//

//

export const editOffer = wrapAsync(async (req, res) => {
  const id = req.params.id;

  const offer = await Offer.findById(id);

  if (!offer) {
    return sendResponse(res, {
      code: 404,
      message: "Offer not found",
    });
  }

  const { error } = offerSchema.validate(req.body, {
    abortEarly: false,
  });

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

  if (offerApplyType === "product") {
    const validProducts = await Product.find({
      _id: { $in: productIds },
      is_active: true,
    });

    if (validProducts.length !== productIds.length) {
      return sendResponse(res, {
        code: 400,
        message: "One or more selected products are invalid or blocked",
      });
    }
  }

  if (offerApplyType === "category") {
    const validCategories = await Category.find({
      _id: { $in: categoryIds },
      is_active: true,
    });

    if (validCategories.length !== categoryIds.length) {
      return sendResponse(res, {
        code: 400,
        message: "One or more selected categories are invalid or blocked",
      });
    }
  }

  const existing = await Offer.findOne({
    name: { $regex: `^${name}$`, $options: "i" },
    _id: { $ne: id },
  });

  if (existing) {
    return sendResponse(res, {
      code: 400,
      message: "Offer name already exists",
    });
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

  return sendResponse(res, {
    code: 200,
    message: "Offer updated successfully",
  });
});

//

//

export const deleteOffer = wrapAsync(async (req, res) => {
  const { id } = req.params;

  const deleted = await Offer.findByIdAndDelete(id);

  if (!deleted) {
    return sendResponse(res, {
      code: 404,
      message: "Offer not found",
    });
  }

  return sendResponse(res, {
    code: 200,
    message: "Offer deleted successfully",
  });
});

import Category from "../../models/categoryModel.js";
import Product from "../../models/productModel.js";
import wrapAsync from "../../utils/wrapAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import categorySchema from "../../validators/categoryValidator.js";
import paginate from "../../utils/pagination.js";
import { ObjectId } from "mongodb";
import * as Responses from "../../utils/responses/admin/category.response.js";

// ======================================================================
// 1. GET CATEGORY LIST (ADMIN CATEGORIES PAGE)
// ======================================================================
export const getCategories = wrapAsync(async (req, res) => {
  res.render("admin/pages/categories", {
    title: "Categories",
    showLayout: true,
    cssFile: "/css/admin/categories.css",
    pageJS: "categories.js",
  });
});

// ======================================================================
// 2. ADD CATEGORY (POST /admin/categories/add)
// ======================================================================
export const addCategory = wrapAsync(async (req, res) => {
  const { error } = categorySchema.validate(req.body);

  if (error) {
    return sendResponse(res, {
      code: 400,
      message: error.details[0].message,
    });
  }

  const { name, description } = req.body;

  const existingCategory = await Category.findOne({
    name: { $regex: `^${name}$`, $options: "i" },
  });

  if (existingCategory) {
    return sendResponse(res, Responses.categoryRes.CATEGORY_EXIST);
  }

  await Category.create({ name, description });

  return sendResponse(res, Responses.categoryRes.CATEGORY_ADDED);
});

// ======================================================================
// 3. BLOCK CATEGORY
// ======================================================================
export const blockCategory = wrapAsync(async (req, res) => {
  const id = req.params.id;
  const updatedData = await Category.findByIdAndUpdate(
    id,
    { is_active: false },
    { new: true },
  );

  await Product.updateMany({ category: id }, { $set: { is_active: false } });

  return sendResponse(res, {
    ...Responses.categoryStatus.CATEGORY_BLOCK,
    data: updatedData,
  });
});

// ======================================================================
// 4. UNBLOCK CATEGORY
// ======================================================================
export const unblockCategory = wrapAsync(async (req, res) => {
  const id = req.params.id;
  const updatedData = await Category.findByIdAndUpdate(
    id,
    { is_active: true },
    { new: true },
  );

  await Product.updateMany({ category: id }, { $set: { is_active: true } });

  return sendResponse(res, {
    ...Responses.categoryStatus.CATEGORY_UNBLOCK,
    data: updatedData,
  });
});

// ======================================================================
// 5. EDIT CATEGORY
// ======================================================================

export const editCategory = wrapAsync(async (req, res) => {
  const id = new ObjectId(req.params.id);
  const { name, description } = req.body;

  const { error } = categorySchema.validate(req.body);

  if (error) {
    return sendResponse(res, {
      code: 400,
      message: error.details[0].message,
    });
  }

  const existingCategory = await Category.findOne({
    name: { $regex: `^${name}$`, $options: "i" },
    _id: { $ne: id },
  });

  if (existingCategory) {
    return sendResponse(res, Responses.categoryRes.CATEGORY_EXIST);
  }

  await Category.findByIdAndUpdate(id, {
    name,
    description,
  });

  return sendResponse(res, Responses.categoryRes.CATEGORY_EDITED);
});

// ======================================================================
// 6.SEARCH CATEGORY
// ======================================================================

export const searchCategory = wrapAsync(async (req, res) => {
  const { page, search, status } = req.query;

  let filter = {};

  if (search?.trim()) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    filter.name = { $regex: escapedSearch, $options: "i" };
  }

  if (status === "blocked") filter.is_active = false;
  if (status === "active") filter.is_active = true;

  const result = await paginate(Category, page, 8, filter);
  const products = await Product.find();

  return sendResponse(res, {
    code: 200,
    message: "data rendered successfully",
    data: { categories: result.data, pagination: result.meta, products },
  });
});

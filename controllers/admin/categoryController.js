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
  let page = req.query.page || 1;

  const result = await paginate(Category, page, 8);

  const products = await Product.find({});

  res.render("admin/pages/categories", {
    title: "Categories",
    showLayout: true,
    cssFile: "/css/admin/categories.css",
    categories: result.data,
    pagination: result.meta,
    pageJS: "categories.js",
    products,
    categoryStatus: req.query.categoryStatus || "all",
    searchContent: req.query.searchContent,
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

  const { name, description, color } = req.body;

  const existingCategory = await Category.findOne({
    name: { $regex: `^${name}$`, $options: "i" },
  });

  if (existingCategory) {
    return sendResponse(res, Responses.categoryRes.CATEGORY_EXIST);
  }

  await Category.create({ name, description, color });
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
  const { name, description, color } = req.body;

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

  const updatedCategory = await Category.findByIdAndUpdate(
    id,
    {
      name,
      description,
      color,
    },
    {
      new: true,
    },
  );

  return sendResponse(res, {
    ...Responses.categoryRes.CATEGORY_EDITED,
    data: updatedCategory,
  });
});

// ======================================================================
// 6.SEARCH CATEGORY
// ======================================================================

export const searchCategory = wrapAsync(async (req, res) => {
  const search = req.query.searchContent || "";
  const status = req.query.categoryStatus || "all";

  console.log(search, status);

  let filter = {};

  if (search) {
    filter.$or = [{ name: { $regex: search, $options: "i" } }];
  }

  if (status === "blocked") filter.is_active = false;
  if (status === "active") filter.is_active = true;

  let page = req.query.page || 1;

  const result = await paginate(Category, page, 8, filter);

  res.render("admin/pages/categories", {
    title: "Categories",
    showLayout: true,
    cssFile: "/css/admin/categories.css",
    categories: result.data,
    pagination: result.meta,
    pageJS: "categories.js",
    categoryStatus: req.query.categoryStatus || "all",
    searchContent: req.query.searchContent,
  });
});

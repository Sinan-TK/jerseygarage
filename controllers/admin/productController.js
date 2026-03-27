import Product from "../../models/productModel.js";
import Category from "../../models/categoryModel.js";
import Variant from "../../models/variantModel.js";
import wrapAsync from "../../utils/wrapAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import cloudinary from "../../config/cloudinary.js";
import paginate from "../../utils/pagination.js";
import { ObjectId } from "mongodb";
import * as Responses from "../../utils/responses/admin/product.response.js";
import * as adminConstants from "../../constants/adminConstants.js";
import * as productService from "../../services/admin/productService.js";
import statusCode from "../../constants/statusCode.js";

// ======================================================================
// 1.PRODUCT PAGE RENDER
// ======================================================================

export const productsPageRender = wrapAsync(async (req, res) => {
  const categoriesName = await Category.find().select("name");

  res.render("admin/pages/products", {
    title: "Products",
    showLayout: true,
    cssFile: "/css/admin/products.css",
    pageJS: "products.js",
    categoriesName,
  });
});

// ======================================================================
// 2.PRODUCT PAGE DATA
// ======================================================================

export const productsPageData = wrapAsync(async (req, res) => {
  const { search, status, page } = req.query;

  let filter = {};

  if (search?.trim()) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    filter.name = { $regex: escapedSearch, $options: "i" };
  }

  if (status === adminConstants.productStatus.False) filter.is_active = false;
  if (status === adminConstants.productStatus.True) filter.is_active = true;

  const result = await paginate(Product, page, 10, filter);

  const categoriesName = await Category.find().select("name");

  const productIds = result.data.map((p) => p._id);

  const variants = await Variant.find({
    product_id: { $in: productIds },
  }).lean();

  const productsWithVariants = result.data.map((product) => {
    const category = categoriesName.find(
      (c) => c._id.toString() === product.category.toString(),
    );

    return {
      ...product,
      variants: variants.filter(
        (v) => v.product_id.toString() === product._id.toString(),
      ),
      catName: category?.name || adminConstants.unknownUser,
    };
  });

  return sendResponse(res, {
    code: statusCode.SUCCESS.OK,
    message: "Product listing data rendered",
    data: { products: productsWithVariants, pagination: result.meta },
  });
});

// ======================================================================
// 3.ADD PRODUCT
// ======================================================================

export const addProduct = wrapAsync(async (req, res) => {
  const result = await productService.addProductService(req.body, req.files);

  if (result?.error) {
    sendResponse(res, result.error);
  } else {
    sendResponse(res, Responses.addProduct.PRODUCT_ADDED);
  }
});

// ======================================================================
// 4.BLOCK PRODUCT
// ======================================================================

export const blockProduct = wrapAsync(async (req, res) => {
  const id = req.params.id;

  await Product.findByIdAndUpdate(id, { is_active: false });

  return sendResponse(res, Responses.productStatus.PRODUCT_BLOCK);
});

// ======================================================================
// 5.UNBLOCK PRODUCT
// ======================================================================

export const unblockProduct = wrapAsync(async (req, res) => {
  const id = req.params.id;

  const categoryId = await Product.findOne({ _id: id }).select("category");

  const catStatus = await Category.findOne({ _id: categoryId.category }).select(
    "is_active",
  );

  if (!catStatus.is_active) {
    return sendResponse(res, Responses.productStatus.CATEGORY_BLOCKED);
  }

  await Product.findByIdAndUpdate(id, { is_active: true });

  return sendResponse(res, Responses.productStatus.PRODUCT_UNBLOCK);
});

// ======================================================================
// 6.REMOVE IMAGE -- EDIT MODAL PREVIEW
// ======================================================================

export const removeImage = wrapAsync(async (req, res) => {
  const { productId, imageUrl } = req.body;

  if (!productId || !imageUrl) {
    return sendResponse(res, Responses.removeImg.NO_REQUIRED);
  }

  const publicId = imageUrl.split("/").pop().split(".")[0];

  await cloudinary.uploader.destroy(`products/${publicId}`);

  await Product.findByIdAndUpdate(
    productId,
    { $pull: { images: imageUrl } },
    { new: true },
  );

  return sendResponse(res, Responses.removeImg.IMG_ROMOVED);
});

// ======================================================================
// 7.SUBMIT EDIT MODAL
// ======================================================================

export const editProduct = wrapAsync(async (req, res) => {
  const result = await productService.editProductService(req);

  if (result?.error) {
    return sendResponse(res, result.error);
  } else {
    return sendResponse(res, Responses.addProduct.PRODUCT_EDITED);
  }
});

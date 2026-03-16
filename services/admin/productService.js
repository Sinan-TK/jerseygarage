import cloudinary from "../../config/cloudinary.js";
import Category from "../../models/categoryModel.js";
import Variant from "../../models/variantModel.js";
import Product from "../../models/productModel.js";
import * as Responses from "../../utils/responses/admin/product.response.js";
import * as adminConstants from "../../constants/adminConstants.js";

// ======================================================================
// 1. ADD PRODUCT SERVICE
// ======================================================================

export const addProductService = async (body, files) => {
  const { productName, teamName, description, category } = body;

  if (!productName) {
    return { error: Responses.addProduct.NO_PRODUCT };
  }

  if (!category) {
    return { error: Responses.addProduct.NO_CATEGORY };
  }

  if (!teamName) {
    return { error: Responses.addProduct.NO_TEAM };
  }

  if (!description) {
    return { error: Responses.addProduct.NO_DES };
  }

  let stock = {};
  let normalPrice = {};
  let basePrice = {};

  try {
    stock = JSON.parse(body.stock || adminConstants.emptyJsonObject);
    normalPrice = JSON.parse(
      body.normalPrice || adminConstants.emptyJsonObject,
    );
    basePrice = JSON.parse(body.basePrice || adminConstants.emptyJsonObject);
  } catch {
    return { error: Responses.addProduct.INVALID_FORMAT };
  }

  if (!files || files.length === 0) {
    return { error: Responses.addProduct.NO_IMAGE };
  }

  if (files.length < 3) {
    return { error: Responses.addProduct.MIN_IMAGE };
  }

  if (files.length > 5) {
    return { error: Responses.addProduct.MAX_IMAGE };
  }

  const sizes = adminConstants.productSizeArray;

  for (let size of sizes) {
    if (!stock[size] || !normalPrice[size] || !basePrice[size]) {
      return { error: Responses.addProduct.SIZE_REQ };
    }

    if (Number(normalPrice[size]) < Number(basePrice[size])) {
      return { error: Responses.addProduct.PRICE_LOGIC };
    }

    if (
      Number(stock[size] < 0) ||
      Number(normalPrice[size] < 0) ||
      Number(basePrice[size] < 0)
    ) {
      return { error: Responses.addProduct.POSITIVE_LOGIC };
    }
  }

  const uploadedImages = [];

  for (let file of files) {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "products" }, (error, response) => {
          if (error) reject(error);
          else resolve(response);
        })
        .end(file.buffer);
    });

    uploadedImages.push(result.secure_url);
  }

  const categoryDoc = await Category.findOne({ name: category });

  if (!categoryDoc) {
    return { error: Responses.addProduct.CATEGORY_NOT_EXIST };
  }

  const product = await Product.create({
    name: productName,
    teamName,
    description,
    category: categoryDoc._id,
    images: uploadedImages,
  });

  await Variant.insertMany(
    sizes.map((size) => ({
      product_id: product._id,
      size,
      base_price: Number(basePrice[size]),
      normal_price: Number(normalPrice[size]),
      stock: Number(stock[size]),
      is_available: Number(stock[size]) > 0,
    })),
  );

  return { success: true };
};

// ======================================================================
// 2. EDIT PRODUCT SERVICE
// ======================================================================

export const editProductService = async (req) => {
  const { productName, teamName, description, category } = req.body;
  const productId = req.params.id;

  if (!productName) return { error: Responses.addProduct.NO_PRODUCT };
  if (!category) return { error: Responses.addProduct.NO_CATEGORY };
  if (!teamName) return { error: Responses.addProduct.NO_TEAM };
  if (!description) return { error: Responses.addProduct.NO_DES };

  let stock = {};
  let normalPrice = {};
  let basePrice = {};

  try {
    stock = JSON.parse(req.body.stock || adminConstants.emptyJsonObject);
    normalPrice = JSON.parse(
      req.body.normalPrice || adminConstants.emptyJsonObject,
    );
    basePrice = JSON.parse(
      req.body.basePrice || adminConstants.emptyJsonObject,
    );
  } catch {
    return { error: Responses.addProduct.INVALID_FORMAT };
  }

  const sizes = adminConstants.productSizeArray;

  for (let size of sizes) {
    if (!stock[size] || !normalPrice[size] || !basePrice[size]) {
      return { error: Responses.addProduct.SIZE_REQ };
    }

    if (Number(normalPrice[size]) < Number(basePrice[size])) {
      return { error: Responses.addProduct.PRICE_LOGIC };
    }

    if (
      Number(stock[size] < 0) ||
      Number(normalPrice[size] < 0) ||
      Number(basePrice[size] < 0)
    ) {
      {
        error: Responses.addProduct.POSITIVE_LOGIC;
      }
      return;
    }
  }

  const product = await Product.findById(productId);
  if (!product) {
    return { error: Responses.addProduct.PRODUCT_NOT_FOUND };
  }

  const categoryDoc = await Category.findOne({ name: category });
  if (!categoryDoc) {
    return { error: Responses.addProduct.CATEGORY_NOT_EXIST };
  }

  product.name = productName;
  product.teamName = teamName;
  product.description = description;
  product.category = categoryDoc._id;

  let uploadedImages = [];

  if (req.files && req.files.length > 0) {
    if (req.files.length > 5) {
      return { error: Responses.addProduct.MAX_IMAGE };
    }

    for (let file of req.files) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "products" }, (error, response) => {
            if (error) reject(error);
            else resolve(response);
          })
          .end(file.buffer);
      });

      uploadedImages.push(result.secure_url);
    }
  }

  const finalImageCount = product.images.length + uploadedImages.length;

  if (finalImageCount < 3) {
    return { error: Responses.addProduct.MIN_IMAGE };
  }

  if (finalImageCount > 5) {
    return { error: Responses.addProduct.MAX_IMAGE };
  }

  if (uploadedImages.length > 0) {
    product.images.push(...uploadedImages);
  }

  await product.save();

  for (let size of sizes) {
    await Variant.findOneAndUpdate(
      { product_id: product._id, size },
      {
        base_price: Number(basePrice[size]),
        normal_price: Number(normalPrice[size]),
        stock: Number(stock[size]),
        is_available: Number(stock[size]) > 0,
      },
      { upsert: true },
    );
  }

  return { success: true };
};

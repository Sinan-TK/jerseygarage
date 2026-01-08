import Product from "../../models/productModel.js";
import Category from "../../models/categoryModel.js";
import Variant from "../../models/varientModel.js";
import { wrapAsync } from "../../utils/wrapAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import cloudinary from "../../config/cloudinary.js";
import upload from "../../middlewares/multer.js";
import { paginate } from "../../utils/pagination.js";
import { ObjectId } from "mongodb";
import * as Responses from "../../utils/responses/admin/product.response.js";

const uploadImages = upload.array("images", 5);

// ======================================================================
// 1.PRODUCT PAGE RENDER
// ======================================================================

export const productsPageRender = wrapAsync(async (req, res) => {
  let page = req.query.page || 1;

  req.session.page = page;

  const result = await paginate(Product, page, 10);

  const categoriesName = await Category.find().select("name");

  const productIds = result.data.map((p) => p._id);

  const variants = await Variant.find({
    product_id: { $in: productIds },
  }).lean();

  const productsWithVariants = result.data.map((product) => {
    return {
      ...product.toObject(),
      variants: variants.filter(
        (v) => v.product_id.toString() === product._id.toString()
      ),
    };
  });

  res.render("admin/pages/products", {
    title: "Products",
    showLayout: true,
    cssFile: "/css/admin/products.css",
    pageJS: "products.js",
    products: productsWithVariants,
    pagination: result.meta,
    searchContent: "",
    categoriesName,
  });
});

// ======================================================================
// 2.ADD PRODUCT
// ======================================================================

export const addProduct = wrapAsync(async (req, res) => {
  try {
    const { productName, teamName, description, category } = req.body;

    if (!productName) {
      sendResponse(res, Responses.addProduct.NO_PRODUCT);
      return;
    }

    if (!category) {
      sendResponse(res, Responses.addProduct.NO_CATEGORY);
      return;
    }

    if (!teamName) {
      sendResponse(res, Responses.addProduct.NO_TEAM);
      return;
    }

    if (!description) {
      sendResponse(res, Responses.addProduct.NO_DES);
      return;
    }

    let stock = {};
    let normalPrice = {};
    let basePrice = {};

    try {
      stock = JSON.parse(req.body.stock || "{}");
      normalPrice = JSON.parse(req.body.normalPrice || "{}");
      basePrice = JSON.parse(req.body.basePrice || "{}");
    } catch {
      sendResponse(res, Responses.addProduct.INVALID_FORMAT);
      return;
    }

    if (!req.files || req.files.length === 0) {
      sendResponse(res, Responses.addProduct.NO_IMAGE);
      return;
    }

    if (req.files.length < 3) {
      sendResponse(res, Responses.addProduct.MIN_IMAGE);
      return;
    }

    if (req.files.length > 5) {
      sendResponse(res, Responses.addProduct.MAX_IMAGE);
      return;
    }

    const sizes = ["S", "M", "L", "XL", "XXL"];

    for (let size of sizes) {
      if (!stock[size] || !normalPrice[size] || !basePrice[size]) {
        sendResponse(res, Responses.addProduct.SIZE_REQ);
        return;
      }

      if (Number(normalPrice[size]) < Number(basePrice[size])) {
        sendResponse(res, Responses.addProduct.PRICE_LOGIC);
        return;
      }
    }

    const uploadedImages = [];

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

    const categoryDoc = await Category.findOne({ name: category });

    if (!categoryDoc) {
      sendResponse(res, Responses.addProduct.CATEGORY_NOT_EXIST);
      return;
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
      }))
    );

    sendResponse(res, Responses.addProduct.PRODUCT_ADDED);
  } catch (error) {
    console.error("Add Product Error:", error);
    sendResponse(res, Responses.addProduct.ERROR_500);
  }
});

// ======================================================================
// 2.BLOCK PRODUCT
// ======================================================================

export const blockProduct = wrapAsync(async (req, res) => {
  const id = req.params.id;

  const data = await Product.findByIdAndUpdate(
    id,
    { is_active: false },
    { new: true }
  );

  return sendResponse(res, Responses.productStatus.PRODUCT_BLOCK);
});

// ======================================================================
// 3.UNBLOCK PRODUCT
// ======================================================================

export const unblockProduct = wrapAsync(async (req, res) => {
  const id = req.params.id;

  const categoryId = await Product.findOne({ _id: id }).select("category");

  const catStatus = await Category.findOne({ _id: categoryId.category }).select(
    "is_active"
  );

  if (!catStatus.is_active) {
    return sendResponse(res, Responses.productStatus.CATEGORY_BLOCKED);
  }

  const data = await Product.findByIdAndUpdate(
    id,
    { is_active: true },
    { new: true }
  );

  return sendResponse(res, Responses.productStatus.PRODUCT_UNBLOCK);
});

// ======================================================================
// 4.REMOVE IMAGE -- EDIT MODAL PREVIEW
// ======================================================================

export const removeImage = wrapAsync(async (req, res) => {
  const { productId, imageUrl } = req.body;

  if (!productId || !imageUrl) {
    return res.status(400).json({
      success: false,
      message: "Product ID and Image URL are required",
    });
  }

  const publicId = imageUrl.split("/").pop().split(".")[0];

  await cloudinary.uploader.destroy(`products/${publicId}`);

  await Product.findByIdAndUpdate(
    productId,
    { $pull: { images: imageUrl } },
    { new: true }
  );

  return sendResponse(res, Responses.removeImg.IMG_ROMOVED);
});

// ======================================================================
// 5.SUBMIT EDIT MODAL
// ======================================================================

export const editProduct = wrapAsync(async (req, res) => {

  try {
    const { productName, teamName, description, category } = req.body;
    const productId = req.params.id;

    if (!productName) return sendResponse(res, Responses.addProduct.NO_PRODUCT);
    if (!category) return sendResponse(res, Responses.addProduct.NO_CATEGORY);
    if (!teamName) return sendResponse(res, Responses.addProduct.NO_TEAM);
    if (!description) return sendResponse(res, Responses.addProduct.NO_DES);

    let stock = {};
    let normalPrice = {};
    let basePrice = {};

    try {
      stock = JSON.parse(req.body.stock || "{}");
      normalPrice = JSON.parse(req.body.normalPrice || "{}");
      basePrice = JSON.parse(req.body.basePrice || "{}");
    } catch {
      return sendResponse(res, Responses.addProduct.INVALID_FORMAT);
    }

    const sizes = ["S", "M", "L", "XL", "XXL"];

    for (let size of sizes) {
      if (!stock[size] || !normalPrice[size] || !basePrice[size]) {
        return sendResponse(res, Responses.addProduct.SIZE_REQ);
      }

      if (Number(normalPrice[size]) < Number(basePrice[size])) {
        return sendResponse(res, Responses.addProduct.PRICE_LOGIC);
      }
    }

    const product = await Product.findById(productId);
    if (!product) {
      return sendResponse(res, Responses.addProduct.PRODUCT_NOT_FOUND);
    }

    const categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc) {
      return sendResponse(res, Responses.addProduct.CATEGORY_NOT_EXIST);
    }

    product.name = productName;
    product.teamName = teamName;
    product.description = description;
    product.category = categoryDoc._id;

    let uploadedImages = [];

    if (req.files && req.files.length > 0) {
      if (req.files.length > 5) {
        return sendResponse(res, Responses.addProduct.MAX_IMAGE);
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
      return sendResponse(res, Responses.addProduct.MIN_IMAGE);
    }

    if (finalImageCount > 5) {
      return sendResponse(res, Responses.addProduct.MAX_IMAGE);
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
        { upsert: true }
      );
    }

    return sendResponse(res, Responses.addProduct.PRODUCT_EDITED);
  } catch (error) {
    console.error("Edit Product Error:", error);
    return sendResponse(res, Responses.addProduct.ERROR_500);
  }
});

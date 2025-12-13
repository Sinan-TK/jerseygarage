import Product from "../../models/productModel.js";
import Category from "../../models/categoryModel.js";
import { wrapAsync } from "../../utils/wrapAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import cloudinary from "../../config/cloudinary.js";
import upload from "../../middlewares/multer.js";
// import { categorySchema } from "../../validators/categoryValidator.js";
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

  res.render("admin/pages/products", {
    title: "Products",
    showLayout: true,
    cssFile: "/css/admin/products.css",
    pageJS: "products.js",
    products: result.data,
    pagination: result.meta,
    searchContent: "",
    categoriesName,
  });
});

// ======================================================================
// 2.ADD PRODUCT
// ======================================================================

export const addProduct = wrapAsync(async (req, res) => {
  uploadImages(req, res, (err) => {
    if (err) {
      return sendResponse(res, {
        code: 400,
        message: err.message || "File upload error!",
      });
    }

    (async () => {
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
          return sendResponse(res, {
            code: 400,
            message: "Team name is required!",
          });
        }

        let stock = {};
        let normalPrice = {};
        let basePrice = {};

        try {
          stock = JSON.parse(req.body.stock || "{}");
          normalPrice = JSON.parse(req.body.normalPrice || "{}");
          basePrice = JSON.parse(req.body.basePrice || "{}");
        } catch {
          sendResponse(res, {
            code: 400,
            message: "Invalid stock or price format!",
          });
          return;
        }

        if (!req.files || req.files.length === 0) {
          sendResponse(res, {
            code: 400,
            message: "No image uploaded!",
          });
          return;
        }

        if (req.files.length < 3) {
          sendResponse(res, {
            code: 400,
            message: "Minimum 3 images required!",
          });
          return;
        }

        if (req.files.length > 5) {
          sendResponse(res, {
            code: 400,
            message: "Maximum 5 images allowed!",
          });
          return;
        }

        const sizes = ["S", "M", "L", "XL", "XXL"];

        for (let size of sizes) {
          if (!stock[size] || !normalPrice[size] || !basePrice[size]) {
            sendResponse(res, {
              code: 400,
              message: `Stock, Normal Price, and Base Price are required for size ${size}!`,
            });
            return;
          }

          if (Number(normalPrice[size]) < Number(basePrice[size])) {
            sendResponse(res, {
              code: 400,
              message: `Normal price must be greater than base price for size ${size}!`,
            });
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
          sendResponse(res, {
            code: 400,
            message: "Selected category does not exist!",
          });
          return;
        }

        const sizesArray = sizes.map((size) => ({
          size,
          stock: Number(stock[size]),
          basePrice: Number(basePrice[size]),
          normalPrice: Number(normalPrice[size]),
        }));

        await Product.create({
          name: productName,
          teamName,
          description,
          category: categoryDoc._id,
          images: uploadedImages,
          sizes: sizesArray,
        });

        sendResponse(res, {
          code: 200,
          message: "Product added successfully!",
        });
      } catch (error) {
        console.error("Add Product Error:", error);
        sendResponse(res, {
          code: 500,
          message: "Something went wrong!",
        });
      }
    })();
  });
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

  res.json({
    success: true,
    message: "Product Unlisted!",
  });
});

// ======================================================================
// 3.UNBLOCK PRODUCT
// ======================================================================

export const unblockProduct = wrapAsync(async (req, res) => {
  const id = req.params.id;

  const data = await Product.findByIdAndUpdate(
    id,
    { is_active: true },
    { new: true }
  );
  res.json({
    success: true,
    message: "Product Listed!",
  });
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

  //Extract Cloudinary public_id from URL
  const publicId = imageUrl.split("/").pop().split(".")[0];

  //Remove image from Cloudinary
  await cloudinary.uploader.destroy(`products/${publicId}`);

  //Remove image from MongoDB
  await Product.findByIdAndUpdate(
    productId,
    { $pull: { images: imageUrl } },
    { new: true }
  );

  return res.json({
    success: true,
    message: "Image removed successfully",
  });
});

// ======================================================================
// 5.SUBMIT EDIT MODAL
// ======================================================================

export const editProduct = wrapAsync(async (req, res) => {
  uploadImages(req, res, async (err) => {
    // Multer limit handler
    if (err) {
      return res.status(400).json({
        success: false,
        message: "Maximum 5 images allowed!",
      });
    }

    try {
      const { productName, teamName, description, category } = req.body;

      console.log(productName, teamName, description, category);

      const stock = JSON.parse(req.body.stock);
      const normalPrice = JSON.parse(req.body.normalPrice);
      const basePrice = JSON.parse(req.body.basePrice);

      if (!productName) {
        return res.json({
          success: false,
          message: "Product name required!",
        });
      }

      if (!category) {
        return res.json({
          success: false,
          message: "Select Category!",
        });
      }

      if (!teamName) {
        return res.json({
          success: false,
          message: "Team name required!",
        });
      }

      // Images Validation (min/max)
      if (!req.files || req.files.length === 0) {
        return res.json({
          success: false,
          message: "No image uploaded!",
        });
      }

      if (req.files.length < 3) {
        return res.json({
          success: false,
          message: "Minimum 3 images required!",
        });
      }
      // Price validation
      for (let i in stock) {
        if (!normalPrice[i] || !basePrice[i] || !stock[i]) {
          return res.json({
            success: false,
            message: "Stock, Normal price and Base price are required!",
          });
        }

        if (Number(normalPrice[i]) < Number(basePrice[i])) {
          return res.json({
            success: false,
            message: "Normal price should always be greater than base price!",
          });
        }
      }

      // -------------------------
      // UPLOAD TO CLOUDINARY NOW
      // -------------------------

      const uploadedImages = [];

      for (let file of req.files) {
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "products" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          stream.end(file.buffer);
        });

        uploadedImages.push(uploadResult.secure_url);
      }

      console.log("CLOUDINARY URLs:", uploadedImages);

      // After uploadedImages[] is created

      const categoryId = await Category.findOne({ name: category });

      console.log(categoryId);

      const sizesList = ["S", "M", "L", "XL", "XXL"];

      const sizeArray = sizesList.map((size) => ({
        size,
        stock: Number(stock[size]),
        basePrice: Number(basePrice[size]),
        normalPrice: Number(normalPrice[size]),
      }));

      const product = await Product.create({
        name: productName,
        teamName,
        description,
        category: categoryId,
        images: uploadedImages,
        sizes: sizeArray,
      });

      console.log(product);

      return res.json({
        success: true,
        message: "Product added successfully!",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Something went wrong!",
      });
    }
  });
});

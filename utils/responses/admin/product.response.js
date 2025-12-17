// utils/responses.js

export const addProduct = Object.freeze({
  NO_PRODUCT: {
    code: 400,
    message: "Product name is required!",
  },
  NO_CATEGORY: {
    code: 400,
    message: "Category is required!",
  },
  NO_TEAM: {
    code: 400,
    message: "Team name is required!",
  },
  NO_DES: {
    code: 400,
    message: "Description is required!",
  },
  INVALID_FORMAT: {
    code: 400,
    message: "Invalid stock or price format!",
  },
  NO_IMAGE: {
    code: 400,
    message: "No image uploaded!",
  },
  MIN_IMAGE: {
    code: 400,
    message: "Minimum 3 images required!",
  },
  MAX_IMAGE: {
    code: 400,
    message: "Maximum 5 images allowed!",
  },
  SIZE_REQ: {
    code: 400,
    message: `Stock, Normal Price, and Base Price are required!`,
  },
  PRICE_LOGIC: {
    code: 400,
    message: `Normal price must be greater than base price!`,
  },
  CATEGORY_NOT_EXIST: {
    code: 400,
    message: "Selected category does not exist!",
  },
  PRODUCT_ADDED: {
    code: 200,
    message: "Product added successfully!",
  },
  PRODUCT_EDITED: {
    code: 200,
    message: "Product added successfully!",
  },
  ERROR_500: {
    code: 500,
    message: "Something went wrong!",
  },
});

export const productStatus = Object.freeze({
  CATEGORY_BLOCKED:{
    code:403,
    message:"Category is blocked",
  },
  PRODUCT_BLOCK: {
    code: 200,
    message: "Product blocked!",
  },
  PRODUCT_UNBLOCK: {
    code: 200,
    message: "Product Unlisted!",
  },
});

export const removeImg = Object.freeze({
  IMG_ROMOVED: {
    code: 200,
    message: "Image removed successfully!",
  },
});


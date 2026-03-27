// utils/responses.js
import statusCode from "../../../constants/statusCode.js";

export const addProduct = Object.freeze({
  NO_PRODUCT: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Product name is required!",
  },
  NO_CATEGORY: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Category is required!",
  },
  NO_TEAM: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Team name is required!",
  },
  NO_DES: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Description is required!",
  },
  INVALID_FORMAT: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Invalid stock or price format!",
  },
  NO_IMAGE: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "No image uploaded!",
  },
  MIN_IMAGE: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Minimum 3 images required!",
  },
  MAX_IMAGE: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Maximum 5 images allowed!",
  },
  SIZE_REQ: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: `Stock, Normal Price, and Base Price are required!`,
  },
  PRICE_LOGIC: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: `Normal price must be greater than base price!`,
  },
  POSITIVE_LOGIC: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: `Stock, Normal Price, and Base Price must be positive number!`,
  },
  CATEGORY_NOT_EXIST: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Selected category does not exist!",
  },
  PRODUCT_ADDED: {
    code: statusCode.SUCCESS.OK,
    message: "Product added successfully!",
  },
  PRODUCT_EDITED: {
    code: statusCode.SUCCESS.OK,
    message: "Product edited successfully!",
  },
  ERROR_500: {
    code: statusCode.SERVER.INTERNAL_SERVER_ERROR,
    message: "Something went wrong!",
  },
});

export const productStatus = Object.freeze({
  CATEGORY_BLOCKED: {
    code: statusCode.CLIENT.FORBIDDEN,
    message: "Category is blocked",
  },
  PRODUCT_BLOCK: {
    code: statusCode.SUCCESS.OK,
    message: "Product blocked!",
  },
  PRODUCT_UNBLOCK: {
    code: statusCode.SUCCESS.OK,
    message: "Product Unlisted!",
  },
});

export const removeImg = Object.freeze({
  NO_REQUIRED: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Product ID and Image URL are required",
  },
  IMG_ROMOVED: {
    code: statusCode.SUCCESS.OK,
    message: "Image removed successfully!",
  },
  EXCEED_4MB: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Each image must be under 4MB",
  },
  EXCEED_MAX: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Maximum 5 images allowed",
  },
});

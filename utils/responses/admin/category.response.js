// utils/responses.js
import statusCode from "../../../constants/statusCode.js";

export const categoryRes = Object.freeze({
  CATEGORY_EXIST: {
    code: statusCode.CLIENT.NOT_FOUND,
    message: "Category already exists!",
  },
  CATEGORY_ADDED: {
    code: statusCode.SUCCESS.OK,
    message: "Category added successfully!",
  },
  CATEGORY_EDITED: {
    code: statusCode.SUCCESS.OK,
    message: "Category updated successfully!",
  }
});

export const categoryStatus = Object.freeze({
  CATEGORY_BLOCK:{
    code: statusCode.SUCCESS.OK,
    message: "Category blocked successfully!",
  },
  CATEGORY_UNBLOCK:{
    code: statusCode.SUCCESS.OK,
    message: "Category unblocked successfully!",
  }
});

export const editCategory = Object.freeze({
    CATEGORY_EXIST: {
    code: statusCode.CLIENT.NOT_FOUND,
    message: "Category already exists!",
  },
})
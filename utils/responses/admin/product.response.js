// utils/responses.js

export const addProduct = Object.freeze({
  NO_PRODUCT: {
    code: 404,
    message: "Product name is required!",
  },
  NO_CATEGORY: {
    code: 404,
    message: "Category is required!",
  },
  NO_TEAM: {
    code: 404,
    message: "Product name sdfasfrequired!",
  }
});

export const categoryStatus = Object.freeze({
  CATEGORY_BLOCK:{
    code: 200,
    message: "Category blocked successfully!",
  },
  CATEGORY_UNBLOCK:{
    code: 200,
    message: "Category unblocked successfully!",
  }
});

export const editCategory = Object.freeze({
    CATEGORY_EXIST: {
    code: 404,
    message: "Category already exists!",
  },
})
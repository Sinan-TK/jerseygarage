// utils/responses.js

export const categoryRes = Object.freeze({
  CATEGORY_EXIST: {
    code: 404,
    message: "Category already exists!",
  },
  CATEGORY_ADDED: {
    code: 200,
    message: "Category added successfully!",
  },
  CATEGORY_EDITED: {
    code: 200,
    message: "Category updated successfully!",
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
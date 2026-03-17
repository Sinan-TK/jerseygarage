export const offerRes = Object.freeze({
  EXCEED_100: {
    code: 400,
    message: "Percentage discount cannot exceed 100%",
  },
  INVALID_PRODUCT: {
    code: 400,
    message: "One or more selected products are invalid or blocked",
  },
  INVALID_CATEGORY: {
    code: 400,
    message: "One or more selected categories are invalid or blocked",
  },
  NAME_EXIST: {
    code: 400,
    message: "Offer name already exists",
  },
  CREATED: {
    code: 201,
    message: "Offer created successfully",
  },
  UPDATED: {
    code: 200,
    message: "Offer updated successfully",
  },
  NOT_FOUND: {
    code: 404,
    message: "Offer not found",
  },
  DELETED: {
    code: 200,
    message: "Offer deleted successfully",
  },
});

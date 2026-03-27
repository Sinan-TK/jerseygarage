import statusCode from "../../../constants/statusCode.js";

export const offerRes = Object.freeze({
  EXCEED_100: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Percentage discount cannot exceed 100%",
  },
  INVALID_PRODUCT: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "One or more selected products are invalid or blocked",
  },
  INVALID_CATEGORY: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "One or more selected categories are invalid or blocked",
  },
  NAME_EXIST: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Offer name already exists",
  },
  CREATED: {
    code: statusCode.SUCCESS.CREATED,
    message: "Offer created successfully",
  },
  UPDATED: {
    code: statusCode.SUCCESS.OK,
    message: "Offer updated successfully",
  },
  NOT_FOUND: {
    code: statusCode.CLIENT.NOT_FOUND,
    message: "Offer not found",
  },
  DELETED: {
    code: statusCode.SUCCESS.OK,
    message: "Offer deleted successfully",
  },
});

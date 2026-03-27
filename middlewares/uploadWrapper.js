import sendResponse from "../utils/sendResponse.js";
import upload from "../config/multer.js";
import statusCode from "../constants/statusCode.js";

export const uploadImages = (req, res, next) => {
  upload.array("images", 5)(req, res, (err) => {
    if (err) {
      return sendResponse(res, {
        code: statusCode.CLIENT.BAD_REQUEST,
        message: err.message,
      });
    }
    next();
  });
};

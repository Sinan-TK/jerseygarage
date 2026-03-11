import sendResponse from "../utils/sendResponse.js";
import upload from "../config/multer.js";

export const uploadImages = (req, res, next) => {
  upload.array("images", 5)(req, res, (err) => {
    if (err) {
      return sendResponse(res, {
        code: 400,
        message: err.message,
      });
    }
    next();
  });
};

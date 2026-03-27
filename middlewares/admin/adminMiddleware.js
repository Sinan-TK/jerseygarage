import Admin from "../../models/adminModel.js";
import sendResponse from "../../utils/sendResponse.js";
import { productUpload } from "../../config/multer.js";
import multer from "multer";
import statusCode from "../../constants/statusCode.js";
import * as Responses from "../../utils/responses/admin/product.response.js";

export const adminExists = async (req, res, next) => {
  if (req.session.admin) {
    return res.redirect("/admin/dashboard");
  }
  next();
};

export const uploadProductImages = (req, res, next) => {
  productUpload.array("images", 5)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return sendResponse(res, Responses.removeImg.EXCEED_4MB);
      }
      if (err.code === "LIMIT_FILE_COUNT") {
        return sendResponse(res, Responses.removeImg.EXCEED_MAX);
      }
      return sendResponse(res, {
        code: statusCode.CLIENT.BAD_REQUEST,
        message: err.message,
      });
    } else if (err) {
      return sendResponse(res, {
        code: statusCode.CLIENT.BAD_REQUEST,
        message: err.message,
      });
    }
    next();
  });
};

import Admin from "../../models/adminModel.js";
import sendResponse from "../../utils/sendResponse.js";
import { productUpload } from "../../config/multer.js";
import multer from "multer";

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
        return sendResponse(res, {
          code: 400,
          message: "Each image must be under 4MB",
        });
      }
      if (err.code === "LIMIT_FILE_COUNT") {
        return sendResponse(res, {
          code: 400,
          message: "Maximum 5 images allowed",
        });
      }
      return sendResponse(res, { code: 400, message: err.message });
    } else if (err) {
      return sendResponse(res, { code: 400, message: err.message });
    }
    next();
  });
};

import multer from "multer";
import path from "path";

/* =========================
   FILE FILTER
========================= */
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;

  const extName = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimeType = allowedTypes.test(file.mimetype);

  if (extName && mimeType) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpg, jpeg, png, webp) are allowed"), false);
  }
};

/* =========================
   PRODUCT UPLOAD
========================= */
export const productUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    files: 5,
    fileSize: 4 * 1024 * 1024,
  },
});

/* =========================
   AVATAR UPLOAD
========================= */
export const avatarUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    files: 1,
    fileSize: 2 * 1024 * 1024, // 2MB
  },
});

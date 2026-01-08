import multer from "multer";
import path from "path";

/* =========================
   FILE FILTER
========================= */
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;

  const extName = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimeType = allowedTypes.test(file.mimetype);

  if (extName && mimeType) {
    cb(null, true);
  } else {
    cb(
      new Error("Only image files (jpg, jpeg, png, webp) are allowed"),
      false
    );
  }
};

/* =========================
   MULTER INSTANCE
========================= */
const upload = multer({
  storage: multer.memoryStorage(), // ✅ Cloudinary
  fileFilter,
  limits: {
    files: 5,                     // max 5 images
    fileSize: 4 * 1024 * 1024,    // 4MB per image
  },
});

export default upload;

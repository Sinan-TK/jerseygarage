import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(), // stores buffer in RAM
  limits: { files: 5 }             // max 5 images
});

export default upload;

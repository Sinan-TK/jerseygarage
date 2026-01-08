import express from "express";
import * as productController from "../../controllers/admin/productController.js";
import * as adminMiddleware from "../../middlewares/adminMiddleware.js";
import { uploadImages } from "../../middlewares/uploadWrapper.js";

const router = express.Router();

router.get("/", productController.productsPageRender);

router.post("/add", uploadImages, productController.addProduct);

router.patch("/edit/:id", uploadImages, productController.editProduct);

router.patch("/block/:id", productController.blockProduct);

router.patch("/unblock/:id", productController.unblockProduct);

router.patch("/remove-image", productController.removeImage);

export default router;

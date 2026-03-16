import express from "express";
import * as productController from "../../controllers/admin/productController.js";
import * as adminMiddleware from "../../middlewares/admin/adminMiddleware.js";

const router = express.Router();

router.get("/", productController.productsPageRender);

router.get("/data", productController.productsPageData);

router.post("/add", adminMiddleware.uploadProductImages, productController.addProduct);

router.patch("/edit/:id", adminMiddleware.uploadProductImages, productController.editProduct);

router.patch("/block/:id", productController.blockProduct);

router.patch("/unblock/:id", productController.unblockProduct);

router.patch("/remove-image", productController.removeImage);

export default router;

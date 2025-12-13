import express from "express";
import * as productController from "../../controllers/admin/productController.js";
import * as adminMiddleware from "../../middlewares/adminMiddleware.js";

const router = express.Router();

router.get("/", productController.productsPageRender);

router.post("/add", productController.addProduct);

router.patch("/block/:id", productController.blockProduct);

router.patch("/unblock/:id", productController.unblockProduct);

router.patch("/remove-image", productController.removeImage);

router.patch("/edit/:id", productController.editProduct);

export default router;

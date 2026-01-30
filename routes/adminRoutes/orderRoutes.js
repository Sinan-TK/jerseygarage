import express from "express";
import * as orderController from "../../controllers/admin/orderController.js";
import * as adminMiddleware from "../../middlewares/adminMiddleware.js";

const router = express.Router();

router.get("/", orderController.orderPageRender);

router.get("/details", orderController.orderDetailsPageRender);

export default router;

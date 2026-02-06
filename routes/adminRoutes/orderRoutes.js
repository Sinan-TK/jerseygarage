import express from "express";
import * as orderController from "../../controllers/admin/orderController.js";
import * as adminMiddleware from "../../middlewares/adminMiddleware.js";

const router = express.Router();

router.get("/", orderController.orderPageRender);

router.get("/data", orderController.ordersListing);

router.get("/details/:id", orderController.orderDetailsPageRender);

router.patch("/change-status", orderController.changeStatus);


export default router;

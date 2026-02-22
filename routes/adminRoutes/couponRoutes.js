import express from "express";
import * as couponController from "../../controllers/admin/couponController.js";
import * as adminMiddleware from "../../middlewares/adminMiddleware.js";

const router = express.Router();

router.get("/", couponController.couponPage);

// router.get("/data", offerController.offerData);

// router.post("/add", offerController.addOffer);

// router.put("/edit/:id", offerController.editOffer);

// router.delete("/delete/:id", offerController.deleteOffer);


export default router;

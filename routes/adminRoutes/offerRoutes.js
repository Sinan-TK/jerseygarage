import express from "express";
import * as offerController from "../../controllers/admin/offerController.js";
import * as adminMiddleware from "../../middlewares/adminMiddleware.js";

const router = express.Router();

router.get("/", offerController.offerListingPage);

router.get("/data", offerController.offerData);

router.post("/add", offerController.addOffer);

router.put("/edit/:id", offerController.editOffer);

router.delete("/delete/:id", offerController.deleteOffer);


export default router;

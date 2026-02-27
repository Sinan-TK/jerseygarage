import express from "express";
import * as couponController from "../../controllers/admin/couponController.js";
import * as adminMiddleware from "../../middlewares/adminMiddleware.js";

const router = express.Router();

router.get("/", couponController.couponPage);

router.get("/add", couponController.addCouponPage);

router.post("/add", couponController.addCoupon);

router.get("/data", couponController.fetchCoupons);

router.get("/edit/:id", couponController.editCouponPage);

router.get("/edit/data/:couponId", couponController.editCouponData);

router.patch("/edit/:couponId", couponController.editCoupon);

router.get("/details/:couponId", couponController.couponDetailsPage);

router.delete("/delete/:couponId", couponController.deleteCoupon);

export default router;

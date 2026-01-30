import express from "express";
import * as adminController from "../../controllers/admin/adminController.js";
import * as adminMiddleware from "../../middlewares/adminMiddleware.js";
import upload from "../../middlewares/multer.js";
import { adminLayout } from "../../middlewares/layoutMiddleware.js";
import adminUserRoutes from "../adminRoutes/userRoutes.js";
import categoryRoutes from "../adminRoutes/categoryRoutes.js";
import orderRoutes from "../adminRoutes/orderRoutes.js";
import productRoutes from "../adminRoutes/productRoutes.js";

const router = express.Router();

router.use(adminLayout);

router.get("/login",adminMiddleware.adminExists, adminController.renderLoginPage);

router.post("/login",adminMiddleware.adminExists , adminController.loginAdmin);

router.use(adminMiddleware.isLoggedIn);

router.get("/dashboard",adminController.featureNotAvailable);


router.use('/users',adminUserRoutes);

router.use('/categories',categoryRoutes);

router.use('/products',productRoutes);

router.use("/orders",orderRoutes);




router.get("/offers",adminController.featureNotAvailable);


router.get("/payments",adminController.featureNotAvailable);

router.get("/refunds",adminController.featureNotAvailable);

router.get("/reviews",adminController.featureNotAvailable);

router.get('/logout', adminController.logOut );

router.get('/users/search', adminController.searchUser);


// router.get('/featureNotAvailable',adminController.featureNotAvailable);

export default router;

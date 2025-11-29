import express from "express";
import * as adminController from "../../controllers/admin/adminController.js";
import * as adminMiddleware from "../../middlewares/adminMiddleware.js";
import upload from "../../middlewares/multer.js";
import { adminLayout } from "../../middlewares/layoutMiddleware.js";
import adminUserRoutes from "../adminRoutes/userRoutes.js"
import categoryRoutes from "../adminRoutes/categoryRoutes.js"

const router = express.Router();

router.use(adminLayout);

router.get("/login",adminMiddleware.adminExists, adminController.renderLoginPage);

router.post("/login", adminController.loginAdmin);

router.get("/dashboard",adminMiddleware.isLoggedIn,adminController.featureNotAvailable);

//user Routes
router.use('/users',adminUserRoutes);

router.use('/categories',categoryRoutes);

router.get("/products",adminMiddleware.isLoggedIn,adminController.productsPageRender);

router.post("/products/add",adminController.addProduct);

router.patch("/products/block/:id",adminController.blockProduct);

router.patch("/products/unblock/:id",adminController.unblockProduct);

router.get("/offers",adminMiddleware.isLoggedIn,adminController.featureNotAvailable);

router.get("/orders",adminMiddleware.isLoggedIn,adminController.featureNotAvailable);

router.get("/payments",adminMiddleware.isLoggedIn,adminController.featureNotAvailable);

router.get("/refunds",adminMiddleware.isLoggedIn,adminController.featureNotAvailable);

router.get("/reviews",adminMiddleware.isLoggedIn,adminController.featureNotAvailable);

router.get('/logout', adminController.logOut );

router.get('/users/search', adminController.searchUser);


// router.get('/featureNotAvailable',adminController.featureNotAvailable);

export default router;

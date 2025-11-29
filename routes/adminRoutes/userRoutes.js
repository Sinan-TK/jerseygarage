import express from "express";
import * as adminController from "../../controllers/admin/adminController.js";
import * as adminMiddleware from "../../middlewares/adminMiddleware.js";

const router = express.Router();

router.get("/",adminMiddleware.isLoggedIn, adminController.getUsers);

router.patch("/block/:id",adminMiddleware.isLoggedIn, adminController.blockUser);

router.patch("/unblock/:id",adminMiddleware.isLoggedIn, adminController.unblockUser);

export default router;
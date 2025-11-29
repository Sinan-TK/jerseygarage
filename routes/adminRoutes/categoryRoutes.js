import express from "express";
import * as categoryController from "../../controllers/admin/categoryController.js";
import * as adminMiddleware from "../../middlewares/adminMiddleware.js";

const router = express.Router();

router.get("/",adminMiddleware.isLoggedIn,categoryController.getCategories)

router.post("/add",categoryController.addCategory);

router.patch("/unblock/:id",adminMiddleware.isLoggedIn, categoryController.unblockCategory );

router.patch("/block/:id",adminMiddleware.isLoggedIn, categoryController.blockCategory );

router.patch("/edit/:id", categoryController.editCategory);

router.get('/search', categoryController.searchCategory);

export default router;
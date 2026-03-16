import express from "express";
import * as categoryController from "../../controllers/admin/categoryController.js";
import * as adminMiddleware from "../../middlewares/admin/adminMiddleware.js";

const router = express.Router();

router.get("/", categoryController.getCategories);

router.get("/data", categoryController.searchCategory);

router.post("/add", categoryController.addCategory);

router.patch("/unblock/:id", categoryController.unblockCategory);

router.patch("/block/:id", categoryController.blockCategory);

router.patch("/edit/:id", categoryController.editCategory);

export default router;

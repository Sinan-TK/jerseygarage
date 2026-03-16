import express from "express";
import * as userController from "../../controllers/admin/userController.js";
import * as adminMiddleware from "../../middlewares/admin/adminMiddleware.js";

const router = express.Router();

router.get("/", userController.getUsers);

router.get("/data", userController.userData);

router.patch("/:action/:id", userController.statusAction);

export default router;

import express from "express";
import * as userController from "../../controllers/admin/userController.js";
import * as adminMiddleware from "../../middlewares/adminMiddleware.js";

const router = express.Router();

router.get("/", userController.getUsers);

router.patch("/block/:id", userController.blockUser);

router.patch("/unblock/:id", userController.unblockUser);

router.get("/search", userController.searchUser);

export default router;

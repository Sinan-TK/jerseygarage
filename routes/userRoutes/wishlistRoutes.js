import express from "express";
import * as userMiddleware from "../../middlewares/userMiddleware.js";
import * as authMiddleware from "../../middlewares/authMiddleware.js";
import * as wishlistController from "../../controllers/user/wishlistController.js";

const router = express.Router();

router.get("/", wishlistController.wishlistRender);

router.get("/data", wishlistController.wishlistData);

router.post("/", wishlistController.addWishlist);

router.delete("/:id", wishlistController.removeWishlist);



export default router;
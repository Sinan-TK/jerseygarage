import express from "express";
import * as userMiddleware from "../middlewares/userMiddleware.js";
import * as authMiddleware from "../middlewares/authMiddleware.js";
import * as userController from "../controllers/user/userController.js";
import { userLayout } from "../middlewares/layoutMiddleware.js";
import { sidebarData } from "../middlewares/sidebarMiddleware.js";
import { Userdetails } from "../middlewares/profileUserDetails.js";
import { checkBlockedUser } from "../middlewares/userBlockMiddleware.js";

const router = express.Router();

router.use(userLayout);

router.use(sidebarData);

router.use(checkBlockedUser);

router.use(Userdetails);

router.use(authMiddleware.profileIcon);

router.get("/profile", userController.profileRender);

router.patch("/profile/edit", userController.editPersonalInfo);

// router.get("/email/otp-verify", userController.emailOtpPage);

router.get("/address", userController.addressRender);

router.get("/cart", userController.cartRender);

router.get("/wishlist", userController.wishlistRender);

router.post("/logout", userController.userLogout);

export default router;

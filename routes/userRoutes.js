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

router.use(userMiddleware.cartItemsCount);

// router.use(Userdetails);

router.use(authMiddleware.profileIcon);

router.get("/profile",Userdetails, userController.profileRender);

router.patch("/profile/edit",Userdetails, userController.editPersonalInfo);

// router.get("/email/otp-verify", userController.emailOtpPage);

router.get("/address",Userdetails, userController.addressPageRender);

router.get("/address/data",Userdetails, userController.addressData);

router.post("/address",Userdetails, userController.addAddress);

router.delete("/address",Userdetails,userController.removeAddress);

router.patch("/address/edit/:id",Userdetails,userController.editAddress)

router.get("/cart",Userdetails, userController.cartRender);

router.get("/wishlist",Userdetails, userController.wishlistRender);

router.post("/wishlist",userMiddleware.userNotFound,Userdetails,userController.addWishlist);

router.patch("/wishlist/:id",Userdetails,userController.removeWishlist);

router.post("/add-to-cart",userMiddleware.userNotFound,userController.addToCart);

router.patch("/cart",userController.cartQuantity);

router.post("/buy-now",userController.buyNow);

router.post("/checkout",userController.proceedToCheckout);

router.get("/checkout",userMiddleware.checkoutMiddleware,userController.checkoutPage);

router.delete("/cart/remove",userController.deleteCartItem);

router.post("/logout",Userdetails, userController.userLogout);

export default router;

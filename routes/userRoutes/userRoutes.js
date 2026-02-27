import express from "express";
import * as userMiddleware from "../../middlewares/userMiddleware.js";
import * as authMiddleware from "../../middlewares/authMiddleware.js";
import * as userController from "../../controllers/user/userController.js";
import { userLayout } from "../../middlewares/layoutMiddleware.js";
import { sidebarData } from "../../middlewares/sidebarMiddleware.js";
import { checkBlockedUser } from "../../middlewares/userBlockMiddleware.js";
import wishlistRoutes from "./wishlistRoutes.js";

const router = express.Router();

router.use(userLayout);

router.use(sidebarData);

router.use(checkBlockedUser);

router.use(userMiddleware.cartItemsCount);

router.use(userMiddleware.userNotFound);

router.use(authMiddleware.profileIcon);

router.get(
  "/profile",
  userMiddleware.Userdetails,
  userController.profileRender,
);

router.patch(
  "/profile/edit",
  userMiddleware.Userdetails,
  userController.editPersonalInfo,
);

router.get("/email-verify", userController.emailOtpVerify);

router.post("/email-verify", userController.emailVerification);

router.patch("/profile/change-password", userController.editPassword);

router.get(
  "/address",
  userMiddleware.Userdetails,
  userController.addressPageRender,
);

router.get(
  "/address/data",
  userMiddleware.Userdetails,
  userController.addressData,
);

router.post("/address", userMiddleware.Userdetails, userController.addAddress);

router.delete(
  "/address",
  userMiddleware.Userdetails,
  userController.removeAddress,
);

router.patch(
  "/address/edit/:id",
  userMiddleware.Userdetails,
  userController.editAddress,
);

router.get("/cart", userMiddleware.Userdetails, userController.cartRender);

// router.get("/wishlist", userMiddleware.Userdetails, userController.wishlistRender);

// router.post("/wishlist", userMiddleware.Userdetails, userController.addWishlist);

// router.delete("/wishlist/:id", userMiddleware.Userdetails, userController.removeWishlist);
router.use("/wishlist", userMiddleware.Userdetails, wishlistRoutes);

router.post("/add-to-cart", userController.addToCart);

router.patch("/cart", userController.cartQuantity);

router.post("/checkout", userController.proceedToCheckout);

router.get(
  "/checkout",
  userMiddleware.checkoutMiddleware,
  userController.checkoutPage,
);

router.post("/checkout/coupon", userController.applyCoupon);

router.post("/place-order", userController.placeOrder);

router.post("/payment/verify", userController.orderPayVerify);

router.delete("/cart/remove", userController.deleteCartItem);

router.get("/order/success", userController.orderSuccess);

router.get(
  "/orders",
  userMiddleware.Userdetails,
  userController.orderListingPage,
);

router.get("/orders/:id", userController.orderDetailsPage);

router.get("/orders/invoice/:orderId", userController.downloadInvoice);

router.patch("/orders/order-action", userController.orderCancelReturn);

router.get("/wallet", userMiddleware.Userdetails, userController.walletPage);

router.get("/wallet/data", userController.walletData);

router.post("/wallet/topup", userController.walletTopupOrder);

router.post("/wallet/verify", userController.verifyWalletTopup);

router.get(
  "/referral",
  userMiddleware.Userdetails,
  userController.referralPage,
);

router.post("/logout", userMiddleware.Userdetails, userController.userLogout);

export default router;

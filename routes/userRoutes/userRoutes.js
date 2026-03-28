import express from "express";
import * as userMiddleware from "../../middlewares/user/userMiddleware.js";
import * as authMiddleware from "../../middlewares/user/authMiddleware.js";
import * as userController from "../../controllers/user/userController.js";
import wishlistRoutes from "./wishlistRoutes.js";

const router = express.Router();

router.use(authMiddleware.userLayout);

router.use(authMiddleware.sidebarData);

router.use(authMiddleware.checkBlockedUser);

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

router.patch(
  "/profile/avatar",
  userMiddleware.uploadAvatar,
  userController.changeAvatar,
);

router.delete("/profile/avatar", userController.deleteDp);

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

router.post("/payment/failed", userController.orderPayFailed);

router.delete("/cart/remove", userController.deleteCartItem);

router.get(
  "/order/success",
  userMiddleware.checkOrder,
  userController.orderSuccess,
);

router.get(
  "/order/failed",
  userMiddleware.checkOrder,
  userController.orderFailed,
);

router.get(
  "/orders",
  userMiddleware.Userdetails,
  userController.orderListingPage,
);

router.get("/orders/data", userController.orderListingData);

router.get("/orders/:id", userController.orderDetailsPage);

router.post("/retry-payment", userController.retryPayment);

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

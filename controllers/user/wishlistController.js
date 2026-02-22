import User from "../../models/userModel.js";
import Product from "../../models/productModel.js";
import Wishlist from "../../models/wishlistModel.js";
import wrapAsync from "../../utils/wrapAsync.js";
import { ObjectId } from "mongodb";
import sendResponse from "../../utils/sendResponse.js";
import * as Responses from "../../utils/responses/user/user.response.js";

// ======================================================================
// 1. WISHLIST PAGE RENDER
// ======================================================================
export const wishlistRender = wrapAsync(async (req, res) => {
  //   const user_id = new ObjectId(req.session.user.id);

  //   const wishlist = await Wishlist.findOne({ user_id })
  //     .populate({
  //       path: "items.variant_id",
  //       populate: {
  //         path: "product_id",
  //         select: "name images teamName",
  //       },
  //     })
  //     .lean();

  //   const items = wishlist ? wishlist.items : [];

  res.render("user/layouts/profilelayout", {
    title: "User Wishlist",
    pageCSS: "wishlist",
    view: "wishlist",
    // products: items,
    profile: true,
    showHeader: true,
    showFooter: true,
    pageJS: "wishlist.js",
  });
});
// ======================================================================
// 2. WISHLIST --> PRODUCT ADDING
// ======================================================================

export const wishlistData = wrapAsync(async (req, res) => {
  const user_id = new ObjectId(req.session.user.id);

  const wishlist = await Wishlist.findOne({ user_id })
    .populate({
      path: "items.variant_id",
      populate: {
        path: "product_id",
        select: "name images teamName",
      },
    })
    .lean();

  const items = wishlist ? wishlist.items : [];

  sendResponse(res, {
    code: 200,
    message: "product render successfully",
    data: items,
  });
});

// ======================================================================
// 3. WISHLIST --> PRODUCT ADDING
// ======================================================================

export const addWishlist = wrapAsync(async (req, res) => {
  const { variantId } = req.body;
  const user_id = req.session.user.id;
  const variant_Id = new ObjectId(variantId);

  const exists = await Wishlist.exists({
    user_id,
    "items.variant_id": variant_Id,
  });

  if (exists) {
    await Wishlist.updateOne(
      { user_id },
      { $pull: { items: { variant_id: variant_Id } } },
    );

    return sendResponse(res, Responses.addWishlist.ALREADY_EXIST);
  }

  await Wishlist.findOneAndUpdate(
    { user_id },
    { $addToSet: { items: { variant_id: variant_Id } } },
    { upsert: true },
  );

  return sendResponse(res, Responses.addWishlist.PRODUCT_ADDED);
});

// ======================================================================
// 3. REMOVE ITEM FROM WISHLIST
// ======================================================================

export const removeWishlist = wrapAsync(async (req, res) => {
  const id = new ObjectId(req.params.id);
  const user_id = req.session.user.id;

  await Wishlist.updateOne(
    { user_id },
    {
      $pull: {
        items: { variant_id: id },
      },
    },
  );

  return sendResponse(res, Responses.removeWishlist.REMOVED);
});

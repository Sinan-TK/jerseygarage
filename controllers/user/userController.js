import { wrapAsync } from "../../utils/wrapAsync.js";
import { personalInfo } from "../../validators/userValidators.js";
import * as Responses from "../../utils/responses/user/user.response.js";
import { sendResponse } from "../../utils/sendResponse.js";
import addressValidators from "../../validators/addressValidators.js";
import User from "../../models/userModel.js";
import Address from "../../models/addressModel.js";
import Wishlist from "../../models/wishlistModel.js";
import Variant from "../../models/varientModel.js";
import Cart from "../../models/cartModel.js";
import Product from "../../models/productModel.js";
import { ObjectId } from "mongodb";
import { buildCheckoutItems } from "../../utils/buildCheckoutItems.js";

// ======================================================================
// 1. CART PAGE RENDER
// ======================================================================
export const cartRender = wrapAsync(async (req, res) => {
  const user_id = req.session.user.id;

  const cart = await Cart.findOne({ user_id });

  const products = await buildCheckoutItems(cart.items);

  const shippingCharge = 50;

  const priceDetails = {
    subtotal: cart.total_amount,
    total: shippingCharge + cart.total_amount,
  };

  res.render("user/pages/cart", {
    title: "Cart",
    pageCSS: "cart",
    showHeader: true,
    showFooter: true,
    pageJS: "cart.js",

    products,
    priceDetails,
  });
});
// ======================================================================
// 2. CART QUANTITY CHANGE
// ======================================================================
export const cartQuantity = wrapAsync(async (req, res) => {
  const user_id = req.session.user.id;
  const { variant_id, value, quantity } = req.body;
  const shippingCharge = 50;

  if (!variant_id || !["plus", "minus"].includes(value)) {
    return sendResponse(res, Responses.cartQuantity.INVALID);
  }

  const cart = await Cart.findOne({ user_id });

  if (!cart) {
    return sendResponse(res, Responses.cartQuantity.CART_NOT_FOUND);
  }

  const item = cart.items.find((i) => i.variant_id.toString() === variant_id);

  const itemVariant = await Variant.findById(variant_id);

  if (!item) {
    return sendResponse(res, Responses.cartQuantity.ITEM_NOT_FOUND);
  }

  if (value === "plus") {
    if (itemVariant.stock > item.quantity) {
      item.quantity += 1;
    }else{
      return sendResponse(res,Responses.cartQuantity.STOCK_OUT)
    }
  }

  if (value === "minus") {
    if (item.quantity === 1 || parseInt(quantity) === 1) {
      return sendResponse(res, Responses.cartQuantity.QUANTITY_ZERO);
    } else {
      item.quantity -= 1;
    }
  }

  let total = 0;
  let itemTotal = 0;
  for (const cartItem of cart.items) {
    const variant = await Variant.findById(cartItem.variant_id);
    if (variant._id.toString() === variant_id) {
      itemTotal = variant.base_price * cartItem.quantity;
    }
    total += variant.base_price * cartItem.quantity;
  }

  cart.total_amount = total;
  await cart.save();

  return sendResponse(res, {
    code: 200,
    message: "Quantity changed successfully",
    data: {
      quantity: item?.quantity || 0,
      itemTotal,
      subtotal: cart.total_amount,
      total: shippingCharge + cart.total_amount,
    },
  });
});

// ======================================================================
// 2. PROFILE PAGE RENDER
// ======================================================================
export const profileRender = (req, res) => {
  res.render("user/layouts/profilelayout", {
    title: "User Profile",
    pageCSS: "profile",
    view: "profile",
    profile: true,
    showHeader: true,
    showFooter: true,
    pageJS: "profile.js",
  });
};

// ======================================================================
// 3. EDIT PERSONAL INFORMATION
// ======================================================================
export const editPersonalInfo = wrapAsync(async (req, res) => {
  const { error } = personalInfo.validate(req.body);

  if (error) {
    return sendResponse(res, {
      code: 400,
      message: error.details[0].message,
    });
  }

  const { fullName, email, phoneNo } = req.body;

  const user = await User.findById(req.session.user.id);

  const result = await User.findByIdAndUpdate(
    user._id,
    { $set: { full_name: fullName, phone_no: phoneNo } },
    { new: true }
  );

  const matchMail = await User.findOne({
    email: email,
    _id: { $ne: user._id },
  });

  if (matchMail) {
    return sendResponse(res, Responses.personalInfoEdit.EMAIL_EXIST);
  }

  if (user.email != email) {
    return sendResponse(res, Responses.personalInfoEdit.EMAIL_CHANGE);
  }
});

// ======================================================================
// 4. EMAIL OTP VERIFICATION PAGE RENDER
// ======================================================================
// export const emailOtpPage = (req, res) => {
//   res.render("user/pages/otp-verify", {
//     title: "OTP Verification",
//     pageCSS: "otp-verify",
//     showHeader: true,
//     showFooter: true,
//     pageJS: "otp-verify.js",
//   });
// };

// ======================================================================
// 4. ADDRESS PAGE RENDER
// ======================================================================
export const addressPageRender = wrapAsync(async (req, res) => {
  // const user_id = req.session.user.id;

  // const addresses = await Address.find({ user_id })
  //   .sort({ is_default: -1, createdAt: -1 })
  //   .lean();

  res.render("user/layouts/profilelayout", {
    title: "User Addresses",
    // addresses,
    pageCSS: "address",
    view: "address",
    profile: true,
    showHeader: true,
    showFooter: true,
    pageJS: "address.js",
  });
});
// ======================================================================
// 4. ADDRESS ADD
// ======================================================================

export const addressData = wrapAsync(async (req, res) => {
  const user_id = req.session.user.id;

  const addresses = await Address.find({ user_id })
    .sort({ is_default: -1, createdAt: -1 })
    .lean();

  return sendResponse(res, {
    code: 200,
    message: "data retrieved successfully",
    data: {
      addresses,
    },
  });
});

// ======================================================================
// 4. ADDRESS ADD
// ======================================================================

export const addAddress = wrapAsync(async (req, res) => {
  const { error, value } = addressValidators.validate(req.body);

  if (error) {
    return sendResponse(res, {
      code: 400,
      message: error.details[0].message,
    });
  }

  const user_id = req.session.user.id;

  if (value.is_default) {
    await Address.updateMany({ user_id }, { $set: { is_default: false } });
  }

  await Address.create({
    ...value,
    user_id,
  });

  return sendResponse(res, Responses.addAddress.ADDRESS_ADDED);
});

// ======================================================================
// 4. ADDRESS DELETE
// ======================================================================

export const removeAddress = wrapAsync(async (req, res) => {
  const { id } = req.body;

  await Address.findOneAndDelete({ _id: id });

  return sendResponse(res, Responses.removeAddress.REMOVED);
});

// ======================================================================
// 5. WISHLIST PAGE RENDER
// ======================================================================

export const editAddress = wrapAsync(async (req, res) => {
  const addressId = new ObjectId(req.params.id);
  const user_id = req.session.user.id;

  const { error, value } = addressValidators.validate(req.body);

  if (error) {
    return sendResponse(res, {
      code: 400,
      message: error.details[0].message,
    });
  }

  // If setting this address as default → unset others
  if (value.is_default) {
    await Address.updateMany({ user_id }, { $set: { is_default: false } });
  }

  // ✅ Update ONLY the selected address
  const result = await Address.updateOne(
    { _id: addressId, user_id },
    {
      $set: {
        ...value,
        user_id,
      },
    }
  );

  if (result.matchedCount === 0) {
    return sendResponse(res, {
      code: 404,
      message: "Address not found",
    });
  }

  return sendResponse(res, Responses.editAddress.ADDRESS_EDITED);
});

// ======================================================================
// 5. WISHLIST PAGE RENDER
// ======================================================================
export const wishlistRender = wrapAsync(async (req, res) => {
  const user_id = new ObjectId(req.session.user.id);

  const wishlist = await Wishlist.findOne({ user_id })
    .populate({
      path: "items.variant_id",
      populate: {
        path: "product_id",
        select: "name images teamName", // populate product from variant
      },
    })
    .lean();

  // Safe fallback
  const items = wishlist ? wishlist.items : [];

  res.render("user/layouts/profilelayout", {
    title: "User Wishlist",
    pageCSS: "wishlist",
    view: "wishlist",

    products: items,

    profile: true,
    showHeader: true,
    showFooter: true,
    pageJS: "wishlist.js",
  });
});

// ======================================================================
// 5. WISHLIST --> PRODUCT ADDING
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
      { $pull: { items: { variant_id: variant_Id } } }
    );

    return sendResponse(res, Responses.addWishlist.ALREADY_EXIST);
  }

  await Wishlist.findOneAndUpdate(
    { user_id },
    { $addToSet: { items: { variant_id: variant_Id } } },
    { upsert: true }
  );

  return sendResponse(res, Responses.addWishlist.PRODUCT_ADDED);
});

// ======================================================================
// 6. REMOVE ITEM FROM WISHLIST
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
    }
  );

  return sendResponse(res, Responses.removeWishlist.REMOVED);
});

// ======================================================================
// 6. BUY NOW
// ======================================================================

export const buyNow = (req, res) => {
  const { product_id, variant_id, quantity } = req.body;

  if (!req.session.user) {
    return sendResponse(res, Responses.buyNowRes.NO_USER);
  }

  if (!product_id || quantity < 1 || !variant_id) {
    return sendResponse(res, Responses.buyNowRes.INVALID);
  }

  req.session.buyNow = {
    product_id,
    variant_id,
    quantity,
  };

  return sendResponse(res, Responses.buyNowRes.SUCCESS);
};

// ======================================================================
// 6. CHECKOUT PAGE
// ======================================================================

export const checkoutPage = wrapAsync(async (req, res) => {
  const user_id = req.session.user.id;
  let items = [];
  const shippingCharge = 50;

  if (req.session.buyNow) {
    items = [req.session.buyNow];
    delete req.session.buyNow;
  } else {
    const cart = await Cart.findOne({ user_id });

    if (!cart || cart.items.length === 0) {
      return res.redirect("/cart");
    }

    items = cart.items;
  }

  const checkoutItems = await buildCheckoutItems(items);

  const subtotal = checkoutItems.reduce((sum, item) => sum + item.subtotal, 0);

  const total = subtotal + shippingCharge;

  const addresses = await Address.find({ user_id })
    .sort({
      is_default: -1,
      created_at: -1,
    })
    .lean();

  res.render("user/pages/checkout", {
    pageCSS: "checkout",
    pageJS: "checkout.js",
    title: "Checkout Page",
    items: checkoutItems,
    addresses,
    subtotal,
    total,
    showHeader: true,
    showFooter: true,
  });
});

// ======================================================================
// 6. ADD TO CART
// ======================================================================
export const addToCart = wrapAsync(async (req, res) => {
  const user_id = req.session.user.id;
  const { product_id, variant_id, quantity } = req.body;

  if (!variant_id || !quantity || quantity < 1) {
    return sendResponse(res, Responses.addToCart.INVALID);
  }

  const variant = await Variant.findById(variant_id);

  if (!variant || !variant.is_available) {
    return sendResponse(res, Responses.addToCart.NO_VARIANT);
  }

  if (variant.stock < quantity) {
    return sendResponse(res, {
      code: 400,
      message: `Only ${variant.stock} items left in stock`,
    });
  }

  let cart = await Cart.findOne({ user_id });

  if (!cart) {
    cart = new Cart({ user_id, items: [] });
  }

  const existingItem = cart.items.find(
    (item) => item.variant_id.toString() === variant_id
  );

  if (existingItem) {
    const newQty = existingItem.quantity + quantity;

    if (newQty > variant.stock) {
      return sendResponse(res, {
        code: 400,
        message: `Only ${variant.stock} items left in stock`,
      });
    }

    existingItem.quantity = newQty;
  } else {
    cart.items.push({ product_id, variant_id, quantity });
  }

  let total = 0;

  for (const item of cart.items) {
    const v = await Variant.findById(item.variant_id);
    total += v.base_price * item.quantity;
  }

  const items_count = cart.items.length;

  cart.total_amount = total;
  await cart.save();

  return sendResponse(res, {
    code: 200,
    message: "Item added to cart",
    data: {
      items_count,
    },
  });
});
// ======================================================================
// 6. CHECKOUT RECHECKING THE CART PRODUCT BEFORE THE CHECKOUT
// ======================================================================
export const proceedToCheckout = wrapAsync(async (req, res) => {
  const user_id = req.session.user.id;

  const cart = await Cart.findOne({ user_id });

  if (!cart || cart.items.length === 0) {
    return sendResponse(res, Responses.cartCheck.EMPTY_CART);
  }

  for (const item of cart.items) {
    const variant = await Variant.findById(item.variant_id);

    if (!variant || !variant.is_available) {
      let productName = "This product";

      if (variant?.product_id) {
        const product = await Product.findById(variant.product_id).select(
          "name"
        );

        if (product) productName = product.name;
      }

      return sendResponse(res, {
        code: 400,
        message: `${productName} is no longer available`,
      });
    }

    if (variant.stock < item.quantity) {
      const product = await Product.findById(variant.product_id).select("name");

      return sendResponse(res, {
        code: 400,
        message: `Only ${variant.stock} item(s) left for ${
          product?.name || "this product"
        }`,
      });
    }
  }

  req.session.checkoutIntent = {
    type: "cart",
    createdAt: Date.now(),
  };

  return sendResponse(res, Responses.cartCheck.SUCCESS);
});

// ======================================================================
// 6. CART ITEM REMOVE
// ======================================================================
export const deleteCartItem = wrapAsync(async (req, res) => {
  const user_id = req.session.user.id;
  const { variant_id } = req.body;
  const shippingCharge = 50;

  if (!variant_id) {
    return sendResponse(res, {
      code: 400,
      message: "Variant ID is required",
    });
  }

  const cart = await Cart.findOne({ user_id });

  if (!cart) {
    return sendResponse(res, {
      code: 404,
      message: "Cart not found",
    });
  }

  // Check if item exists
  const itemExists = cart.items.some(
    (item) => item.variant_id.toString() === variant_id
  );

  if (!itemExists) {
    return sendResponse(res, {
      code: 404,
      message: "Item not found in cart",
    });
  }

  // Remove item
  cart.items = cart.items.filter(
    (item) => item.variant_id.toString() !== variant_id
  );

  // Recalculate total
  let total = 0;
  for (const item of cart.items) {
    const variant = await Variant.findById(item.variant_id);
    total += variant.base_price * item.quantity;
  }

  cart.total_amount = total;
  await cart.save();

  return sendResponse(res, {
    code: 200,
    message: "Item removed from cart",
    data: {
      subtotal: cart.total_amount,
      total: shippingCharge + cart.total_amount,
      items_count: cart.items.length,
    },
  });
});

// ======================================================================
// 6. USER LOGOUT
// ======================================================================
export const userLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log("User logout error:", err);
    }

    res.clearCookie("user.sid", { path: "/" });

    return res.redirect("/");
  });
};

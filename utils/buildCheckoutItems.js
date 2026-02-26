import Product from "../models/productModel.js";
import Variant from "../models/variantModel.js";
import sendResponse from "./sendResponse.js";
import * as Responses from "../utils/responses/user/user.response.js";

const buildCheckoutItems = async (items) => {
  const checkoutItems = [];
  const warning = [];

  for (const item of items) {
    const product = await Product.findOne({
      _id: item.product_id,
    });

    if (!product.is_active) {
      warning.push(` ${product.name} not available.`);
    }

    const variant = await Variant.findOne({
      _id: item.variant_id,
      product_id: product._id,
    });

    if (!variant.is_available && product.is_active) {
      warning.push(` ${product.name} not available.`);
    }

    if (variant.stock < item.quantity && variant.is_available) {
      warning.push(`${product.name} Only ${variant.stock} items left`);
    }

    checkoutItems.push({
      product_id: product._id,
      variant_id: variant._id,
      category: product.category,

      name: product.name,
      image: product.images?.[0],
      size: variant.size,

      unit_price: variant.base_price,
      quantity: item.quantity,

      subtotal: variant.base_price * item.quantity,
    });
  }

  return { checkoutItems, warning };
};

export default buildCheckoutItems;

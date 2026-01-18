import Product from "../models/productModel.js";
import Variant from "../models/varientModel.js";

export const buildCheckoutItems = async (items) => {
  const checkoutItems = [];

  for (const item of items) {
    const product = await Product.findOne({
      _id: item.product_id,
      is_active: true,
    });

    if (!product) {
      throw new Error("Product not available");
    }

    const variant = await Variant.findOne({
      _id: item.variant_id,
      product_id: product._id,
      is_available: true,
    });

    if (!variant) {
      throw new Error("Variant not available");
    }

    if (variant.stock < item.quantity) {
      throw new Error(`${product.name} Only ${variant.stock} items left`);
    }

    checkoutItems.push({
      product_id: product._id,
      variant_id: variant._id,

      name: product.name,
      image: product.images?.[0],
      size: variant.size,

      unit_price: variant.base_price,
      quantity: item.quantity,

      subtotal: variant.base_price * item.quantity,
    });
  }

  return checkoutItems;
};

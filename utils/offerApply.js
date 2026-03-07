import sendResponse from "./sendResponse.js";
import * as Responses from "../utils/responses/user/user.response.js";
import Product from "../models/productModel.js";
import Offer from "../models/offerModel.js";
import Variant from "../models/variantModel.js";

export const applyOffer = async (products) => {
  const now = new Date();

  const offers = await Offer.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  }).lean();

  const productList = Array.isArray(products) ? products : [products];

  for (const product of productList) {
    const applicableOffers = offers.filter((offer) => {
      if (
        offer.offerApplyType === "product" &&
        offer.productIds?.some(
          (id) => id.toString() === product.product_id.toString(),
        )
      ) {
        return true;
      }

      if (
        offer.offerApplyType === "category" &&
        offer.categoryIds?.some(
          (id) => id.toString() === product.category.toString(),
        )
      ) {
        return true;
      }

      return false;
    });

    if (!applicableOffers.length) {
      product.appliedOffer = null;
      continue;
    }

    const variants = await Variant.find({ product_id: product.product_id });

    const referencePrice = Math.min(...variants.map((v) => v.base_price));

    let bestOffer = null;
    let bestPrice = referencePrice;

    for (const offer of applicableOffers) {
      let priceAfterOffer = referencePrice;

      if (offer.discountType === "percentage") {
        priceAfterOffer -= (priceAfterOffer * offer.discountValue) / 100;
      } else if (offer.discountType === "flat") {
        priceAfterOffer -= offer.discountValue;
      }

      if (priceAfterOffer < 0) priceAfterOffer = 0;

      if (priceAfterOffer < bestPrice) {
        bestPrice = priceAfterOffer;
        bestOffer = offer;
      }
    }

    if (bestOffer) {
      product.appliedOffer = bestOffer;

      let unitPrice = product.unit_price;

      if (bestOffer.discountType === "percentage") {
        unitPrice -= (unitPrice * bestOffer.discountValue) / 100;
      } else if (bestOffer.discountType === "flat") {
        unitPrice -= bestOffer.discountValue;
      }

      product.unit_price = unitPrice;
      product.offerDiscount = product.subtotal - unitPrice * product.quantity;
      product.subtotal = unitPrice * product.quantity;
    }
  }

  return productList;
};

export const checkOfferApply = async (cartItems, variantId) => {
  let total = 0;
  let itemTotal = 0;

  const now = new Date();

  const offers = await Offer.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  }).lean();

  for (const item of cartItems) {
    const variant = await Variant.findById(item.variant_id);
    const product = await Product.findById(variant.product_id);

    const applicableOffers = offers.filter((offer) => {
      if (
        offer.offerApplyType === "product" &&
        offer.productIds?.some((id) => id.toString() === product._id.toString())
      ) {
        return true;
      }

      if (
        offer.offerApplyType === "category" &&
        offer.categoryIds?.some(
          (id) => id.toString() === product.category.toString(),
        )
      ) {
        return true;
      }

      return false;
    });

    if (!applicableOffers.length) {
      if (variant._id.toString() === variantId) {
        itemTotal = variant.base_price * item.quantity;
      }
      total += variant.base_price * item.quantity;
      continue;
    }

    const variants = await Variant.find({ product_id: product._id });

    const referencePrice = Math.min(...variants.map((v) => v.base_price));

    let bestOffer = null;
    let bestPrice = referencePrice;

    for (const offer of applicableOffers) {
      let priceAfterOffer = referencePrice;

      if (offer.discountType === "percentage") {
        priceAfterOffer -= (priceAfterOffer * offer.discountValue) / 100;
      } else if (offer.discountType === "flat") {
        priceAfterOffer -= offer.discountValue;
      }

      if (priceAfterOffer < 0) priceAfterOffer = 0;

      if (priceAfterOffer < bestPrice) {
        bestPrice = priceAfterOffer;
        bestOffer = offer;
      }
    }

    let price = variant.base_price;

    if (bestOffer) {
      let unitPrice = variant.base_price;

      if (bestOffer.discountType === "percentage") {
        unitPrice -= (unitPrice * bestOffer.discountValue) / 100;
      } else if (bestOffer.discountType === "flat") {
        unitPrice -= bestOffer.discountValue;
      }

      price = unitPrice;

      if (variant._id.toString() === variantId) {
        itemTotal = price * item.quantity;
      }
      total += price * item.quantity;
    }
  }
  console.log(total, itemTotal);
  return { total, itemTotal };
};

export const deleteCartOffer = async (cartItems, variantId) => {
  let total = 0;

  const now = new Date();

  const offers = await Offer.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  }).lean();

  for (const item of cartItems) {
    const variant = await Variant.findById(item.variant_id);
    const product = await Product.findById(variant.product_id);

    const applicableOffers = offers.filter((offer) => {
      if (
        offer.offerApplyType === "product" &&
        offer.productIds?.some((id) => id.toString() === product._id.toString())
      ) {
        return true;
      }

      if (
        offer.offerApplyType === "category" &&
        offer.categoryIds?.some(
          (id) => id.toString() === product.category.toString(),
        )
      ) {
        return true;
      }

      return false;
    });

    if (!applicableOffers.length) {
      total += variant.base_price * item.quantity;
      continue;
    }

    const variants = await Variant.find({ product_id: product._id });

    const referencePrice = Math.min(...variants.map((v) => v.base_price));

    let bestOffer = null;
    let bestPrice = referencePrice;

    for (const offer of applicableOffers) {
      let priceAfterOffer = referencePrice;

      if (offer.discountType === "percentage") {
        priceAfterOffer -= (priceAfterOffer * offer.discountValue) / 100;
      } else if (offer.discountType === "flat") {
        priceAfterOffer -= offer.discountValue;
      }

      if (priceAfterOffer < 0) priceAfterOffer = 0;

      if (priceAfterOffer < bestPrice) {
        bestPrice = priceAfterOffer;
        bestOffer = offer;
      }
    }

    let price = variant.base_price;

    if (bestOffer) {
      let unitPrice = variant.base_price;

      if (bestOffer.discountType === "percentage") {
        unitPrice -= (unitPrice * bestOffer.discountValue) / 100;
      } else if (bestOffer.discountType === "flat") {
        unitPrice -= bestOffer.discountValue;
      }

      price = unitPrice;
      total += price * item.quantity;
    }
  }
  return { total };
};

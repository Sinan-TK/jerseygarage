import Joi from "joi";

export const couponSchema = Joi.object({
  code: Joi.string().trim().uppercase().min(3).max(20).required().messages({
    "string.empty": "Coupon code is required",
    "string.min": "Coupon code must be at least 3 characters",
    "string.max": "Coupon code must be at most 20 characters",
  }),

  discountType: Joi.string().valid("percentage", "flat").required().messages({
    "any.only": "Discount type must be percentage or flat",
  }),

  discountValue: Joi.number()
    .positive()
    .required()
    .when("discountType", {
      is: "percentage",
      then: Joi.number().max(100),
    })
    .messages({
      "number.base": "Discount value must be a number",
      "number.positive": "Discount value must be greater than 0",
    }),

  minPurchaseAmount: Joi.number().min(0).default(0).messages({
    "number.base": "Minimum purchase amount must be a number",
    "number.min": "Minimum purchase amount cannot be negative",
  }),

  maxDiscountAmount: Joi.number().min(0).allow(null).messages({
    "number.min": "Maximum discount amount cannot be negative",
  }),

  usageLimit: Joi.number().integer().min(1).default(1).messages({
    "number.min": "Usage limit must be at least 1",
  }),

  perUserLimit: Joi.number().integer().min(1).default(1).messages({
    "number.min": "Per user limit must be at least 1",
  }),

  expiryDate: Joi.date().required().greater("now").messages({
    "any.required": "Expiry date is required",
    "date.base": "Expiry date must be a valid date",
    "date.greater": "Expiry date must be in the future",
  }),

  description: Joi.string().allow("").max(200).messages({
    "string.max": "Description must be under 200 characters",
  }),

  isActive: Joi.boolean().default(true),
});

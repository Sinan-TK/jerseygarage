import Joi from "joi";

const offerSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    "string.empty": "Offer name is required",
    "string.min": "Offer name must be at least 3 characters",
  }),

  offerApplyType: Joi.string()
    .valid("product", "category")
    .required()
    .messages({
      "any.only": "Offer type must be either product or category",
      "string.empty": "Offer type is required",
    }),

  discountType: Joi.string().valid("percentage", "flat").required().messages({
    "any.only": "Discount type must be percentage or flat",
    "string.empty": "Discount type is required",
  }),

  discountValue: Joi.number().positive().required().messages({
    "number.base": "Discount value must be a number",
    "number.positive": "Discount value must be greater than 0",
    "any.required": "Discount value is required",
  }),

  productIds: Joi.when("offerApplyType", {
    is: "product",
    then: Joi.array().min(1).required().messages({
      "array.min": "Please select at least one product",
      "any.required": "Product selection is required",
    }),
    otherwise: Joi.array().optional(),
  }),

  categoryIds: Joi.when("offerApplyType", {
    is: "category",
    then: Joi.array().min(1).required().messages({
      "array.min": "Please select at least one category",
      "any.required": "Category selection is required",
    }),
    otherwise: Joi.array().optional(),
  }),

  startDate: Joi.date().required().messages({
    "date.base": "Start date must be a valid date",
    "any.required": "Start date is required",
  }),

  endDate: Joi.date().greater(Joi.ref("startDate")).required().messages({
    "date.greater": "End date must be after start date",
    "any.required": "End date is required",
  }),

  isActive: Joi.boolean().required(),
});

export default offerSchema;

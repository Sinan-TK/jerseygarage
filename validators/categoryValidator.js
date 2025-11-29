import Joi from "joi";

export const categorySchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Category name is required",
  }),

  description: Joi.string().required().messages({
    "string.empty": "Category description is required",
  }),

  color: Joi.string().required().messages({
    "string.empty": "Color is required",
  })
});
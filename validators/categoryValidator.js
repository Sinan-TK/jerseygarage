import Joi from "joi";

const categorySchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Category name is required",
  }),

  description: Joi.string().required().messages({
    "string.empty": "Category description is required",
  }),
  
});

export default categorySchema;

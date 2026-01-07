import Joi from "joi";

export default Joi.object({
  full_name: Joi.string().required().messages({
    "string.empty": "Name is required",
  }),
  phone_no: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      "string.empty": "Phone number is required",
      "string.pattern.base": "Enter a valid 10-digit phone number",
    }),
  country: Joi.string().required().messages({
    "string.empty": "Country is required",
  }),
  city: Joi.string().required().messages({
    "string.empty": "City is required",
  }),
  state: Joi.string().required().messages({
    "string.empty": "State is required",
  }),
  zip_code: Joi.string()
    .pattern(/^[1-9][0-9]{5}$/)
    .required()
    .messages({
      "string.empty": "ZIP code is required",
      "string.pattern.base": "Enter a valid 6-digit PIN code",
    }),
  address_line1: Joi.string().required().messages({
    "string.empty": "Address-1 is required",
  }),
  address_line2: Joi.string().required().messages({
    "string.empty": "Address-2 is required",
  }),
  is_default: Joi.boolean().optional(),
});

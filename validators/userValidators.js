import Joi from "joi";

export const userSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required!",
    "string.email": "Enter a valid email address!",
  }),

  password: Joi.string().min(8).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 8 characters",
  }),
});

export const userMailSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required!",
    "string.email": "Enter a valid email address!",
  }),
});

export const otpSchema = Joi.object({
  otpValue: Joi.string().min(6).required().messages({
    "string.empty": "Please enter the OTP!",
    "string.min": "Please enter the OTP fully!",
  }),
});

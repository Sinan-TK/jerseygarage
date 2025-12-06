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

export const registerSchema = Joi.object({
  fullName: Joi.string().required().messages({
    "string.empty": "Please enter the full name!",
  }),
  password: Joi.string()
    .min(8)
    .max(30)
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$"))
    .required()
    .messages({
      "string.empty": "Please enter the password!",
      "string.min": "Password must be at least 8 characters",
      "string.pattern.base":
        "Password must contain uppercase, lowercase, and a number",
    }),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
  }),
});

export const newPassSchema = Joi.object({
  password: Joi.string()
    .min(8)
    .max(30)
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$"))
    .required()
    .messages({
      "string.empty": "Please enter the password!",
      "string.min": "Password must be at least 8 characters",
      "string.pattern.base":
        "Password must contain uppercase, lowercase, and a number",
    }),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
  }),
});

export const emailCheck = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Please enter the email!",
    "string.email": "Enter a valid email!",
  }),
});

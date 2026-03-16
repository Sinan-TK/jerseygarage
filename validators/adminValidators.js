import Joi from "joi";

export const loginValidation = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Enter a valid email address",
  }),

  password: Joi.string().min(8).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 8 characters",
  }),
});

export const emailCheck = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Enter a valid email address",
  }),
});

export const otpSchema = Joi.object({
  otpValue: Joi.string().min(6).required().messages({
    "string.empty": "Please enter the OTP!",
    "string.min": "Please enter the OTP fully!",
  }),
});

export const newPassSchema = Joi.object({
  password: Joi.string()
    .min(8)
    .max(30)
    .pattern(
      new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).+$"),
    )

    .required()
    .messages({
      "string.empty": "Please enter the password!",
      "string.min": "Password must be at least 8 characters",
      "string.pattern.base":
        "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.",
    }),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
  }),
});

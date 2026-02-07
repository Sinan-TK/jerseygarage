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

export const otpSchema = Joi.object({
  otpValue: Joi.string().min(6).required().messages({
    "string.empty": "Please enter the OTP!",
    "string.min": "Please enter the OTP fully!",
  }),
});

export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required!",
    "string.email": "Enter a valid email address!",
  }),
  fullName: Joi.string().required().messages({
    "string.empty": "Please enter the full name!",
  }),
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

export const emailCheck = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Please enter the email!",
    "string.email": "Enter a valid email!",
  }),
});

export const personalInfo = Joi.object({
  fullName: Joi.string().required().messages({
    "string.empty": "Please enter your name!",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Please enter the email!",
    "string.email": "Enter a valid email!",
  }),
  phoneNo: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .optional()
    .allow("")
    .messages({
      "string.pattern.base": "Invalid phone number",
    }),
});

export const newPassword = Joi.object({
  currentPassword: Joi.string().required().messages({
    "string.empty": "Please enter your current password",
  }),

  newPassword: Joi.string()
    .min(8)
    .max(30)
    .pattern(
      new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).+$"),
    )
    .required()
    .messages({
      "string.empty": "Please enter the new password!",
      "string.min": "Password must be at least 8 characters",
      "string.pattern.base":
        "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.",
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "any.only": "Passwords do not match",
    }),
});

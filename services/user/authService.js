import User from "../../models/userModel.js";
import * as Responses from "../../utils/responses/user/auth.responses.js";
import { generateOtp } from "../../utils/GenerateOtp.js";
import Otp from "../../models/otpModel.js";

//=============================================================================
//=============================================================================

export const verifyUserLogin = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    return { error: Responses.loginUser.USER_NOT_FOUND };
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return { error: Responses.loginUser.PASSWORD_NOT_MATCH };
  }

  if (user.is_blocked) {
    return { error: Responses.loginUser.USER_BLOCKED };
  }

  return {
    user: {
      id: user._id,
      email: user.email,
      blocked: user.is_blocked,
    },
  };
};

//=============================================================================
//=============================================================================

export const emailVerification = async (email) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return { error: Responses.signupUserEmail.USER_FOUND };
  }

  await generateOtp(email, "signup", "SignUp OTP. ");

  return {
    data: {
      email,
      purpose: "signup",
    },
  };
};

//=============================================================================
//=============================================================================

export const otpVerify = async (email, purpose, otpValue) => {
  const otpDoc = await Otp.findOne({ email, purpose, is_used: false });

  if (!otpDoc) {
    return { error: Responses.otpVerify.OTP_EXPIRED };
  }

  if (otpDoc.otp_code !== otpValue) {
    return { error: Responses.otpVerify.INCORRECT_OTP };
  }

  otpDoc.is_used = true;
  await otpDoc.save();

  return { success: true };
};

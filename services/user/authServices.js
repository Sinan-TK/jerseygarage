import User from "../../models/userModel.js";
import * as Responses from "../../utils/responses/user/auth.responses.js";
import generateOtp from "../../utils/GenerateOtp.js";
import Otp from "../../models/otpModel.js";
import * as userConstants from "../../constants/userConstants.js";

//=============================================================================
// 1.USER LOGIN VERIFICATION
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
// 2. SAVE NEW USER
//=============================================================================

export const signupVerificationService = async (email, referralCode) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return { error: Responses.registerLogic.USER_FOUND };
  }

  let referredBy = null;

  if (referralCode) {
    const code = referralCode.trim().toUpperCase();

    referredBy = await User.findOne({ referral_code: code });

    if (!referredBy) {
      return { error: Responses.registerLogic.INVALID_REF_CODE };
    }
  }

  await generateOtp(
    email,
    userConstants.OTPPURPOSE.SIGNUP,
    userConstants.OTP_MESSAGES.SIGNUP,
  );

  return {
    data: {
      email,
      purpose: userConstants.OTPPURPOSE.SIGNUP,
      ...(referredBy && { referredBy: referredBy._id }),
    },
  };
};

//=============================================================================
// 3.OTP VERIFICATION
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

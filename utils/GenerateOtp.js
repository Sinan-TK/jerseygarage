import otpGenerator from "otp-generator";
import sendOTP from "../utils/sendOtp.js";
import Otp from "../models/otpModel.js";

const generateOtp = async (email, purpose, message) => {
  const otp = otpGenerator.generate(6, {
    digits: true,
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

  console.log("Generated OTP:", otp);

  await Otp.deleteMany({ email, purpose });

  await Otp.create({
    email,
    otp_code: otp,
    purpose,
  });
  await sendOTP(email, otp, message);
};

export default generateOtp;

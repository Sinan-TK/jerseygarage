import mongoose from "mongoose";


const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
    },

    otp_code: {
      type: String,
      required: true,
    },

    purpose: {
      type: String,
      enum: ["signup", "forget_password"],
      required: true,
    },

    is_used: {
      type: Boolean,
      default: false,
    },

    // TTL field
    expires_at: {
      type: Date,
      default: () => Date.now() + 120 * 1000, // 2 minutes from now
      expires: 0, // expire EXACTLY at this timestamp
    },
  },
  {
    timestamps: true,
  }
);

const Otp = mongoose.model("Otp", otpSchema);

export default Otp;
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: true,
      trim: true,
    },

    avatar: {
      type: String,
      default:
        "https://t3.ftcdn.net/jpg/06/33/54/78/360_F_633547842_AugYzexTpMJ9z1YcpTKUBoqBF0CUCk10.jpg",
    },

    phone_no: {
      type: String,
      default: null,
    },

    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true, 
    },

    password_hash: {
      type: String,
      required: function () {
        return !this.googleId; // Require password only for normal signup
      },
    },
    referral_code: {
      type: String,
      unique: true,
      uppercase: true,
      index: true,
    },

    referred_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    referral_count: {
      type: Number,
      default: 0,
    },

    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
    },

    is_blocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.password_hash) return next();
  if (!this.isModified("password_hash")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password_hash = await bcrypt.hash(this.password_hash, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password_hash) return false;
  return await bcrypt.compare(enteredPassword, this.password_hash);
};

const User = mongoose.model("User", userSchema);

export default User;

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Admin Schema
const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password_hash: {
      type: String,
      required: true,
    },
    otp_code: {
      type: String,
      default: null, // nullable
    },
  },
  {
    timestamps: true,
  }
);

// 🔒 Hash password automatically before saving
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password_hash")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password_hash = await bcrypt.hash(this.password_hash, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ✅ Add method to compare password for login
adminSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password_hash);
};

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;

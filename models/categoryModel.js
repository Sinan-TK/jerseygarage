import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    description: {
      type: String,
      required: true,
    },

    color: {
      type: String,
      enum: ["#dfeafe", "#f4e9ff", "#e2ffe9", "#fff5c6", "#ffe1e1", "#f7f7f7"],
      required: true,
    },

    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model("Category", categorySchema);

export default Category;
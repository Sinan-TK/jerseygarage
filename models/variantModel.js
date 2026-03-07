import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    size: {
      type: String,
      enum: ["S", "M", "L", "XL", "XXL"],
      required: true,
    },

    base_price: {
      type: Number,
      required: true,
      min: 0,
    },

    normal_price: {
      type: Number,
      required: true,
      min: 0,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
    },

    lockedStock: {
      type: Number,
      default: 0,
    },

    is_available: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Prevent duplicate size variants for same product
variantSchema.index({ product_id: 1, size: 1 }, { unique: true });

const Variant = mongoose.model("Variant", variantSchema);

export default Variant;

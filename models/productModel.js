import mongoose from "mongoose";

const sizeSchema = new mongoose.Schema({
  size: { type: String, required: true }, // S, M, L, XL, XXL
  stock: { type: Number, required: true },
  basePrice: { type: Number, required: true },
  normalPrice: { type: Number, required: true },
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    teamName: { type: String, required: true },
    description: { type: String },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    // 🔥 All images shared by every size
    images: [{ type: String, required: true }],

    // 🔥 Sizes stored inside the product
    sizes: [sizeSchema],

    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);

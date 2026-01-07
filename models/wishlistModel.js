import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one wishlist per user
    },

    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

export default Wishlist;

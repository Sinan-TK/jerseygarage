import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    balance: {
      type: Number,
      default: 0,
    },

    transactions: [
      {
        type: {
          type: String,
          enum: ["credit", "debit"],
          required: true,
        },

        amount: {
          type: Number,
          required: true,
        },

        reason: {
          type: String,
        },

        orderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Order",
          default: null,
        },

        razorpay: {
          orderId: String,
          paymentId: String,
          signature: String,
        },

        status: {
          type: String,
          enum: ["PENDING", "SUCCESS", "FAILED"],
          default: "SUCCESS",
        },

        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const Wallet = mongoose.model("Wallet", walletSchema);
export default Wallet;
import mongoose from "mongoose";


const orderItemSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    variant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    image: String,

    size: String,

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
    },

    subtotal:{
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["Active", "Cancelled", "Returned"],
      default: "Active",
    },

    requestStatus: {
      type: String,
      enum: ["None", "Pending", "Approved", "Rejected"],
      default: "None",
    },

    statusChangedAt: Date,
  },
  { _id: true },
);

/* ============================
   HISTORY SCHEMA
============================ */

const requestHistorySchema = new mongoose.Schema(
  {
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],

    reason: {
      type: String,
      required: true,
    },

    requestedAt: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  { _id: false },
);

/* ============================
   MAIN ORDER SCHEMA
============================ */

const orderSchema = new mongoose.Schema(
  {

    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    products: [orderItemSchema],

    shippingAddress: {
      full_name: String,
      phone_no: String,
      address_line: String,
      city: String,
      state: String,
      zip_code: String,
      country: String,
    },

    orderStatus: {
      type: String,
      enum: [
        "Placed",
        "Confirmed",
        "Packed",
        "Shipped",
        "OutForDelivery",
        "Delivered",

        // Cancel / Return states
        "Cancelled", // All items cancelled
        "Partially-Cancelled", // Some cancelled
        "Returned", // All returned
        "PartiallyReturned", // Some returned
      ],

      default: "Placed",
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "Razorpay", "Wallet"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Refunded"],
      default: "Pending",
    },

    itemsPrice: {
      type: Number,
      required: true,
    },

    shippingCharge: {
      type: Number,
      default: 0,
    },

    totalPrice: {
      type: Number,
      required: true,
    },

    refundAmount: {
      type: Number,
      default: 0,
    },

    paidAt: {
      type: Date,
    },

    deliveredAt: {
      type: Date,
    },

    cancelHistory: [requestHistorySchema],

    returnHistory: [requestHistorySchema],
  },
  {
    timestamps: true, // createdAt, updatedAt
  },
);

/* ============================
   MODEL EXPORT
============================ */

const Order = mongoose.model("Order", orderSchema);

export default Order;

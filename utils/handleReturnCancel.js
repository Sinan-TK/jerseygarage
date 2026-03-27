import Variant from "../models/variantModel.js";
import * as walletHandler from "../utils/walletHandler.js";

// ======================================================================
// 1. HANDLE CANCEL
// ======================================================================

export const handleCancel = async (order, action, items, reason) => {
  let refund = 0;
  let cancelledCount = 0;
  const historyItems = [];

  const nonCancellableStatuses = [
    "OutForDelivery",
    "Delivered",
    "Cancelled",
    "Returned",
  ];
  if (nonCancellableStatuses.includes(order.orderStatus)) {
    return {
      error: { code: statusCode.CLIENT.BAD_REQUEST, message: "Order cannot be cancelled at this stage" },
    };
  }

  for (const item of order.products) {
    if (item.status !== "Active") continue;

    if (action === "partial-cancel" && !items.includes(item._id.toString())) {
      continue;
    }

    const price = item.subtotal + item.total_gst;

    if (action === "partial-cancel" && order.is_couponed) {
      const coupon = order.coupon;
      const totalAfterCancel = order.totalPrice - price;
      if (coupon.minPurchaseAmount > totalAfterCancel) {
        return {
          error: {
            code: statusCode.CLIENT.BAD_REQUEST,
            message: `Cancellation of ${item.name} isn't possible because it would make the order total fall below the minimum amount required for the applied coupon. As an alternative, you can choose to cancel the full order.`,
          },
        };
      }
    }

    item.requestStatus = "Approved";
    item.statusChangedAt = new Date();
    order.totalGST -= item.total_gst;
    order.totalPrice -= price;

    if (order.paymentStatus === "Paid") {
      refund += price;
      item.status = "Cancel-Requested";
    } else {
      item.status = "Cancelled";
    }

    cancelledCount++;

    historyItems.push(item._id);

    await Variant.findByIdAndUpdate(item.variant_id, {
      $inc: { stock: item.quantity },
    });
  }

  const allCancelled = order.products.every(
    (p) =>
      p.status === "Cancelled" ||
      p.status === "Cancel-Requested" ||
      p.status === "Returned",
  );

  if (allCancelled && order.paymentStatus !== "Paid") {
    order.orderStatus = "Cancelled";
  }

  if (allCancelled) {
    if (order.is_couponed) {
      const coupon = order.coupon;
      refund -= coupon.discountAmount;
      order.totalPrice += coupon.discountAmount;
    }
    order.totalPrice -= order.shippingCharge;
    refund += order.shippingCharge;
  }

  order.cancelHistory.push({
    items: historyItems,
    reason,
    status: "Approved",
  });

  if (order.paymentStatus === "Paid") {
    await processRefundCancel(order, refund, historyItems);
  }
};

// ======================================================================
// 2. HANDLE RETURN
// ======================================================================

export const handleReturn = async (order, action, items, reason) => {
  let returnCount = 0;

  const historyItems = [];

  for (const item of order.products) {
    if (item.status !== "Active") continue;

    // Partial return
    if (action === "partial-return" && !items.includes(item._id.toString())) {
      continue;
    }

    const price = item.subtotal + item.total_gst;

    if (action === "partial-return" && order.is_couponed) {
      console.log("working");
      const coupon = order.coupon;
      const totalAfterReturn = order.totalPrice - price;
      if (coupon.minPurchaseAmount > totalAfterReturn) {
        return {
          error: {
            code: statusCode.CLIENT.BAD_REQUEST,
            message: `Return of ${item.name} isn't possible because it would make the order total fall below the minimum amount required for the applied coupon. As an alternative, you can choose to return the full order.`,
          },
        };
      }
    }

    item.status = "Return-Requested";
    item.requestStatus = "Approved";
    item.statusChangedAt = new Date();

    returnCount++;

    historyItems.push(item._id);
  }

  order.returnHistory.push({
    items: historyItems,
    reason,
    status: "Pending",
  });
};

// ======================================================================
// 3. CANCEL REFUND
// ======================================================================

export const processRefundCancel = async (order, amount, items) => {
  if (order.paymentStatus !== "Paid") return;

  await walletHandler.creditWallet(
    order.user_id,
    amount,
    "SUCCESS",
    "Refund for cancelled item",
    null,
    order.orderId,
  );

  order.refundAmount += amount;

  const itemStrings = items.map((id) => id.toString());

  for (const item of order.products) {
    if (!itemStrings.includes(item._id.toString())) {
      continue;
    }

    item.status = "Cancelled";
    item.requestStatus = "Approved";
    item.statusChangedAt = new Date();
  }

  const allCancelledOrReturned = order.products.every(
    (p) => p.status === "Cancelled" || p.status === "Returned",
  );

  if (allCancelledOrReturned) {
    order.paymentStatus = "Refunded";
    order.orderStatus = "Cancelled";
  }
};

// ======================================================================
// 4. REFUND RETURN
// ======================================================================

export const processRefundReturn = async (order, amount, items) => {
  if (order.paymentStatus !== "Paid") return;

  await walletHandler.creditWallet(
    order.user_id,
    amount,
    "SUCCESS",
    "Refund for return order",
    null,
    order.orderId,
  );

  order.refundAmount += amount;

  for (const item of order.products) {
    if (!items.includes(item._id.toString())) {
      continue;
    }

    item.status = "Returned";
    item.requestStatus = "Approved";
    item.statusChangedAt = new Date();
  }

  const allReturned = order.products.every(
    (p) =>
      (p.status === "Returned" || p.status === "Cancelled") &&
      p.requestStatus === "Approved",
  );

  if (allReturned) {
    order.paymentStatus = "Refunded";
    order.orderStatus = "Returned";
  }
};

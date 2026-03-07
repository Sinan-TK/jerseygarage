import Variant from "../models/variantModel.js";
import * as walletHandler from "../utils/walletHandler.js";

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
      error: { code: 400, message: "Order cannot be cancelled at this stage" },
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
            code: 400,
            message: `Cancellation of ${item.name} isn't possible because it would make the order total fall below the minimum amount required for the applied coupon. As an alternative, you can choose to cancel the full order.`,
          },
        };
      }
    }

    item.status = "Cancel-Requested";
    item.requestStatus = "Approved";
    item.statusChangedAt = new Date();
    order.totalPrice -= price;

    if (order.paymentStatus === "Paid") {
      refund += price;
    }
    cancelledCount++;

    historyItems.push(item._id);

    await Variant.findByIdAndUpdate(item.variant_id, {
      $inc: { stock: item.quantity },
    });
  }

  const allCancelled = order.products.every(
    (p) => p.status === "Cancelled" || p.status === "Cancel-Requested",
  );

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
  if (refund) {
    await processRefundCancel(order, refund, items);
  }
};

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
      const coupon = order.coupon;
      const totalAfterReturn = order.totalPrice - price;
      if (coupon.minPurchaseAmount > totalAfterReturn) {
        return {
          error: {
            code: 400,
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

export const processRefundCancel = async (order, amount, items) => {
  if (order.paymentStatus !== "Paid") return;

  walletHandler.creditWallet(
    order.user_id,
    amount,
    "SUCCESS",
    "Refund for cancelled item",
    null,
    order._id,
  );

  order.refundAmount += amount;

  for (const item of order.products) {
    if (!items.includes(item._id.toString())) {
      continue;
    }

    item.status = "Cancelled";
    item.requestStatus = "Approved";
    item.statusChangedAt = new Date();
  }

  const allCancelledOrReturned = order.products.every(
    (p) => p.status === "Cancelled" && p.status === "Returned",
  );

  if (allCancelledOrReturned) {
    order.paymentStatus = "Refunded";
  }

  const allCancelled = order.products.every(
    (p) => p.status === "Cancelled" && p.requestStatus === "Approved",
  );

  if (allCancelled) {
    order.orderStatus = "Cancelled";
  } else {
    order.orderStatus = "Partially-Cancelled";
  }
};

export const processRefundReturn = async (order, amount, items) => {
  if (order.paymentStatus !== "Paid") return;

  walletHandler.creditWallet(
    order.user_id,
    amount,
    "SUCCESS",
    "Refund for return order",
    null,
    order._id,
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

  const allCancelledOrReturned = order.products.every(
    (p) => p.status === "Cancelled" && p.status === "Returned",
  );

  if (allCancelledOrReturned) {
    order.paymentStatus = "Refunded";
  }

  const allReturned = order.products.every(
    (p) => p.status === "Returned" && p.requestStatus === "Approved",
  );

  if (allReturned) {
    order.orderStatus = "Returned";
  } else {
    order.orderStatus = "Partially-Returned";
  }
};

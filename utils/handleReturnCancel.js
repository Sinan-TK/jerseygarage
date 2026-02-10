import Variant from "../models/varientModel.js";


export const handleCancel = async (order, action, items, reason) => {
  let refund = 0;
  let cancelledCount = 0;

  const historyItems = [];

  for (const item of order.products) {
    if (item.status !== "Active") continue;

    if (action === "partial-cancel" && !items.includes(item._id.toString())) {
      continue;
    }

    item.status = "Cancelled";
    item.requestStatus = "Approved";
    item.statusChangedAt = new Date();

    refund += item.price * item.quantity;
    cancelledCount++;

    historyItems.push(item._id);

    await Variant.findByIdAndUpdate(item.variant_id, {
      $inc: { stock: item.quantity },
    });
  }

  if (cancelledCount === order.products.length) {
    order.orderStatus = "Cancelled";
  } else if (cancelledCount > 0) {
    order.orderStatus = "Partially-Cancelled";
  }

  order.cancelHistory.push({
    items: historyItems,
    reason,
    status: "Approved",
  });

  await processRefund(order, refund);
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

    item.requestStatus = "Pending";
    item.statusChangedAt = new Date();

    returnCount++;

    historyItems.push(item._id);
  }

  if (returnCount === order.products.length) {
    order.orderStatus = "Returned";
  } else if (returnCount > 0) {
    order.orderStatus = "PartiallyReturned";
  }

  order.returnHistory.push({
    items: historyItems,
    reason,
    status: "Pending",
  });
};

export const processRefund = async (order, amount) => {
  if (order.paymentStatus !== "Paid") return;

  order.refundAmount += amount;

  order.paymentStatus = "Refunded";

  // Payment gateway refund integration later
};

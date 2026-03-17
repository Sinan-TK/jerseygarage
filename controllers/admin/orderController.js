import wrapAsync from "../../utils/wrapAsync.js";
import Order from "../../models/orderModel.js";
import User from "../../models/userModel.js";
import sendResponse from "../../utils/sendResponse.js";
import * as walletHandler from "../../utils/walletHandler.js";
import * as Responses from "../../utils/responses/admin/order.response.js";
import paginate from "../../utils/pagination.js";
import * as handleReturnCancel from "../../utils/handleReturnCancel.js";

// ======================================================================
// 1. ORDER PAGE
// ======================================================================

export const orderPageRender = (req, res) => {
  res.render("admin/pages/orders", {
    title: "Orders",
    showLayout: true,
    cssFile: "/css/admin/orders.css",
    pageJS: "orders.js",
  });
};

// ======================================================================
// 2. ORDER LISTING
// ======================================================================

export const ordersListing = wrapAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const { search, status, payment, fromDate, toDate } = req.query;

  const filter = {};

  if (search) {
    filter.orderId = { $regex: search, $options: "i" };
  }

  if (status && status !== "all") {
    filter.orderStatus = status;
  }

  if (payment && payment !== "all") {
    filter.paymentStatus = payment;
  }

  if (fromDate || toDate) {
    filter.createdAt = {};

    if (fromDate) {
      filter.createdAt.$gte = new Date(fromDate);
    }

    if (toDate) {
      const endDate = new Date(toDate);
      endDate.setHours(23, 59, 59, 999);

      filter.createdAt.$lte = endDate;
    }
  }
  const pagination = await paginate(Order, page, 10, filter);

  for (const order of pagination.data) {
    const user = await User.findById(order.user_id).select("full_name");
    order.user_id = user;
  }

  return sendResponse(res, {
    code: 200,
    message: "listing successfully",
    data: {
      orders: pagination.data,
      pagination: pagination.meta,
    },
  });
});

// ======================================================================
// 3. ORDER DETAILS PAGE
// ======================================================================

export const orderDetailsPageRender = wrapAsync(async (req, res) => {
  const id = req.params.id;
  const order = await Order.findById(id).populate("user_id", "full_name email");

  order.products.forEach((item) => {
    item.subtotal += item.total_gst;
  });

  res.render("admin/pages/orderdetails", {
    title: "Order Details",
    showLayout: true,
    cssFile: "/css/admin/orderdetails.css",
    order,
    pageJS: "orderdetails.js",
  });
});

// ======================================================================
// 4. STATUS CHANGE
// ======================================================================

export const changeStatus = wrapAsync(async (req, res) => {
  let { orderId, orderStatus, paymentStatus } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    return sendResponse(res, Responses.orderRes.NOT_FOUND);
  }

  if (orderStatus && orderStatus !== order.orderStatus) {
    const validStatuses = [
      "Pending",
      "Placed",
      "Confirmed",
      "Packed",
      "Shipped",
      "OutForDelivery",
      "Delivered",
      "Failed",
      "Cancelled",
      "Returned",
    ];

    if (!validStatuses.includes(orderStatus)) {
      return sendResponse(res, Responses.orderRes.INVALID_STATUS);
    }

    const terminalStatuses = ["Cancelled", "Failed"];

    if (terminalStatuses.includes(order.orderStatus)) {
      return sendResponse(res, {
        code: 400,
        message: `Order is already ${order.orderStatus}. Status cannot be changed.`,
      });
    }

    if (["Cancelled", "Returned"].includes(orderStatus)) {
      const nonCancellableStatuses = [
        "OutForDelivery",
        "Delivered",
        "Cancelled",
        "Returned",
      ];

      if (
        nonCancellableStatuses.includes(order.orderStatus) &&
        orderStatus === "Cancelled"
      ) {
        return {
          error: Responses.orderRes.NON_CANCELLABLE,
        };
      }

      const eligibleProducts = order.products.filter((p) =>
        ["Active", "Cancel-Requested", "Return-Requested"].includes(p.status),
      );

      const itemIds = eligibleProducts.map((p) => p._id.toString());

      if (order.paymentStatus === "Paid" && itemIds.length > 0) {
        paymentStatus = null;

        const refundAmount = eligibleProducts.reduce(
          (total, p) => total + p.totalPrice,
          0,
        );

        if (orderStatus === "Cancelled") {
          await handleReturnCancel.processRefundCancel(
            order,
            refundAmount,
            itemIds,
          );
        } else {
          await handleReturnCancel.processRefundReturn(
            order,
            refundAmount,
            itemIds,
          );
        }
      } else {
        eligibleProducts.forEach((product) => {
          product.status =
            orderStatus === "Cancelled" ? "Cancelled" : "Returned";
          product.requestStatus = "Approved";
          product.statusChangedAt = new Date();
        });

        order.orderStatus = orderStatus;
      }
    } else {
      const statusOrder = [
        "Pending",
        "Placed",
        "Confirmed",
        "Packed",
        "Shipped",
        "OutForDelivery",
        "Delivered",
      ];

      const currentIndex = statusOrder.indexOf(order.orderStatus);
      const newIndex = statusOrder.indexOf(orderStatus);

      if (currentIndex !== -1 && newIndex !== -1 && newIndex <= currentIndex) {
        return sendResponse(res, {
          code: 400,
          message: `Cannot change status from ${order.orderStatus} to ${orderStatus}`,
        });
      }

      order.orderStatus = orderStatus;

      if (orderStatus === "Delivered") {
        order.deliveredAt = new Date();
      }
    }
  }

  if (paymentStatus) {
    const validPayments = ["Pending", "Paid", "Failed"];

    if (!validPayments.includes(paymentStatus)) {
      return sendResponse(res, Responses.orderRes.INVALID_PAY_STATUS);
    }

    if (order.paymentStatus === "Refunded") {
      return sendResponse(res, Responses.orderRes.CANNOT_CHANGE_REFUNDED);
    }

    if (order.paymentStatus === "Failed") {
      return sendResponse(res, Responses.orderRes.CANNOT_CHANGE_CANCELLED);
    }

    if (order.paymentStatus === "Paid" && paymentStatus === "Pending") {
      return sendResponse(res, Responses.orderRes.CANNOT_CHANGE);
    }

    order.paymentStatus = paymentStatus;

    if (paymentStatus === "Paid") {
      order.paidAt = new Date();
    }
  }

  await order.save();

  return sendResponse(res, {
    code: 200,
    message: "Status updated successfully!",
    data: {
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
    },
  });
});

// ======================================================================
// 5. RETURN REQUEST
// ======================================================================

export const returnRequest = wrapAsync(async (req, res) => {
  const { type, returnId, orderId } = req.body;

  if (!type || !returnId || !orderId) {
    return sendResponse(res, Responses.orderRes.SOMETHING_WRONG);
  }

  const order = await Order.findById(orderId);
  if (!order) {
    return sendResponse(res, Responses.orderRes.NOT_FOUND);
  }

  const returnEntry = order.returnHistory.find(
    (r) => r._id.toString() === returnId.toString(),
  );

  if (!returnEntry) {
    return sendResponse(res, Responses.orderRes.RETURN_REQ_NOT_FOUND);
  }

  if (returnEntry.status !== "Pending") {
    return sendResponse(res, Responses.orderRes.RETURN_ALREADY_PROCCESSED);
  }

  if (type === "accept") {
    // Update each product in the return request
    let refund = 0;

    for (const itemId of returnEntry.items) {
      const product = order.products.find(
        (p) => p._id.toString() === itemId.toString(),
      );

      if (!product) continue;

      product.status = "Returned";
      product.requestStatus = "Pending";

      const price = product.subtotal + (product.total_gst || 0);

      order.totalPrice -= price;

      refund += price;
    }

    const allReturned = order.products.every((p) => p.status === "Returned");

    if (allReturned) {
      if (order.is_couponed) {
        const coupon = order.coupon;
        refund -= coupon.discountAmount;
        order.totalPrice += coupon.discountAmount;
      }
      order.totalPrice -= order.shippingCharge;
      refund += order.shippingCharge;
    }

    // Update return entry status
    returnEntry.status = "Approved";

    // Process refund
    await handleReturnCancel.processRefundReturn(
      order,
      refund,
      returnEntry.items,
    );
  } else if (type === "reject") {
    // Revert product statuses back to Active
    for (const itemId of returnEntry.items) {
      const product = order.products.find(
        (p) => p._id.toString() === itemId.toString(),
      );
      if (!product) continue;
      product.status = "Active";
      product.requestStatus = "None";
    }

    returnEntry.status = "Rejected";
  } else {
    return sendResponse(res, Responses.orderRes.INVALID_TYPE);
  }

  await order.save();

  return sendResponse(res, {
    code: 200,
    message: type === "accept" ? "Return accepted" : "Return rejected",
  });
});

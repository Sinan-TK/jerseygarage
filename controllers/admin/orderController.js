import wrapAsync from "../../utils/wrapAsync.js";
import Order from "../../models/orderModel.js";
import User from "../../models/userModel.js";
import sendResponse from "../../utils/sendResponse.js";
import * as walletHandler from "../../utils/walletHandler.js";
import paginate from "../../utils/pagination.js";
import { processRefundReturn } from "../../utils/handleReturnCancel.js";

// ======================================================================
// 6. ORDER PAGE
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
// 6. ORDER DATA
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
// 6. PLACE ORDER
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
// 6. STATUS CHANGE
// ======================================================================

export const changeStatus = wrapAsync(async (req, res) => {
  const { orderId, orderStatus, paymentStatus } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    return sendResponse(res, {
      code: 404,
      message: "Order not found",
    });
  }

  if (orderStatus) {
    // Prevent invalid jumps
    const validStatuses = [
      "Placed",
      "Confirmed",
      "Packed",
      "Shipped",
      "OutForDelivery",
      "Delivered",
      "Cancelled",
      "Returned",
    ];

    if (!validStatuses.includes(orderStatus)) {
      return sendResponse(res, {
        code: 400,
        message: "Invalid order status",
      });
    }

    order.orderStatus = orderStatus;

    // Set delivered time
    if (orderStatus === "Delivered") {
      order.deliveredAt = new Date();
    }
  }

  if (paymentStatus) {
    const validPayments = ["Pending", "Paid", "Refunded"];

    if (!validPayments.includes(paymentStatus)) {
      return sendResponse(res, {
        code: 400,
        message: "Invalid payment status",
      });
    }

    order.paymentStatus = paymentStatus;

    // Set paid time
    if (paymentStatus === "Paid") {
      order.paidAt = new Date();
    }
  }

  await order.save();

  return sendResponse(res, {
    code: 200,
    message: "Status updated successfully!",
  });
});

//

//

export const returnRequest = wrapAsync(async (req, res) => {
  const { type, returnId, orderId } = req.body;

  if (!type || !returnId || !orderId) {
    return sendResponse(res, { code: 403, message: "Something went wrong" });
  }

  const order = await Order.findById(orderId);
  if (!order) {
    return sendResponse(res, { code: 400, message: "Order not found" });
  }

  const returnEntry = order.returnHistory.find(
    (r) => r._id.toString() === returnId.toString(),
  );

  if (!returnEntry) {
    return sendResponse(res, {
      code: 400,
      message: "Return request not found",
    });
  }

  if (returnEntry.status !== "Pending") {
    return sendResponse(res, {
      code: 400,
      message: "Return request already processed",
    });
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
    await processRefundReturn(order, refund, returnEntry.items);
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
    return sendResponse(res, { code: 400, message: "Invalid type" });
  }

  await order.save();

  return sendResponse(res, {
    code: 200,
    message: type === "accept" ? "Return accepted" : "Return rejected",
  });
});

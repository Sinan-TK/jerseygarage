import wrapAsync from "../../utils/wrapAsync.js";
import Order from "../../models/orderModel.js";
import sendResponse from "../../utils/sendResponse.js";

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
  const limit = 10;
  const totalDocuments = await Order.countDocuments(filter);
  const totalPages = Math.ceil(totalDocuments / limit);

  if (page > totalPages) page = totalPages;
  if (page < 1) page = 1;

  const skip = (page - 1) * limit;

  const orders = await Order.find(filter)
    .populate("user_id", "full_name")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return sendResponse(res, {
    code: 200,
    message: "listing successfully",
    data: {
      orders,
      pagination: {
        totalPages,
        currentPage: page,
      },
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
    console.log(item);
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

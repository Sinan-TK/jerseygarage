import Category from "../../models/categoryModel.js";
import Offer from "../../models/offerModel.js";
import Product from "../../models/productModel.js";
import User from "../../models/userModel.js";
import wrapAsync from "../../utils/wrapAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import { couponSchema } from "../../validators/couponValidator.js";
import offerSchema from "../../validators/offerValidator.js";
import paginate from "../../utils/pagination.js";
import Order from "../../models/orderModel.js";
import * as Responses from "../../utils/responses/admin/offer.response.js";
import Coupon from "../../models/couponModel.js";
import XLSX from "xlsx";
import PDFDocument from "pdfkit";

//

//

export const salesReportPage = (req, res) => {
  res.render("admin/pages/salesReport", {
    title: "Sales Report",
    showLayout: true,
    cssFile: "/css/admin/salesReport.css",
    pageJS: "salesReport.js",
  });
};

//

//

export const productDatas = wrapAsync(async (req, res) => {
  const products = await Product.find();
  return sendResponse(res, {
    code: 200,
    message: "Products data loaded",
    data: products,
  });
});

//

//

export const getSalesReport = wrapAsync(async (req, res) => {
  const { filter, from, to, paymentStatus, orderStatus, productId, page } =
    req.query;

  // ── Build query ─────────────────────────────────────────────────────────
  const query = {};

  if (filter && filter !== "all") {
    let startDate,
      endDate = new Date();

    if (filter === "1day") {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
    } else if (filter === "1week") {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
    } else if (filter === "1month") {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (filter === "1year") {
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
    } else if (filter === "custom" && from && to) {
      startDate = new Date(from);
      endDate = new Date(to);
      endDate.setHours(23, 59, 59, 999);
    }

    if (startDate) query.createdAt = { $gte: startDate, $lte: endDate };
  }

  if (paymentStatus) query.paymentStatus = paymentStatus;
  if (orderStatus) query.orderStatus = orderStatus;
  if (productId) query["products.product_id"] = productId;

  // ── Paginated orders for table ───────────────────────────────────────────
  const pagination = await paginate(Order, page, 5, query);

  for (const order of pagination.data) {
    const user = await User.findById(order.user_id).select("full_name");
    order.user_id = user;
  }

  const shaped = pagination.data.map((o) => ({
    orderId: o.orderId,
    date: o.createdAt.toISOString().slice(0, 10),
    customer: o.user_id?.full_name || "Unknown",
    items: o.products.length,
    subtotal: o.itemsPrice,
    discount: o.totalDiscount || 0,
    coupon: o.is_couponed ? o.coupon?.discountAmount || 0 : 0,
    gst: o.totalGST,
    total: o.totalPrice,
    payment: o.paymentStatus,
    status: o.orderStatus,
    productNames: o.products.map((p) => p.product_id?.name || ""),
  }));

  // ── Summary from ALL matching orders ─────────────────────────────────────
  const allOrders = await Order.find(query).sort({ createdAt: -1 }).lean();
  const totalOrders = allOrders.length;
  const totalRevenue = allOrders.reduce((s, o) => s + o.totalPrice, 0);
  const totalDiscount = allOrders.reduce(
    (s, o) =>
      s +
      (o.totalDiscount || 0) +
      (o.is_couponed ? o.coupon?.discountAmount || 0 : 0),
    0,
  );
  const totalGST = allOrders.reduce((s, o) => s + (o.totalGST || 0), 0);
  const totalRefunds = allOrders
    .filter(
      (o) => o.orderStatus === "Returned" || o.orderStatus === "Cancelled",
    )
    .reduce((s, o) => s + o.totalPrice, 0);

  return sendResponse(res, {
    code: 200,
    message: "filered successfully",
    data: {
      orders: shaped,
      pagination: {
        currentPage: pagination.meta.page,
        totalPages: pagination.meta.totalPages,
        totalItems: pagination.meta.totalDocuments,
      },
      summary: {
        totalOrders,
        totalRevenue,
        totalDiscount,
        totalGST,
        totalRefunds,
      },
    },
  });
});

//

//

export const downloadSalesExcel = wrapAsync(async (req, res) => {
  const { filter, from, to, paymentStatus, orderStatus, productId } = req.query;

  // ── Build query ─────────────────────────────────────────────────────────
  const query = {};

  if (filter && filter !== "all") {
    let startDate,
      endDate = new Date();

    if (filter === "1day") {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
    } else if (filter === "1week") {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
    } else if (filter === "1month") {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (filter === "1year") {
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
    } else if (filter === "custom" && from && to) {
      startDate = new Date(from);
      endDate = new Date(to);
      endDate.setHours(23, 59, 59, 999);
    }

    if (startDate) query.createdAt = { $gte: startDate, $lte: endDate };
  }

  if (paymentStatus) query.paymentStatus = paymentStatus;
  if (orderStatus) query.orderStatus = orderStatus;
  if (productId) query["products.product_id"] = productId;

  // ── Fetch all matching orders (no pagination) ────────────────────────────
  const orders = await Order.find(query).sort({ createdAt: -1 }).lean();

  for (const order of orders) {
    const user = await User.findById(order.user_id).select("full_name");
    order.user_id = user;
  }

  // ── Shape into rows ──────────────────────────────────────────────────────
  const rows = orders.map((o) => ({
    "Order ID": o.orderId,
    Date: o.createdAt.toISOString().slice(0, 10),
    Customer: o.user_id?.full_name || "Unknown",
    Items: o.products.length,
    Subtotal: o.itemsPrice,
    Discount: o.totalDiscount || 0,
    Coupon: o.is_couponed ? o.coupon?.discountAmount || 0 : 0,
    GST: o.totalGST || 0,
    "Grand Total": o.totalPrice,
    Payment: o.paymentStatus,
    Status: o.orderStatus,
  }));

  // ── Generate Excel ───────────────────────────────────────────────────────
  const ws = XLSX.utils.json_to_sheet(rows);

  // ── Column widths ────────────────────────────────────────────────────────
  ws["!cols"] = [
    { wch: 28 }, // Order ID
    { wch: 12 }, // Date
    { wch: 20 }, // Customer
    { wch: 8 }, // Items
    { wch: 14 }, // Subtotal
    { wch: 14 }, // Discount
    { wch: 14 }, // Coupon
    { wch: 14 }, // GST
    { wch: 16 }, // Grand Total
    { wch: 12 }, // Payment
    { wch: 20 }, // Status
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sales Report");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  res.setHeader(
    "Content-Disposition",
    `attachment; filename=SalesReport_${new Date().toISOString().slice(0, 10)}.xlsx`,
  );
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.send(buffer);
});

//

//

export const downloadSalesPDF = wrapAsync(async (req, res) => {
  const { filter, from, to, paymentStatus, orderStatus, productId } = req.query;

  // ── Build query ─────────────────────────────────────────────────────────
  const query = {};

  if (filter && filter !== "all") {
    let startDate,
      endDate = new Date();
    if (filter === "1day") {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
    } else if (filter === "1week") {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
    } else if (filter === "1month") {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (filter === "1year") {
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
    } else if (filter === "custom" && from && to) {
      startDate = new Date(from);
      endDate = new Date(to);
      endDate.setHours(23, 59, 59, 999);
    }
    if (startDate) query.createdAt = { $gte: startDate, $lte: endDate };
  }

  if (paymentStatus) query.paymentStatus = paymentStatus;
  if (orderStatus) query.orderStatus = orderStatus;
  if (productId) query["products.product_id"] = productId;

  const orders = await Order.find(query).sort({ createdAt: -1 }).lean();
  for (const order of orders) {
    const user = await User.findById(order.user_id).select("full_name");
    order.user_id = user;
  }

  // ── Summary stats ────────────────────────────────────────────────────────
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((s, o) => s + o.totalPrice, 0);
  const totalDiscount = orders.reduce(
    (s, o) =>
      s +
      (o.totalDiscount || 0) +
      (o.is_couponed ? o.coupon?.discountAmount || 0 : 0),
    0,
  );
  const totalGST = orders.reduce((s, o) => s + (o.totalGST || 0), 0);
  const totalRefunds = orders
    .filter(
      (o) => o.orderStatus === "Returned" || o.orderStatus === "Cancelled",
    )
    .reduce((s, o) => s + o.totalPrice, 0);

  // ── Timeline label ───────────────────────────────────────────────────────
  const filterLabels = {
    all: "All Time",
    "1day": "Today",
    "1week": "Last 7 Days",
    "1month": "Last Month",
    "1year": "Last Year",
  };
  let timelineLabel = filterLabels[filter] || "All Time";
  if (filter === "custom" && from && to) {
    timelineLabel = `${new Date(from).toLocaleDateString()} – ${new Date(to).toLocaleDateString()}`;
  }

  // ── PDF Setup ────────────────────────────────────────────────────────────
  const doc = new PDFDocument({ margin: 30, size: "A4", layout: "landscape" });

  res.setHeader(
    "Content-Disposition",
    `attachment; filename=SalesReport_${new Date().toISOString().slice(0, 10)}.pdf`,
  );
  res.setHeader("Content-Type", "application/pdf");
  doc.pipe(res);

  const pageW = doc.page.width - 60;
  const startX = 30;

  // ── Title ────────────────────────────────────────────────────────────────
  doc
    .fontSize(20)
    .font("Helvetica-Bold")
    .fillColor("#1a1a1a")
    .text("JerseyGarage - Sales Report", startX, 30, {
      align: "center",
      width: pageW,
    });
  doc
    .fontSize(9)
    .font("Helvetica")
    .fillColor("#6b7280")
    .text(
      `Generated: ${new Date().toLocaleString()}  |  Period: ${timelineLabel}`,
      startX,
      56,
      { align: "center", width: pageW },
    );

  // ── Summary Cards ────────────────────────────────────────────────────────
  const cards = [
    { label: "TOTAL ORDERS", value: String(totalOrders), color: "#e53935" },
    {
      label: "TOTAL REVENUE",
      value: `Rs.${totalRevenue.toFixed(2)}`,
      color: "#16a34a",
    },
    {
      label: "TOTAL DISCOUNT",
      value: `Rs.${totalDiscount.toFixed(2)}`,
      color: "#d97706",
    },
    {
      label: "TOTAL GST",
      value: `Rs.${totalGST.toFixed(2)}`,
      color: "#2563eb",
    },
    {
      label: "TOTAL REFUNDS",
      value: `Rs.${totalRefunds.toFixed(2)}`,
      color: "#7c3aed",
    },
  ];

  const cardW = pageW / cards.length;
  const cardH = 52;
  const cardY = 72;

  cards.forEach((card, i) => {
    const cx = startX + i * cardW;
    doc.roundedRect(cx, cardY, cardW - 4, cardH, 6).fill(card.color);
    doc
      .fontSize(7)
      .font("Helvetica")
      .fillColor("#ffffff")
      .text(card.label, cx + 8, cardY + 10, { width: cardW - 16 });
    doc
      .fontSize(13)
      .font("Helvetica-Bold")
      .fillColor("#ffffff")
      .text(card.value, cx + 8, cardY + 24, { width: cardW - 16 });
  });

  // ── Table ────────────────────────────────────────────────────────────────
  const tableY = cardY + cardH + 16;
  const rowH = 20;

  const cols = [
    { label: "Order ID", w: 105 },
    { label: "Date", w: 62 },
    { label: "Customer", w: 70 },
    { label: "Items", w: 32 },
    { label: "Subtotal", w: 58 },
    { label: "Discount", w: 52 },
    { label: "Coupon", w: 48 },
    { label: "GST", w: 55 },
    { label: "Total", w: 62 },
    { label: "Payment", w: 52 },
    { label: "Status", w: 75 },
  ];

  // Header
  doc.rect(startX, tableY, pageW, rowH).fill("#e53935");
  let cx = startX;
  cols.forEach((col) => {
    doc
      .fontSize(7.5)
      .font("Helvetica-Bold")
      .fillColor("#ffffff")
      .text(col.label, cx + 3, tableY + 6, {
        width: col.w - 6,
        lineBreak: false,
      });
    cx += col.w;
  });

  const statusColors = {
    Delivered: "#16a34a",
    Shipped: "#2563eb",
    Confirmed: "#d97706",
    Cancelled: "#e53935",
    Returned: "#e53935",
    Pending: "#d97706",
    Placed: "#2563eb",
  };

  const payColors = {
    Paid: "#16a34a",
    Pending: "#d97706",
    Refunded: "#2563eb",
  };

  orders.forEach((o, i) => {
    const rowY = tableY + rowH + i * rowH;

    if (rowY + rowH > doc.page.height - 30) {
      doc.addPage();
    }

    if (i % 2 === 0) {
      doc.rect(startX, rowY, pageW, rowH).fill("#f9fafb");
    }

    doc.rect(startX, rowY, pageW, rowH).stroke("#e5e7eb");

    const couponAmt = o.is_couponed ? o.coupon?.discountAmount || 0 : 0;

    const row = [
      o.orderId,
      o.createdAt.toISOString().slice(0, 10),
      o.user_id?.full_name || "Unknown",
      String(o.products.length),
      `Rs.${(o.itemsPrice || 0).toFixed(2)}`,
      o.totalDiscount > 0 ? `-Rs.${o.totalDiscount.toFixed(2)}` : "—",
      couponAmt > 0 ? `-Rs.${couponAmt.toFixed(2)}` : "—",
      `Rs.${(o.totalGST || 0).toFixed(2)}`,
      `Rs.${(o.totalPrice || 0).toFixed(2)}`,
      o.paymentStatus,
      o.orderStatus,
    ];

    cx = startX;
    row.forEach((val, j) => {
      let color = "#1a1a1a";
      let font = "Helvetica";

      if (j === 9) {
        color = payColors[val] || "#1a1a1a";
        font = "Helvetica-Bold";
      }
      if (j === 10) {
        color = statusColors[val] || "#1a1a1a";
        font = "Helvetica-Bold";
      }
      if (j === 8) {
        font = "Helvetica-Bold";
      }

      doc
        .fontSize(7.5)
        .font(font)
        .fillColor(color)
        .text(val, cx + 3, rowY + 6, {
          width: cols[j].w - 6,
          lineBreak: false,
          ellipsis: true,
        });

      cx += cols[j].w;
    });
  });

  doc.end();
});

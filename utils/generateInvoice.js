import PDFDocument from "pdfkit";

export const generateInvoice = (order, res) => {
  // ── PDF Setup ────────────────────────────────────────────────────────────
  const doc = new PDFDocument({ margin: 40, size: "A4" });

  res.setHeader(
    "Content-Disposition",
    `attachment; filename=Invoice_${order.orderId}.pdf`,
  );
  res.setHeader("Content-Type", "application/pdf");
  doc.pipe(res);

  const pageW = doc.page.width - 80;
  const startX = 40;

  // ── Header ───────────────────────────────────────────────────────────────
  doc
    .fontSize(22)
    .font("Helvetica-Bold")
    .fillColor("#e53935")
    .text("JERSEYGARAGE", startX, 40);

  doc
    .fontSize(9)
    .font("Helvetica")
    .fillColor("#6b7280")
    .text("jerseygarage.com  |  support@jerseygarage.com", startX, 66);

  doc
    .fontSize(20)
    .font("Helvetica-Bold")
    .fillColor("#1a1a1a")
    .text("INVOICE", startX, 40, { align: "right", width: pageW });

  doc
    .fontSize(9)
    .font("Helvetica")
    .fillColor("#6b7280")
    .text(`Order ID: ${order.orderId}`, startX, 64, {
      align: "right",
      width: pageW,
    })
    .text(
      `Date: ${new Date(order.createdAt).toLocaleDateString("en-IN")}`,
      startX,
      76,
      { align: "right", width: pageW },
    );

  // ── Divider ──────────────────────────────────────────────────────────────
  doc
    .moveTo(startX, 95)
    .lineTo(startX + pageW, 95)
    .strokeColor("#e5e7eb")
    .stroke();

  // ── Billing Info ─────────────────────────────────────────────────────────
  const address = order.shippingAddress || {};

  doc
    .fontSize(9)
    .font("Helvetica-Bold")
    .fillColor("#6b7280")
    .text("BILL TO", startX, 108);

  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .fillColor("#1a1a1a")
    .text(address.fullName || "Customer", startX, 122);

  doc
    .fontSize(9)
    .font("Helvetica")
    .fillColor("#4b5563")
    .text(
      [
        address.addressLine1,
        address.addressLine2,
        `${address.city}, ${address.state} - ${address.zip_code}`,
        address.phone_no,
      ]
        .filter(Boolean)
        .join("\n"),
      startX,
      136,
    );

  // ── Payment Info ─────────────────────────────────────────────────────────
  doc
    .fontSize(9)
    .font("Helvetica-Bold")
    .fillColor("#6b7280")
    .text("PAYMENT INFO", startX, 108, { align: "right", width: pageW });

  doc
    .fontSize(9)
    .font("Helvetica")
    .fillColor("#4b5563")
    .text(
      [
        `Method: ${order.paymentMethod}`,
        `Status: ${order.paymentStatus}`,
        `Order Status: ${order.orderStatus}`,
      ].join("\n"),
      startX,
      122,
      { align: "right", width: pageW },
    );

  // ── Table Header ─────────────────────────────────────────────────────────
  const tableY = 220;
  const rowH = 24;

  const cols = [
    { label: "Product", w: 200 },
    { label: "Size", w: 80 },
    { label: "Qty", w: 40 },
    { label: "Price", w: 70 },
    { label: "GST", w: 60 },
    { label: "Total", w: 75 },
  ];

  function drawTableHeader(y) {
    doc.rect(startX, y, pageW, rowH).fill("#1a1a1a");
    let cx = startX;
    cols.forEach((col) => {
      doc
        .fontSize(8)
        .font("Helvetica-Bold")
        .fillColor("#ffffff")
        .text(col.label, cx + 4, y + 8, { width: col.w - 8, lineBreak: false });
      cx += col.w;
    });
  }

  drawTableHeader(tableY);

  let currentY = tableY + rowH;

  // ── Table Rows ───────────────────────────────────────────────────────────
  order.products.forEach((item, i) => {
    if (currentY + rowH > doc.page.height - 120) {
      doc.addPage();
      currentY = 40;
      drawTableHeader(currentY);
      currentY += rowH;
    }

    if (i % 2 === 0) {
      doc.rect(startX, currentY, pageW, rowH).fill("#f9fafb");
    }
    doc.rect(startX, currentY, pageW, rowH).stroke("#e5e7eb");

    const row = [
      item.name,
      item.size || "—",
      String(item.quantity),
      `Rs.${(item.price || 0).toFixed(2)}`,
      `Rs.${(item.total_gst || 0).toFixed(2)}`,
      `Rs.${(item.price + item.total_gst || 0).toFixed(2)}`,
    ];

    let cx = startX;
    row.forEach((val, j) => {
      doc
        .fontSize(8.5)
        .font(j === 5 ? "Helvetica-Bold" : "Helvetica")
        .fillColor("#1a1a1a")
        .text(val, cx + 4, currentY + 7, {
          width: cols[j].w - 8,
          lineBreak: false,
          ellipsis: true,
        });
      cx += cols[j].w;
    });

    currentY += rowH;
  });

  // ── Totals ───────────────────────────────────────────────────────────────
  currentY += 10;

  const totalsX = startX + pageW - 200;

  function totalRow(label, value, bold = false, color = "#1a1a1a") {
    doc
      .fontSize(9)
      .font(bold ? "Helvetica-Bold" : "Helvetica")
      .fillColor("#6b7280")
      .text(label, totalsX, currentY, { width: 120 });

    doc
      .fontSize(9)
      .font(bold ? "Helvetica-Bold" : "Helvetica")
      .fillColor(color)
      .text(value, totalsX + 120, currentY, { width: 80, align: "right" });

    currentY += 18;
  }

  doc
    .moveTo(totalsX, currentY)
    .lineTo(startX + pageW, currentY)
    .strokeColor("#e5e7eb")
    .stroke();

  currentY += 8;

  totalRow("Subtotal:", `Rs.${(order.itemsPrice || 0).toFixed(2)}`);

  if (order.totalDiscount > 0) {
    totalRow(
      "Discount:",
      `-Rs.${order.totalDiscount.toFixed(2)}`,
      false,
      "#16a34a",
    );
  }

  if (order.is_couponed && order.coupon?.discountAmount > 0) {
    totalRow(
      `Coupon (${order.coupon.code}):`,
      `-Rs.${order.coupon.discountAmount.toFixed(2)}`,
      false,
      "#16a34a",
    );
  }

  totalRow("GST:", `Rs.${(order.totalGST || 0).toFixed(2)}`);
  totalRow(
    "Shipping:",
    order.shippingCharge > 0 ? `Rs.${order.shippingCharge.toFixed(2)}` : "FREE",
  );

  doc
    .moveTo(totalsX, currentY)
    .lineTo(startX + pageW, currentY)
    .strokeColor("#1a1a1a")
    .stroke();

  currentY += 8;

  totalRow(
    "TOTAL:",
    `Rs.${(order.totalPrice || 0).toFixed(2)}`,
    true,
    "#e53935",
  );

  // ── Footer ───────────────────────────────────────────────────────────────
  doc
    .fontSize(8)
    .font("Helvetica")
    .fillColor("#9ca3af")
    .text(
      "Thank you for shopping with JerseyGarage! For support, contact support@jerseygarage.com",
      startX,
      doc.page.height - 50,
      { align: "center", width: pageW },
    );

  doc.end();
};
// export default generateInvoice;

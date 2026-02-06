import PDFDocument from "pdfkit";

const generateInvoice = (order, res) => {
  const doc = new PDFDocument({ margin: 50 });

  // Headers
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=invoice-${order.orderId}.pdf`
  );

  doc.pipe(res);

  /* ========== HEADER ========== */

  doc
    .fontSize(20)
    .text("INVOICE", { align: "center" })
    .moveDown();

  doc
    .fontSize(12)
    .text(`Order ID: ${order.orderId}`)
    .text(`Date: ${new Date(order.createdAt).toDateString()}`)
    .moveDown();

  /* ========== CUSTOMER ========== */

  doc.text("BILL TO:", { underline: true }).moveDown(0.3);

  doc
    .text(order.shippingAddress.full_name)
    .text(order.shippingAddress.address_line)
    .text(
      `${order.shippingAddress.city}, ${order.shippingAddress.state}`
    )
    .text(order.shippingAddress.zip_code)
    .text(`Phone: ${order.shippingAddress.phone_no}`)
    .moveDown();

  /* ========== ITEMS TABLE ========== */

  const tableTop = doc.y + 10;

  const itemX = 50;
  const nameX = 80;
  const qtyX = 350;
  const priceX = 420;
  const totalX = 480;

  // Table Header
  doc
    .fontSize(11)
    .text("#", itemX, tableTop, { width: 30, align: "center" })
    .text("Item", nameX, tableTop, { width: 250 })
    .text("Qty", qtyX, tableTop, { width: 50, align: "center" })
    .text("Price", priceX, tableTop, { width: 60, align: "right" })
    .text("Total", totalX, tableTop, { width: 60, align: "right" });

  drawLine(doc, tableTop + 15);

  let position = tableTop + 25;

  // Table Rows
  order.products.forEach((item, i) => {
    doc
      .fontSize(10)
      .text(i + 1, itemX, position, { width: 30, align: "center" })
      .text(item.name, nameX, position, { width: 250 })
      .text(item.quantity, qtyX, position, {
        width: 50,
        align: "center",
      })
      .text(`${item.price}`, priceX, position, {
        width: 60,
        align: "right",
      })
      .text(`${item.subtotal}`, totalX, position, {
        width: 60,
        align: "right",
      });

    drawLine(doc, position + 15);
    position += 25;
  });

  doc.moveDown(3);

  /* ========== TOTAL ========== */

  doc
    .fontSize(13)
    .text(`Grand Total: ${order.totalPrice}`, 400, doc.y, {
      align: "right",
    })
    .moveDown();

  /* ========== FOOTER ========== */

  doc
    .fontSize(10)
    .text("Thank you for shopping with us!", {
      align: "center",
    });

  doc.end();
};

/* Draw horizontal line */
const drawLine = (doc, y) => {
  doc
    .strokeColor("#aaaaaa")
    .lineWidth(0.5)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();
};

export default generateInvoice;

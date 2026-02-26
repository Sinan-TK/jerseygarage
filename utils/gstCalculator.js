const gstCalculator = async (products) => {
  const gst5 = 0.05;
  const gst12 = 0.12;

  let gstAmount = 0;

  for (const product of products) {
    if (product.unit_price > 1000) {
      product.gst_rate = gst12 * 100;
      product.unit_gst = product.unit_price * gst12;
      product.total_gst = product.subtotal * gst12;
      gstAmount += product.total_gst;
    } else {
      product.gst_rate = gst5 * 100;
      product.unit_gst = product.unit_price * gst5;
      product.total_gst = product.subtotal * gst5;
      gstAmount += product.total_gst;
    }
  }

  return gstAmount;
};

export default gstCalculator;

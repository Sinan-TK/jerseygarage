const updateStatus = document.getElementById("updateStatus");
updateStatus.addEventListener("click", async () => {
  const orderStatus = document.getElementById("orderStatus").value;
  const paymentStatus = document.getElementById("paymentStatus").value;
  const orderId = updateStatus.dataset.orderId;

  console.log(orderId)

  console.log(orderStatus, paymentStatus, orderId);

  try {
    const res = await axios.patch("/admin/orders/change-status", {
      orderStatus,
      paymentStatus,
      orderId,
    });

    if (res.data.success) {
      toastr.success(res.data.message, "success");
    }
  } catch (err) {
    const error = err.response?.data;
    console.log(error);
    toastr.error(error?.message || "Something went wrong", "Failed");
  }
});

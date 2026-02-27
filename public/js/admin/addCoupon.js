const addCouponForm = document.getElementById("addCouponForm");

addCouponForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // stop page reload

  const formData = new FormData(addCouponForm);

  // Convert FormData to plain object
  const data = Object.fromEntries(formData.entries());

  // Fix number & boolean fields
  data.discountValue = Number(data.discountValue);
  data.minPurchaseAmount = data.minPurchaseAmount
    ? Number(data.minPurchaseAmount)
    : "";
  data.maxDiscountAmount = data.maxDiscountAmount
    ? Number(data.maxDiscountAmount)
    : null;
  data.usageLimit = Number(data.usageLimit);
  data.perUserLimit = Number(data.perUserLimit);
  data.isActive = addCouponForm.querySelector('input[name="isActive"]').checked;

  try {
    const res = await axios.post("/admin/coupons/add", data);

    if (res.data.success) {
      toastr.success(res.data.message, "Success");

      setTimeout(() => {
        window.location.href = res.data.redirect;
      }, 1500);
    }
  } catch (err) {
    const error = err.response?.data;
    console.log(error);
    toastr.error(error?.message || "Something went wrong!", "Error");
  }
});

let couponId = "";

async function loadCoupon() {
  const pathParts = window.location.pathname.split("/");
  couponId = pathParts[pathParts.length - 1];

  console.log("Coupon ID:", couponId);

  try {
    const res = await axios.get(`/admin/coupons/edit/data/${couponId}`);

    if (res.data.success) {
      const coupon = res.data.data;
      document.querySelector(".current").innerHTML = coupon.code;
      inputValue("code", coupon.code);
      inputValue("discountValue", coupon.discountValue);
      inputValue("minPurchaseAmount", coupon.minPurchaseAmount);
      inputValue("maxDiscountAmount", coupon.maxDiscountAmount);
      inputValue("usageLimit", coupon.usageLimit);
      inputValue("perUserLimit", coupon.perUserLimit);
      inputValue("expiryDate", formatDateForInput(coupon.expiryDate));
      inputValue("discountType", coupon.discountType);
      const statusBar = document.querySelector("input[name='isActive']");
      if (!coupon.isActive) {
        statusBar.checked = false;
      }
    }
    console.log(res);
  } catch (err) {
    const error = err.response?.data;
    console.log(error);
    toastr.error(error?.message || "Something went wrong!", "Error");
  }
}

function formatDateForInput(isoDate) {
  if (!isoDate) return "";
  return new Date(isoDate).toISOString().split("T")[0];
}

function inputValue(name, value) {
  const input = document.querySelector(`[name="${name}"]`);
  value === null ? "" : value;
  if (input) {
    input.value = value;
  }
}

loadCoupon();

const editCouponForm = document.getElementById("addCouponForm");

editCouponForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(editCouponForm);

  const data = Object.fromEntries(formData.entries());

  data.discountValue = Number(data.discountValue);
  data.minPurchaseAmount = data.minPurchaseAmount
    ? Number(data.minPurchaseAmount)
    : "";
  data.maxDiscountAmount = data.maxDiscountAmount
    ? Number(data.maxDiscountAmount)
    : null;
  data.usageLimit = Number(data.usageLimit);
  data.perUserLimit = Number(data.perUserLimit);
  data.isActive = editCouponForm.querySelector(
    'input[name="isActive"]',
  ).checked;

  try {
    const res = await axios.patch(`/admin/coupons/edit/${couponId}`, data);

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

// Toggle active radio cards
document.querySelectorAll(".radio-card").forEach((card) => {
  card.addEventListener("click", () => {
    const name = card.querySelector("input").name;
    document
      .querySelectorAll(`input[name="${name}"]`)
      .forEach((i) => i.closest(".radio-card").classList.remove("active"));
    card.classList.add("active");
    card.querySelector("input").checked = true;
  });
});

document
  .getElementById("addAddressForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = document.getElementById("submitBtn");
    btn.innerHTML = "Saving...";
    btn.disabled = true;
    const form = e.target;

    const formData = {
      full_name: form.full_name.value.trim(),
      address_type: form.address_type.value.trim(),
      phone_no: form.phone_no.value.trim(),
      address_line: form.address_line.value.trim(),
      city: form.city.value.trim(),
      state: form.state.value.trim(),
      zip_code: form.zip_code.value.trim(),
      country: form.country.value.trim(),
      is_default: true,
    };

    try {
      const res = await axios.post("/user/address", formData);

      if (res.data.success) {
        toastr.success(res.data.message, "Success");

        setTimeout(() => {
          closeAddAddressModal();
          window.location.reload();
        }, 1000);
      }
    } catch (err) {
      const error = err.response?.data;
      console.error(error);

      btn.innerHTML = "Save Address";
      btn.disabled = false;
      toastr.error(error?.message || "Something went wrong", "Failed!!");
    }
  });

function openAddAddressModal() {
  document.getElementById("addAddressModal").style.display = "flex";
}

function closeAddAddressModal() {
  const modal = document.getElementById("addAddressModal");
  const form = document.getElementById("addAddressForm");

  form.reset();

  const btn = document.getElementById("submitBtn");
  btn.innerHTML = "Save Address";
  btn.disabled = false;

  modal.style.display = "none";
}

function closeEditAddressModal() {
  document.getElementById("editAddressModal").style.display = "none";
}

function openEditAddressModal(btn) {
  const address = JSON.parse(decodeURIComponent(btn.dataset.address));

  document.getElementById("edit_address_id").value = address._id;
  document.getElementById("edit_full_name").value = address.full_name;
  document.getElementById("edit_address_type").value = address.address_type;
  document.getElementById("edit_phone_no").value = address.phone_no;
  document.getElementById("edit_address_line").value = address.address_line;
  document.getElementById("edit_city").value = address.city;
  document.getElementById("edit_state").value = address.state;
  document.getElementById("edit_zip_code").value = address.zip_code;
  document.getElementById("edit_country").value = address.country;
  document.getElementById("edit_is_default").checked = address.is_default;

  document.getElementById("editAddressModal").style.display = "flex";
}

document
  .getElementById("editAddressForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = e.target;
    const btn = form.querySelector("#edit-submit");

    btn.innerHTML = "Saving...";
    btn.disabled = true;

    const addressId = form.address_id.value;

    const formData = {
      full_name: form.full_name.value.trim(),
      address_type: form.address_type.value.trim(),
      phone_no: form.phone_no.value.trim(),
      address_line: form.address_line.value.trim(),
      city: form.city.value.trim(),
      state: form.state.value.trim(),
      zip_code: form.zip_code.value.trim(),
      country: form.country.value.trim(),
      is_default: form.is_default.checked,
    };

    try {
      const res = await axios.patch(
        `/user/address/edit/${addressId}`,
        formData,
      );
      if (res.data.success) {
        toastr.success(res.data.message, "Success");

        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (err) {
      const error = err.response?.data;

      toastr.error(error?.message, "Error!!");

      btn.innerHTML = "Update Address";
      btn.disabled = false;
    }
  });

let couponCode = "";

const placeOrderBtn = document.querySelector(".place-order");

placeOrderBtn.addEventListener("click", async () => {
  placeOrderBtn.disabled = true;
  placeOrderBtn.innerText = "Processing...";

  const addressId = selectedValue("address");

  const paymentMethod = selectedValue("payment");

  try {
    showLoading("Placing your order...");
    const res = await axios.post("/user/place-order", {
      addressId,
      paymentMethod,
      couponCode,
    });

    if (res.data.data?.warnings?.length > 0) {
      hideLoading();
      toastr.warning(res.data.message, "Sorry");
      const summaryCard = document.querySelector(".summary-card");
      const existing = summaryCard.querySelector(".warning-message");
      if (existing) existing.remove();
      const waringMess = document.createElement("div");
      waringMess.className = "warning-message";
      waringMess.innerHTML = `<h3><i class="fa-solid fa-triangle-exclamation"></i>Sorry</h3>`;
      const waringList = document.createElement("ul");
      const warns = res.data.data.warnings;
      console.log(warns);
      warns.forEach((warn) => {
        const li = document.createElement("li");
        li.innerHTML = warn;
        waringList.appendChild(li);
      });
      waringMess.appendChild(waringList);
      summaryCard.prepend(waringMess);
    } else {
      if (res.data.success) {
        const data = res.data.data;

        if (data.paymentMethod === "Razorpay") {
          const order = data;

          const options = {
            key: order.key,
            amount: order.amount,
            currency: order.currency,
            name: order.name,
            description: order.description,
            order_id: order.orderId,

            handler: async function (response) {
              try {
                showLoading("Verifying payment...");
                const verifyRes = await axios.post("/user/payment/verify", {
                  ...response,
                });

                if (verifyRes.data.success) {
                  toastr.success(verifyRes.data.message, "Paid");
                  setTimeout(() => {
                    window.location.href = verifyRes.data.redirect;
                  }, 1500);
                }
              } catch (err) {
                const error = err.response?.data;
                toastr.error(
                  error?.message || "Payment verification failed",
                  "Failed",
                );
                resetBtn();
                hideLoading();
              }
            },

            modal: {
              ondismiss: function () {
                hideLoading();
                resetBtn();
                axios
                  .post("/user/payment/failed")
                  .then((res) => {
                    if (res.data.success) {
                      toastr.info(res.data.message, "Cancelled");
                      setTimeout(() => {
                        window.location.href = res.data.redirect;
                      }, 1500);
                    }
                  })
                  .catch((err) => {
                    const error = err.response?.data;
                    console.error(
                      error?.message || "Something went wrong",
                      err,
                    );
                  });
              },
            },

            theme: { color: "#000" },
          };

          hideLoading();
          new Razorpay(options).open();
        } else {
          toastr.success(res.data.message, "Success");
          setTimeout(() => {
            window.location.href = res.data.redirect;
          }, 1500);
        }
      }
    }
  } catch (err) {
    const error = err.response?.data;
    resetBtn();
    hideLoading();
    console.log(error);
    toastr.error(error?.message || "Something went wrong", "Failed");
  }
});

function selectedValue(name) {
  return document.querySelector(`input[name="${name}"]:checked`)?.value || "";
}

document.getElementById("applyPromoBtn").addEventListener("click", async () => {
  const code = document.getElementById("promoSelect").value;

  try {
    const res = await axios.post("/user/checkout/coupon", { code });

    if (res.data.success) {
      const data = res.data.data;
      document.getElementById("totalAmount").innerHTML = data.total.toFixed(2);
      if (data.total < 1000) {
        document.getElementById("codLabel").classList.remove("disabled");
        document.querySelector("input[value='COD']").disabled = true;
        document.getElementById("codText").classList.replace("small", "hidden");
      }
      const coupon = data.coupon;
      const couponPrice = document.querySelector(".coupon-price");
      couponPrice.style.display = "flex";
      couponPrice.innerHTML = "";
      couponPrice.innerHTML = `
      <span>Coupon(${coupon.code})</span>
      <span>₹${coupon.discountAmount.toFixed(2)}</span>`;

      const couponDiv = document.getElementById("couponText");
      couponDiv.classList.replace("hidden", "success");
      couponDiv.innerHTML = `"${data.coupon.code}" Coupon applied successfully 🎉 `;
      couponCode = data.coupon.code;
      const dropdown = document.querySelector(".promo-dropdown");
      dropdown.style.display = "none";
    }
  } catch (err) {
    const error = err.response?.data;
    console.log(error);
    toastr.error(error?.message || "Something went wrong", "Failed");
  }
});

function resetBtn() {
  placeOrderBtn.disabled = false;
  placeOrderBtn.innerText = "PLACE ORDER";
}

const loadingOverlay = document.getElementById("loadingOverlay");

function showLoading(message = "Placing your order...") {
  loadingOverlay.querySelector("p").textContent = message;
  loadingOverlay.classList.add("show");
}

function hideLoading() {
  loadingOverlay.classList.remove("show");
}

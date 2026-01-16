document.querySelectorAll(".qty").forEach((qtyBox) => {
  const minusBtn = qtyBox.querySelector(".qty-minus");
  const plusBtn = qtyBox.querySelector(".qty-plus");
  const valueEl = qtyBox.querySelector(".qty-value");
  const total = document.getElementById("total");
  const subTotal = document.getElementById("subTotal");

  let quantity = parseInt(valueEl.innerText);

  const variant_id = valueEl.dataset.variant;
  const cartItem = qtyBox.closest(".cart-row");
  const itemSubtotal = cartItem.querySelector(".subtotal");

  plusBtn.addEventListener("click", async () => {
    try {
      const res = await axios.patch("/user/cart", {
        variant_id,
        value: "plus",
        quantity,
      });

      if (res.data.success) {
        quantity = res.data.data.quantity;
        valueEl.innerText = res.data.data.quantity;
        itemSubtotal.innerText = `₹${res.data.data.itemTotal}.00`;
        total.innerHTML = `₹${res.data.data.total}.00`;
        subTotal.innerHTML = `₹${res.data.data.subtotal}.00`;
        // subtotal,total,subTotal
      }
    } catch (err) {
      const error = err.response?.data;

      toastr.error(error.message, "Error!!");
    }
  });

  minusBtn.addEventListener("click", async () => {
    if (quantity > 1) {
      try {
        const res = await axios.patch("/user/cart", {
          variant_id,
          value: "minus",
          quantity,
        });

        if (res.data.success) {
          quantity = res.data.data.quantity;
          valueEl.innerText = res.data.data.quantity;
          itemSubtotal.innerText = `₹${res.data.data.itemTotal}.00`;
          total.innerHTML = `₹${res.data.data.total}.00`;
          subTotal.innerHTML = `₹${res.data.data.subtotal}.00`;
        }
      } catch (err) {
        const error = err.response?.data;

        toastr.error(error.message, "Error!!");
      }
    }
  });
});

document.getElementById("checkoutBtn").addEventListener("click", async () => {
  try {
    const res = await axios.post("/user/checkout");
    if (res.data.success) {
      window.location.href = res.data.redirect;
    }
  } catch (err) {
    const error = err.response?.data;
    toastr.error(error.message, "Error!!");
  }
});

document.getElementById("continueShop").addEventListener("click", () => {
  window.location.href = "/shop";
});

const total = document.getElementById("total");
const subTotal = document.getElementById("subTotal");

document.querySelectorAll(".qty").forEach((qtyBox) => {
  const minusBtn = qtyBox.querySelector(".qty-minus");
  const plusBtn = qtyBox.querySelector(".qty-plus");
  const valueEl = qtyBox.querySelector(".qty-value");

  let quantity = parseInt(valueEl.innerText);

  const variant_id = valueEl.dataset.variant;
  const cartItem = qtyBox.closest(".cart-row");
  const itemSubtotal = cartItem.querySelector(".subtotal");
  const gstAmount = document.getElementById("gst-amount");

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
        itemSubtotal.innerText = `₹${res.data.data.itemTotal.toFixed(2)}`;
        total.innerHTML = `₹${res.data.data.total.toFixed(2)}`;
        subTotal.innerHTML = `₹${res.data.data.subtotal.toFixed(2)}`;
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
          itemSubtotal.innerText = `₹${res.data.data.itemTotal.toFixed(2)}`;
          total.innerHTML = `₹${res.data.data.total.toFixed(2)}`;
          subTotal.innerHTML = `₹${res.data.data.subtotal.toFixed(2)}`;
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
    if (res.data?.data?.warnings?.length > 0) {
      toastr.warning(res.data.message, "sorry");
      const cartItems = document.querySelector(".cart-items");
      const existing = cartItems.querySelector(".warning-message");
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
      cartItems.prepend(waringMess);
    } else {
      window.location.href = res.data.redirect;
    }
  } catch (err) {
    const error = err.response?.data;
    console.log(error);
    toastr.error(error.message || "Something went wrong", "Error!!");
  }
});

document.getElementById("continueShop").addEventListener("click", () => {
  window.location.href = "/shop";
});

document.querySelectorAll(".remove").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const cartRow = btn.closest(".cart-row");
    const variant_id = cartRow.dataset.variant;

    console.log(variant_id);

    try {
      const res = await axios.delete("/user/cart/remove", {
        data: { variant_id },
      });

      if (res.data.success) {
        cartRow.remove();

        subTotal.innerText = `₹${res.data.data.subtotal}.00`;
        total.innerText = `₹${res.data.data.total}.00`;
        if (res.data.data.items_count === 0) {
          document.querySelector(".cart-page").innerHTML = `
            <div class="empty-cart">
            <i class="fa-solid fa-cart-shopping empty-icon"></i>
            <h3>Your cart is empty</h3>
            <a href="/shop">Continue Shopping</a>
            </div>
          `;
        }
        document.querySelector(".cart-count").innerText =
          `${res.data.data.items_count}`;
      }
    } catch (err) {
      toastr.error(
        err.response?.data?.message || "Unable to remove item",
        "Error",
      );
    }
  });
});

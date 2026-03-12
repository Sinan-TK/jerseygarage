document.addEventListener("DOMContentLoaded", () => {
  const steps = document.querySelectorAll(".step");
  const lines = document.querySelectorAll(".line");

  // Get current status from backend / EJS
  // Example (replace dynamically):
  const currentStatus = document.getElementById("orderstatus").dataset.status;

  if (currentStatus !== "Cancelled") {
    const statusFlow = [
      "Placed",
      "Packed",
      "Shipped",
      "OutForDelivery",
      "Delivered",
    ];

    const currentIndex = statusFlow.indexOf(currentStatus);

    // Activate steps
    steps.forEach((step, index) => {
      if (index <= currentIndex) {
        step.classList.add("active");
      }
    });

    // Animate lines
    lines.forEach((line, index) => {
      const progress = line.querySelector(".progress");

      if (index < currentIndex) {
        setTimeout(() => {
          progress.style.width = "100%";
        }, index * 300); // delay for cascade effect
      }
    });
  }
});

/* =====================================
   ORDER CANCEL / RETURN MODAL SCRIPT
===================================== */

let ORDER_ID = "";
let ORDER_STATUS = "";
let ORDER_PRODUCTS = [];

/* =====================================
   INIT (Runs When Page Loads)
===================================== */

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("orderModal");

  if (!modal) return;

  /* ===== GET DATA FROM EJS (HTML ATTRIBUTES) ===== */

  // From: data-order-id=""
  ORDER_ID = modal.dataset.orderId;

  // From: data-order-status=""
  ORDER_STATUS = modal.dataset.orderStatus;

  const products = JSON.parse(modal.dataset.products || "[]");

  const finalProducts = products.filter(
    (p) =>
      p.status !== "Cancelled" &&
      p.status !== "Returned" &&
      p.status !== "Return-Requested" &&
      p.status !== "Cancel-Requested",
  );

  // From: data-products=""
  ORDER_PRODUCTS = finalProducts;
});

/* =====================================
   OPEN / CLOSE MODAL
===================================== */

function openModal() {
  setupActionOptions();
  setupItemList();

  document.getElementById("orderModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("orderModal").style.display = "none";
}

/* =====================================
   SET ACTION OPTIONS
===================================== */

function setupActionOptions() {
  const select = document.getElementById("actionType");
  const selectReasons = document.getElementById("actionReasonDropdown");

  select.innerHTML = "";
  selectReasons.innerHTML = "";

  /* NOT delivered → Cancel */
  if (ORDER_STATUS !== "Delivered") {
    select.innerHTML += `
      <option value="full-cancel">Full Cancel</option>
      <option value="partial-cancel">Partial Cancel</option>
    `;
    selectReasons.innerHTML += `
        <option value="">Reason</option>
        <option value="Ordered by mistake">Ordered by mistake</option>
        <option value="Delivery time is too long">Delivery time is too long</option>
        <option value="Found a better price elsewhere">Found a better price elsewhere</option>
        <option value="Changed mind">Changed mind</option>
        <option value="Payment or checkout issue">Payment or checkout issue</option>`;
  }

  /* Delivered → Return */
  if (ORDER_STATUS === "Delivered") {
    select.innerHTML += `
      <option value="full-return">Full Return</option>
      <option value="partial-return">Partial Return</option>
    `;
    selectReasons.innerHTML += `
        <option value="">Reason</option>
        <option value="Received a damaged or defective product">Received a damaged or defective product</option>
        <option value="Wrong product delivered">Wrong product delivered</option>
        <option value="Product does not match description">Product does not match description</option>
        <option value="Size / fit issue">Size / fit issue</option>
        <option value="Quality not as expected">Quality not as expected</option>`;
  }
}

/* =====================================
   BUILD ITEM LIST
===================================== */

function setupItemList() {
  const box = document.getElementById("itemList");

  box.innerHTML = "";

  ORDER_PRODUCTS.forEach((item) => {
    box.innerHTML += `
      <label class="item-check">
        <input type="checkbox" value="${item._id}" />
        ${item.name} (Qty: ${item.quantity})
      </label>
    `;
  });
}

/* =====================================
   SHOW / HIDE ITEM BOX
===================================== */

function handleActionChange() {
  const action = document.getElementById("actionType").value;

  const itemBox = document.getElementById("itemSelection");

  if (action === "partial-cancel" || action === "partial-return") {
    itemBox.style.display = "block";
  } else {
    itemBox.style.display = "none";
  }
}

/* =====================================
   SUBMIT ACTION
===================================== */

async function submitAction() {
  btnSubmit(true);
  const action = document.getElementById("actionType").value;

  const reason =
    document.getElementById("actionReasonDropdown").value ||
    document.getElementById("actionReason").value;

  const items = [];

  document.querySelectorAll("#itemList input:checked").forEach((el) => {
    items.push(el.value);
  });

  /* ===== DATA TO BACKEND ===== */

  let finalAction = action;

  // If partial + all items selected → make it full
  if (action === "partial-cancel" && items.length === ORDER_PRODUCTS.length) {
    finalAction = "full-cancel";
  }

  if (action === "partial-return" && items.length === ORDER_PRODUCTS.length) {
    finalAction = "full-return";
  }

  const payload = {
    orderId: ORDER_ID,
    action: finalAction,
    reason,
    items,
  };

  /* ===== API CALL ===== */

  try {
    const res = await axios.patch("/user/orders/order-action", payload);
    const order = res.data.data;
    loadItems(order);
    ORDER_PRODUCTS = order.products.filter(
      (p) =>
        p.status !== "Cancelled" &&
        p.status !== "Returned" &&
        p.status !== "Return-Requested" &&
        p.status !== "Cancel-Requested",
    );
    closeModal();
    if (["Cancelled", "Returned"].includes(order.orderStatus)) {
      document.querySelectorAll(".cancel-box").style.display = "none";
    }
    btnSubmit(false);
    toastr.success(res.data.message, "Success");
  } catch (err) {
    const error = err.response?.data;
    console.error(error);
    btnSubmit(false);
    const errorBox = document.getElementById("errorBox");
    const errorText = document.getElementById("errorText");
    errorBox.style.display = "flex";
    errorText.innerHTML = error?.message || "Something went wrong!!";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const openBtn = document.getElementById("openOrderModal");

  if (openBtn) {
    openBtn.addEventListener("click", () => {
      openModal();
    });
  }
});

function loadItems(data) {
  document.getElementById("itemsPrice").innerHTML =
    `₹${data.itemsPrice.toFixed(2)}`;

  document.getElementById("gstAmount").innerHTML =
    `₹${data.totalGST.toFixed(2)}`;

  // Remove old refund div if it exists
  const existingRefund = document.getElementById("refundAmountDiv");
  if (existingRefund) existingRefund.remove();

  if (data.refundAmount) {
    const gstAmountDiv = document.getElementById("gstAmountDiv");
    const newDiv = document.createElement("div");
    newDiv.className = "summary-row"; //

    newDiv.innerHTML = `<span>Refund Amount</span>
    <span id="refundAmount">-₹${data.refundAmount.toFixed(2)}</span>`;
    gstAmountDiv.insertAdjacentElement("afterend", newDiv);
  }

  document.getElementById("totalPrice").innerHTML =
    `₹${data.totalPrice.toFixed(2)}`;
  const card = document.getElementById("orderItems");
  card.innerHTML = "";
  const h3 = document.createElement("h3");
  h3.innerHTML = "Order Items";
  card.append(h3);
  data.products.forEach((item) => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `<img src="${item.image}" />
          <div class="item-info">
              <h4>${item.name}</h4>
              <p>Size: ${item.size} • Qty: ${item.quantity}</p>
              <strong> ${item.price} </strong>
          </div>
          <span class="item-status status-${item.status}">
              ${item.status}
          </span>`;

    card.append(div);
  });
}

function btnSubmit(loading) {
  const btn = document.getElementById("submitBtn");
  btn.disabled = loading;
  btn.innerText = loading ? "Submitting..." : "Submit";
}

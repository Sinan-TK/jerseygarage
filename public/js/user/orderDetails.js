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

  // From: data-products=""
  ORDER_PRODUCTS = JSON.parse(modal.dataset.products || "[]");
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

  select.innerHTML = "";

  /* NOT delivered → Cancel */
  if (ORDER_STATUS !== "Delivered") {
    select.innerHTML += `
      <option value="full-cancel">Full Cancel</option>
      <option value="partial-cancel">Partial Cancel</option>
    `;
  }

  /* Delivered → Return */
  if (ORDER_STATUS === "Delivered") {
    select.innerHTML += `
      <option value="full-return">Full Return</option>
      <option value="partial-return">Partial Return</option>
    `;
  }
}

/* =====================================
   BUILD ITEM LIST
===================================== */

function setupItemList() {
  const box = document.getElementById("itemList");

  box.innerHTML = "";

  /*
    ORDER_PRODUCTS comes from:
    data-products="<%- JSON.stringify(order.products) %>"
  */

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
  const action = document.getElementById("actionType").value;

  const reason = document.getElementById("actionReason").value;

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

  console.log("Sending:", payload);

  /* ===== API CALL ===== */

  try {
    const res = await axios.patch("/user/orders/order-action", payload);

    console.log(res);
    closeModal();
  } catch (err) {
    const error = err.response?.data;
    toastr.error(error?.message || "Something went wrong", "Failed");
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

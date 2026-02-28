async function walletData(page = 1) {
  try {
    const res = await axios.get("/user/wallet/data", {
      params: { page },
    });
    console.log(res.data.data);
    loadWallet(res.data.data);
  } catch (err) {
    const error = err.response?.data;
    toastr.error(error?.message || "Something went wrong", "Failed");
  }
}

/* -------------------------
   Load Wallet
--------------------------*/

function loadWallet(data) {
  const page = data.pagination;
  document.getElementById("balance").innerText = data.balance.toFixed(2);

  const list = document.getElementById("transactionList");

  list.innerHTML = "";

  data.transactions.forEach((item) => {
    const div = document.createElement("div");

    div.className = "transaction";

    div.innerHTML = `

      <div class="left">
        <h4>${item.reason}</h4>
        <p>${formatDate(item.date)}</p>
      </div>

      <div class="amount ${item.type === "credit" ? "credit" : "debit"}">

        ${item.type === "credit" ? "+ ₹" + item.amount.toFixed(2) : "- ₹" + item.amount.toFixed(2)}

      </div>

    `;

    list.appendChild(div);
  });
  document.querySelector(".pagination").innerHTML = pagination(page);
}

function pagination(data) {
  const backward = data.page > 1 ? true : false;
  const forward = data.page < data.totalPages ? true : false;
  return `${
    backward
      ? `<button onclick="walletData(${data.page - 1})" class="arrow-btn">
      <i class="fa-solid fa-chevron-left"></i>
  </button>`
      : ""
  }

  <span class="current-page-display">
      ${data.page}
  </span>
    ${
      forward
        ? `<button onclick="walletData(${data.page + 1})" class="arrow-btn">
      <i class="fa-solid fa-chevron-right"></i>
  </button>`
        : ""
    }`;
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/* -------------------------
   Init
--------------------------*/

async function addMoney() {}

document.addEventListener("DOMContentLoaded", async () => {
  // Later:
  const data = await walletData();

  // Now:
  //   loadWallet(walletData);
});

/* =========================
   ADD MONEY MODAL
========================= */

const modal = document.getElementById("addMoneyModal");
const openBtn = document.getElementById("addMoneyBtn");
const closeModalBtn = document.getElementById("closeModal");

const amountInput = document.getElementById("walletAmount");
const proceedBtn = document.getElementById("proceedBtn");

const quickBtns = document.querySelectorAll(".quick-amounts button");

// Open
openBtn.addEventListener("click", () => {
  modal.classList.add("show");
  amountInput.focus();
});

// Close
closeModalBtn.addEventListener("click", closeModal);

modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

function closeModal() {
  modal.classList.remove("show");
  amountInput.value = "";
  proceedBtn.disabled = true;
}

// Quick amount
quickBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const amt = btn.dataset.amt;

    amountInput.value = amt;

    validateAmount();
  });
});

// Validate input
amountInput.addEventListener("input", validateAmount);

function validateAmount() {
  const val = Number(amountInput.value);

  if (val >= 100) {
    proceedBtn.disabled = false;
  } else {
    proceedBtn.disabled = true;
  }
}

/* =========================
   ADD MONEY (RAZORPAY + AXIOS)
========================= */

proceedBtn.addEventListener("click", async () => {
  const amount = Number(amountInput.value);

  proceedBtn.disabled = true;
  proceedBtn.innerText = "Processing...";

  try {
    /* =========================
       1. CREATE ORDER
    ========================= */

    const orderRes = await axios.post("/user/wallet/topup", { amount });

    if (orderRes.status !== 200) {
      toastr.error(orderRes.data.message);
      resetBtn();
      return;
    }

    const order = orderRes.data.data;

    /* =========================
       2. OPEN RAZORPAY
    ========================= */

    const options = {
      key: order.key,

      amount: order.amount,
      currency: order.currency,

      name: order.name,
      description: order.description,

      order_id: order.orderId,

      handler: async function (response) {
        /* =========================
           3. VERIFY PAYMENT
        ========================= */

        try {
          const verifyRes = await axios.post("/user/wallet/verify", {
            ...response,
          });

          const verifyResult = verifyRes.data;

          if (verifyRes.data.success) {
            toastr.success(verifyRes.data.message, "Credited");
            walletData();
            closeModal();
            resetBtn();
          }
        } catch (err) {
          const error = err.response?.data;
          toastr.error(error?.message || "Verification failed", "Failed");
          resetBtn();
        }
      },

      modal: {
        ondismiss: function () {
          resetBtn();
        },
      },

      theme: {
        color: "#000",
      },
    };

    new Razorpay(options).open();
  } catch (err) {
    console.log(err);
    const error = err.response?.data;

    toastr.error(error?.message || "Payment failed. Try again.", "Failed");

    resetBtn();
  }
});

/* =========================
   RESET BUTTON
========================= */

function resetBtn() {
  proceedBtn.disabled = false;
  proceedBtn.innerText = "Proceed";
}

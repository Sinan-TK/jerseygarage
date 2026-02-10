async function walletData() {
  try {
    const res = await axios.get("/user/wallet/data");

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
  document.getElementById("balance").innerText = data.balance;

  const list = document.getElementById("transactionList");

  list.innerHTML = "";

  data.transactions.forEach((item) => {
    const div = document.createElement("div");

    div.className = "transaction";

    div.innerHTML = `

      <div class="left">
        <h4>${item.title}</h4>
        <p>${item.date}</p>
      </div>

      <div class="amount ${item.type === "credit" ? "credit" : "debit"}">

        ${item.type === "credit" ? "+ ₹" + item.amount : "- ₹" + item.amount}

      </div>

    `;

    list.appendChild(div);
  });
}

/* -------------------------
   Init
--------------------------*/

document.addEventListener("DOMContentLoaded", async () => {
  // Later:
  const data = await walletData();

  // Now:
  //   loadWallet(walletData);
});

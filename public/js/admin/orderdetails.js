const updateStatus = document?.getElementById("updateStatus");
if (updateStatus) {
  updateStatus.addEventListener("click", async () => {
    const orderStatus = document.getElementById("orderStatusChange").value;
    const paymentStatus = document.getElementById("paymentStatus").value;
    const orderId = updateStatus.dataset.orderId;

    try {
      const res = await axios.patch("/admin/orders/change-status", {
        orderStatus,
        paymentStatus,
        orderId,
      });

      if (res.data.success) {
        document.getElementById("orderStatus").innerText =
          res.data.data.orderStatus;
        toastr.success(res.data.message, "Success");
      }
    } catch (err) {
      const error = err.response?.data;
      console.log(error);
      toastr.error(error?.message || "Something went wrong", "Failed");
    }
  });
}

let returnModalType = null;
let returnModalReturnId = null;

function openReturnModal(type, returnId) {
  const modal = document.getElementById("returnModal");
  const title = document.getElementById("returnModalTitle");
  const message = document.getElementById("returnModalMessage");
  const confirmBtn = document.getElementById("returnModalConfirm");

  if (type === "accept") {
    title.innerHTML = "Accept Return";
    message.innerHTML =
      "Are you sure you want to <strong>accept</strong> this return request?";
    confirmBtn.textContent = "Accept";
    confirmBtn.className = "accept";
  } else {
    title.innerHTML = "Reject Return";
    message.innerHTML =
      "Are you sure you want to <strong>reject</strong> this return request?";
    confirmBtn.textContent = "Reject";
    confirmBtn.className = "";
  }

  returnModalType = type;
  returnModalReturnId = returnId;
  modal.style.display = "flex";
}

function closeReturnModal() {
  document.getElementById("returnModal").style.display = "none";
  returnModalType = null;
  returnModalReturnId = null;
}

document
  .getElementById("returnModalConfirm")
  .addEventListener("click", function () {
    returnModalAxios(returnModalType, returnModalReturnId);
    closeReturnModal();
  });

document.querySelectorAll(".accept").forEach((btn) => {
  btn.addEventListener("click", () => {
    const returnId = btn.dataset.returnId;
    openReturnModal("accept", returnId);
  });
});

document.querySelectorAll(".reject").forEach((btn) => {
  btn.addEventListener("click", () => {
    const returnId = btn.dataset.returnId;
    openReturnModal("reject", returnId);
  });
});

async function returnModalAxios(type, returnId) {
  const tr = document.getElementById("itemCard");
  const orderId = tr.dataset.orderId;
  try {
    const res = await axios.patch("/admin/orders/return", {
      type,
      returnId,
      orderId,
    });

    toastr.success(res.data.message, "Success");
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  } catch (err) {
    const error = err.response?.data;
    console.error(error);
    toastr.error(error?.message || "Something went wrong", "error");
  }
}

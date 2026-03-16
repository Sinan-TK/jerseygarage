const btn = document.getElementById("fp-send-btn");
const emailInput = document.getElementById("fp-email");
const errEl = document.getElementById("fp-err");

function btnControl(loading) {
  btn.disabled = loading;
  btn.textContent = loading ? "Sending..." : "Send OTP";
}

function showError(msg) {
  errEl.textContent = msg;
  emailInput.classList.add("error");
}

function clearError() {
  errEl.textContent = "";
  emailInput.classList.remove("error");
}

emailInput.addEventListener("input", clearError);

btn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  btnControl(true);

  try {
    const res = await axios.post("/admin/forgot-password", { email });

    if (res.data.success) {
        toastr.success(res.data.message, "Success");
      setTimeout(() => {
        window.location.href = res.data.redirect;
      }, 1000);
    }
  } catch (err) {
    const error = err.response?.data;
    console.error(error);
    showError(error?.message || "Something went wrong");
    btnControl(false);
  }
});

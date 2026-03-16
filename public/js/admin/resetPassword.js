const RESET_URL = "/admin/reset-password";

const resetBtn = document.getElementById("resetBtn");
const btnText = document.getElementById("btnText");
const btnSpinner = document.getElementById("btnSpinner");
const alertEl = document.getElementById("alert");
const newPassEl = document.getElementById("newPassword");
const confPassEl = document.getElementById("confirmPassword");

function showAlert(msg, type) {
  alertEl.textContent = msg;
  alertEl.className = "alert show " + (type || "error");
}
function hideAlert() {
  alertEl.className = "alert";
  alertEl.textContent = "";
}

/* ── Eye toggle ── */
document.querySelectorAll(".toggle-eye").forEach((btn) => {
  btn.addEventListener("click", () => {
    const input = document.getElementById(btn.dataset.target);
    const isHidden = input.type === "password";
    input.type = isHidden ? "text" : "password";
    const svg = btn.querySelector("svg");
    svg.innerHTML = isHidden
      ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>`
      : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
  });
});

/* ── Clear error on input ── */
[newPassEl, confPassEl].forEach((el) => {
  el.addEventListener("input", () => {
    el.classList.remove("error");
    hideAlert();
  });
});

/* ── Reset button ── */
resetBtn.addEventListener("click", async () => {
  hideAlert();

  const password = newPassEl.value;
  const confirmPassword = confPassEl.value;

  resetBtn.disabled = true;
  btnText.textContent = "Resetting…";
  btnSpinner.classList.add("show");

  try {
    const res = await axios.post(RESET_URL, { password, confirmPassword });
    const data = res.data;

    showAlert(
      data.message || "Password reset successfully! Redirecting…",
      "success",
    );
    btnText.textContent = "Done ✓";
    btnSpinner.classList.remove("show");

    setTimeout(() => {
      window.location.href =
        data.redirectUrl || data.redirect || "/admin/login";
    }, 1200);
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      "Something went wrong. Please try again.";

    showAlert(msg, "error");

    if (
      msg.toLowerCase().includes("match") ||
      msg.toLowerCase().includes("confirm")
    ) {
      newPassEl.classList.add("error");
      confPassEl.classList.add("error");
    }

    resetBtn.disabled = false;
    btnText.textContent = "Reset Password";
    btnSpinner.classList.remove("show");
  }
});

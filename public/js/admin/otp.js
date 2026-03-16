/* ── Config ─────────────────────────────────────────────── */
const VERIFY_URL = "/admin/verify-otp";
const RESEND_URL = "/admin/resend-otp";
const TIMER_SECS = 30;
const TIMER_KEY = "otp_resend_ts";

/* ── DOM refs ────────────────────────────────────────────── */
const boxes = Array.from(document.querySelectorAll(".otp-box"));
const verifyBtn = document.getElementById("verifyBtn");
const btnText = document.getElementById("btnText");
const btnSpinner = document.getElementById("btnSpinner");
const resendBtn = document.getElementById("resendBtn");
const timerBadge = document.getElementById("timerBadge");
const alertEl = document.getElementById("alert");

/* ── Alert helpers ───────────────────────────────────────── */
function showAlert(msg, type) {
  alertEl.textContent = msg;
  alertEl.className = "alert show " + (type || "error");
}
function hideAlert() {
  alertEl.className = "alert";
  alertEl.textContent = "";
}

/* ── OTP helpers ─────────────────────────────────────────── */
const getOTP = () => boxes.map((b) => b.value.trim()).join("");
const setFilled = (box) =>
  box.classList.toggle("filled", box.value.trim() !== "");
const clearErrors = () => boxes.forEach((b) => b.classList.remove("error"));
const clearBoxes = () =>
  boxes.forEach((b) => {
    b.value = "";
    b.classList.remove("filled", "error");
  });

function markErrors() {
  boxes.forEach((b) => {
    b.classList.remove("error");
    void b.offsetWidth;
    b.classList.add("error");
  });
}

/* ── Timer ───────────────────────────────────────────────── */
let timerInterval = null;

function startTimer(fresh) {
  clearInterval(timerInterval);
  if (fresh) {
    try {
      sessionStorage.setItem(TIMER_KEY, Date.now().toString());
    } catch (e) {}
  }
  let saved = 0;
  try {
    saved = parseInt(sessionStorage.getItem(TIMER_KEY) || "0", 10);
  } catch (e) {}
  let remaining = TIMER_SECS - Math.floor((Date.now() - saved) / 1000);
  if (remaining <= 0) {
    enableResend();
    return;
  }
  disableResend(remaining);
  timerInterval = setInterval(() => {
    remaining--;
    if (remaining <= 0) {
      clearInterval(timerInterval);
      enableResend();
    } else timerBadge.textContent = remaining + "s";
  }, 1000);
}

function disableResend(secs) {
  resendBtn.disabled = true;
  timerBadge.textContent = secs + "s";
}
function enableResend() {
  resendBtn.disabled = false;
  timerBadge.textContent = "";
  try {
    sessionStorage.removeItem(TIMER_KEY);
  } catch (e) {}
}

/* ── Input events ────────────────────────────────────────── */
boxes.forEach((box, idx) => {
  box.addEventListener("input", (e) => {
    clearErrors();
    hideAlert();
    const val = e.target.value.replace(/\D/g, "").slice(-1);
    e.target.value = val;
    setFilled(box);
    if (val && idx < boxes.length - 1) boxes[idx + 1].focus();
    if (getOTP().length === 6) setTimeout(() => verifyBtn.click(), 80);
  });

  box.addEventListener("keydown", (e) => {
    if (e.key === "Backspace") {
      if (box.value === "" && idx > 0) {
        boxes[idx - 1].value = "";
        setFilled(boxes[idx - 1]);
        boxes[idx - 1].focus();
      } else {
        box.value = "";
        setFilled(box);
      }
      clearErrors();
      hideAlert();
    }
    if (e.key === "ArrowLeft" && idx > 0) boxes[idx - 1].focus();
    if (e.key === "ArrowRight" && idx < boxes.length - 1)
      boxes[idx + 1].focus();
  });

  box.addEventListener("paste", (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData)
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    pasted.split("").forEach((ch, i) => {
      if (boxes[i]) {
        boxes[i].value = ch;
        setFilled(boxes[i]);
      }
    });
    const next = boxes.find((b) => b.value === "");
    (next || boxes[boxes.length - 1]).focus();
    clearErrors();
    hideAlert();
    if (getOTP().length === 6) setTimeout(() => verifyBtn.click(), 80);
  });

  box.addEventListener("keypress", (e) => {
    if (!/^\d$/.test(e.key)) e.preventDefault();
  });
  box.addEventListener("focus", () => setTimeout(() => box.select(), 0));
});

/* ── Verify ──────────────────────────────────────────────── */
verifyBtn.addEventListener("click", async () => {
  const otpValue = getOTP();

  verifyBtn.disabled = true;
  btnText.textContent = "Verifying…";
  btnSpinner.classList.add("show");
  hideAlert();

  try {
    const res = await axios.post(VERIFY_URL, { otpValue });
    const data = res.data;
    showAlert(data.message || "Code verified! Redirecting…", "success");
    btnText.textContent = "Verified ✓";
    btnSpinner.classList.remove("show");
    try {
      sessionStorage.removeItem(TIMER_KEY);
    } catch (e) {}
    setTimeout(() => {
      window.location.href =
        data.redirectUrl || data.redirect || "/admin/dashboard";
    }, 1200);
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      "Invalid or expired code. Please try again.";
    showAlert(msg, "error");
    markErrors();
    clearBoxes();
    boxes[0].focus();
    verifyBtn.disabled = false;
    btnText.textContent = "Verify Code";
    btnSpinner.classList.remove("show");
  }
});

/* ── Resend ──────────────────────────────────────────────── */
resendBtn.addEventListener("click", async () => {
  hideAlert();
  resendBtn.disabled = true;

  try {
    const res = await axios.post(RESEND_URL);
    showAlert(
      res.data?.message || "A new code has been sent to your email.",
      "info",
    );
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      "Could not resend code. Please try again later.";
    showAlert(msg, "error");
  }

  clearBoxes();
  boxes[0].focus();
  startTimer(true);
});

/* ── Init ────────────────────────────────────────────────── */
(function init() {
  let saved = 0;
  try {
    saved = parseInt(sessionStorage.getItem(TIMER_KEY) || "0", 10);
  } catch (e) {}
  startTimer(saved > 0 ? false : true);
  boxes[0].focus();
})();

// ------------------------------
// GLOBAL INTERVAL HANDLES
// ------------------------------
let otpExpireInterval = null;
let resendInterval = null;

// ------------------------------
// DOM ELEMENTS (grab once)
// ------------------------------
const expireDisplay = document.getElementById("expire-timer");
const messageBox = document.getElementById("otp-expired-msg");
const otpExpire = document.getElementById("otp-expire");

const resendBtn = document.getElementById("resend-link");
const resendCount = document.getElementById("resend-count");
const resendTimerElement = document.getElementById("resend-timer");

// ------------------------------
// OTP INPUT AUTO TAB
// ------------------------------
const inputs = document.querySelectorAll(".otp-inputs input");
if (inputs && inputs.length) {
  inputs.forEach((input, index) => {
    input.addEventListener("input", () => {
      if (input.value && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !input.value && index > 0) {
        inputs[index - 1].focus();
      }
    });
  });
}

// ------------------------------
// VERIFY OTP
// ------------------------------
async function verifyOtp() {
  const otpInputs = document.querySelectorAll(
    '.otp-inputs input[type="number"]'
  );
  const errorBox = document.getElementById("otpError");
  const errorMessage = document.getElementById("otpErrorText");

  errorBox.style.display = "none";
  errorMessage.innerText = "";

  let otpValue = "";
  otpInputs.forEach((input) => {
    otpValue += input.value;
  });

  try {
    const res = await axios.post("/verify-otp", { otpValue });

    console.log(res);

    if (res.data.success) {
      toastr.success("Otp verification successfull!", "Status:");

      setTimeout(() => {
        window.location.href = res.data.redirect;
      }, 1000);
    }
  } catch (err) {
    const error = err.response?.data;

    console.log(error);

    errorBox.style.display = "flex";
    errorMessage.innerText = error?.message || "Something went wrong!";

    setTimeout(() => {
      errorBox.style.display = "none";
    }, 3000);
  }
}

// ------------------------------
// START OTP EXPIRE TIMER (uses end timestamp)
// ------------------------------
function startOtpExpireTimer(endTime) {
  if (!expireDisplay || !messageBox || !otpExpire) return;

  endTime = parseInt(endTime);

  // clear previous
  if (otpExpireInterval) {
    clearInterval(otpExpireInterval);
    otpExpireInterval = null;
  }

  // ensure UI visible
  expireDisplay.style.display = "inline-block";
  otpExpire.style.display = "block";
  messageBox.style.display = "none";

  otpExpireInterval = setInterval(() => {
    const now = Date.now();
    const diff = Math.floor((endTime - now) / 1000); // seconds left

    if (diff <= 0) {
      clearInterval(otpExpireInterval);
      otpExpireInterval = null;
      localStorage.removeItem("otp_expire_end");

      expireDisplay.style.display = "none";
      otpExpire.style.display = "none";

      messageBox.textContent =
        "Your OTP has expired. Please request a new one.";
      messageBox.style.display = "block";
      return;
    }

    const minutes = String(Math.floor(diff / 60)).padStart(2, "0");
    const seconds = String(diff % 60).padStart(2, "0");
    expireDisplay.textContent = `${minutes}:${seconds}`;
  }, 1000);
}

// ------------------------------
// START RESEND TIMER (uses end timestamp)
// ------------------------------
function startResendTimer(endTime) {
  if (!resendBtn || !resendCount || !resendTimerElement) return;

  endTime = parseInt(endTime);

  // clear previous
  if (resendInterval) {
    clearInterval(resendInterval);
    resendInterval = null;
  }

  // UI: disable button and show timer
  resendBtn.style.pointerEvents = "none";
  resendBtn.style.opacity = "0.5";
  resendTimerElement.style.display = "block";

  resendInterval = setInterval(() => {
    const now = Date.now();
    const diff = Math.floor((endTime - now) / 1000);

    if (diff <= 0) {
      clearInterval(resendInterval);
      resendInterval = null;
      localStorage.removeItem("resend_otp_end");

      // enable button & hide timer
      resendBtn.style.pointerEvents = "auto";
      resendBtn.style.opacity = "1";
      resendTimerElement.style.display = "none";
      resendCount.textContent = "0";
      return;
    }

    // show remaining seconds
    resendCount.textContent = diff;
  }, 1000);
}

// ------------------------------
// RESEND OTP (single correct function)
// ------------------------------
async function resendOtp() {
  try {
    const res = await axios.post("/resend-otp");

    if (res.data.success) {
      // create new end timestamps and persist
      const resendEnd = Date.now() + 30 * 1000; // 30s cooldown
      const otpEnd = Date.now() + 120 * 1000; // 120s expiry

      localStorage.setItem("resend_otp_end", resendEnd);
      localStorage.setItem("otp_expire_end", otpEnd);

      // restart timers safely
      startResendTimer(resendEnd);
      startOtpExpireTimer(otpEnd);

      toastr.success(res.data.message || "OTP resent", "Success");
    } else {
      toastr.error(res.data.message || "Failed to resend", "Error");
    }
  } catch (err) {
    console.error("resendOtp error:", err);
    toastr.error("Something went wrong", "Error");
  }
}

// attach event if button exists (optional — you already use onclick)
if (resendBtn) {
  resendBtn.addEventListener("click", (e) => {
    e.preventDefault?.();
    // if disabled, don't call
    if (resendBtn.style.pointerEvents === "none") return;
    resendOtp();
  });
}

// ------------------------------
// ON PAGE LOAD: resume or start timers
// ------------------------------
window.addEventListener("load", () => {
  // OTP expire
  let savedOtpEnd = localStorage.getItem("otp_expire_end");
  if (!savedOtpEnd) {
    savedOtpEnd = Date.now() + 120 * 1000;
    localStorage.setItem("otp_expire_end", savedOtpEnd);
  }
  startOtpExpireTimer(savedOtpEnd);

  // Resend timer (resume if exists)
  let savedResendEnd = localStorage.getItem("resend_otp_end");
  if (savedResendEnd) {
    const diff = Math.floor((savedResendEnd - Date.now()) / 1000);
    if (diff > 0) {
      startResendTimer(savedResendEnd);
    } else {
      localStorage.removeItem("resend_otp_end");
      // ensure UI enabled
      if (resendBtn) {
        resendBtn.style.pointerEvents = "auto";
        resendBtn.style.opacity = "1";
      }
      if (resendTimerElement) resendTimerElement.style.display = "none";
    }
  } else {
    // If there's no saved resend cooldown, start it automatically on page load if you want:
    // Comment the next three lines if you don't want resend cooldown to start automatically.
    const autoResendEnd = Date.now() + 30 * 1000;
    localStorage.setItem("resend_otp_end", autoResendEnd);
    startResendTimer(autoResendEnd);
  }
});

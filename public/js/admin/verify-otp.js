// ------------------------------
// OTP INPUT AUTO TAB
// ------------------------------
const inputs = document.querySelectorAll(".otp-input");

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

// ------------------------------
// RESEND OTP LOGIC
// ------------------------------
const resendBtn = document.getElementById("resend-link");
const resendCount = document.getElementById("resend-count");
const resendTimerElement = document.getElementById("resend-timer");

let resendSeconds = 30;

const resendInterval = setInterval(() => {
  resendSeconds--;
  resendCount.textContent = resendSeconds;

  if (resendSeconds <= 0) {
    clearInterval(resendInterval);

    // Enable resend button
    resendBtn.classList.add("enabled");
    resendBtn.style.pointerEvents = "auto";
    resendBtn.style.opacity = "1";

    // Hide timer
    resendTimerElement.style.display = "none";
  }
}, 1000);

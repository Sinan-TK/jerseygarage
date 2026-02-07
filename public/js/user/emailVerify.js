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
    const res = await axios.post("/user/email-verify", { otpValue });

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

document.querySelector(".edit-btn").addEventListener("click", () => {
  document.querySelector(".edit-btn").style.display = "none";
  document.querySelector(".edit-submit").style.display = "flex";
  document.querySelector(".edit-cancel").style.display = "flex";

  const fullNameP = document.getElementById("full_name");
  const fullName = fullNameP.textContent.trim();

  const emailP = document.getElementById("email");
  const email = emailP.textContent.trim();

  const phoneNoP = document.getElementById("phone_no");
  const phoneNo = phoneNoP.textContent.trim();

  const inputName = document.createElement("input");
  inputName.type = "text";
  inputName.value = fullName;
  fullNameP.replaceWith(inputName);
  inputName.className = "edit-input";
  inputName.id = "fullName";

  const inputMail = document.createElement("input");
  inputMail.type = "text";
  inputMail.value = email;
  emailP.replaceWith(inputMail);
  inputMail.className = "edit-input";
  inputMail.id = "email";

  const inputPhone = document.createElement("input");
  inputPhone.type = "number";
  inputPhone.value = phoneNo;
  phoneNoP.replaceWith(inputPhone);
  inputPhone.className = "edit-input";
  inputPhone.id = "phoneNo";
});

async function editSubmit() {
  const inputs = document.querySelectorAll(".edit-input");

  let values = {};

  inputs.forEach((input) => {
    values[input.id] = input.value.trim();
  });
  try {
    const res = await axios.patch("/user/profile/edit", values);

    if (res.data.success) {
      if (res.data.message === "Email change") {
        toastr.success("Otp verification needed!!", res.data.message);

        openOtpModal();
      } else {
        toastr.success(res.data.message, "Edited");

        document.querySelector(".edit-btn").style.display = "flex";
        document.querySelector(".edit-submit").style.display = "none";
        document.querySelector(".edit-cancel").style.display = "none";

        const editedData = res.data.data;

        const inputName = document.getElementById("fullName");
        const fullNameP = document.createElement("p");
        fullNameP.id = "full_name";
        fullNameP.innerText = editedData.full_name;
        inputName.replaceWith(fullNameP);

        const inputMail = document.getElementById("email");
        const emailP = document.createElement("p");
        emailP.id = "email";
        emailP.innerText = editedData.email;
        inputMail.replaceWith(emailP);

        const inputPhone = document.getElementById("phoneNo");
        const phoneNoP = document.createElement("p");
        phoneNoP.id = "phone_no";
        phoneNoP.innerText = editedData.phone_no;
        inputPhone.replaceWith(phoneNoP);
      }
    }
  } catch (err) {
    const error = err.response?.data;

    console.log(error);

    toastr.error(error?.message || "Something went wrong!!", "Failed");
  }
}

const otpInputs = document.querySelectorAll(".otp-inputs input");

/* Open modal */
function openOtpModal() {
  document.getElementById("otpModal").classList.add("active");
  otpInputs[0].focus();
}

/* Close modal */
function closeOtpModal() {
  document.getElementById("otpModal").classList.remove("active");
}

/* OTP input behavior */
otpInputs.forEach((input, index) => {
  input.addEventListener("input", () => {
    if (!/^\d$/.test(input.value)) {
      input.value = "";
      return;
    }

    if (input.value && otpInputs[index + 1]) {
      otpInputs[index + 1].focus();
    }
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && !input.value && otpInputs[index - 1]) {
      otpInputs[index - 1].focus();
    }
  });
});

/* Paste OTP */
otpInputs[0].addEventListener("paste", (e) => {
  const paste = e.clipboardData.getData("text").slice(0, 6);
  [...paste].forEach((char, i) => {
    if (otpInputs[i]) otpInputs[i].value = char;
  });
  otpInputs[5]?.focus();
});

/* Submit OTP */
async function submitOtp(e) {
  e.preventDefault();

  let otp = "";
  otpInputs.forEach((input) => (otp += input.value));

  console.log("OTP:", otp);

  try {
    const res = await axios.post("/user/profile/mail", { otp });
  } catch (err) {
    console.log(err);
  }
}

/* =========================
   OPEN / CLOSE
========================= */

function openPasswordModal() {
  document.getElementById("passwordModal").style.display = "flex";
}

function closePasswordModal() {
  document.getElementById("passwordModal").style.display = "none";

  // Reset form
  document.getElementById("passwordForm").reset();
}

/* =========================
   SUBMIT HANDLER
========================= */

document
  .getElementById("passwordForm")
  ?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const currentPassword = document.getElementById("currentPassword").value;

    const newPassword = document.getElementById("newPassword").value;

    const confirmPassword = document.getElementById("confirmPassword").value;

    /* ===== VALIDATION ===== */

    // if (newPassword.length < 6) {
    //   alert("Password must be at least 6 characters");
    //   return;
    // }

    // if (newPassword !== confirmPassword) {
    //   alert("Passwords do not match");
    //   return;
    // }

    /* ===== PAYLOAD ===== */

    const payload = {
      currentPassword,
      newPassword,
      confirmPassword,
    };

    console.log(payload);

    try {
      const res = await axios.patch("/user/profile/change-password", payload);

      if (res.data.success) {
        toastr.success(res.data.message || "Password updated", "success");
        closePasswordModal();
      }
    } catch (err) {
      const error = err.response?.data;

      if (error?.message) {
        const errorBox = document.querySelector(".error-box");
        errorBox.style.display = "flex";
        const errorTxt = document.querySelector(".error-text-password");
        errorTxt.innerText = error.message;

        setTimeout(() => {
          errorBox.style.display = "none";
        }, 2000);
      } else {
        toastr.error("Failed to update password", "error");
      }
    }
  });

/* =========================
   CLOSE ON OUTSIDE CLICK
========================= */

document.getElementById("passwordModal")?.addEventListener("click", (e) => {
  if (e.target.id === "passwordModal") {
    closePasswordModal();
  }
});

document.querySelectorAll(".toggle-password").forEach((icon) => {
  icon.addEventListener("click", () => {
    const input = document.getElementById(icon.getAttribute("data-target"));

    if (input.type === "password") {
      input.type = "text";
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    } else {
      input.type = "password";
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
    }
  });
});

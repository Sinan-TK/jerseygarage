document.querySelector(".edit-btn").addEventListener("click", () => {
  console.log("working");
  document.querySelector(".edit-btn").style.display = "none";
  document.querySelector(".edit-submit").style.display = "flex";
  document.querySelector(".edit-cancel").style.display = "flex";

  const fullNameP = document.getElementById("full_name");
  const fullName = fullNameP.textContent.trim();

  const emailP = document.getElementById("email");
  const email = emailP.textContent.trim();

  const phoneNoP = document.getElementById("phone_no");
  const phoneNo = phoneNoP.textContent.trim();

  console.log(fullName, email, phoneNo);

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
      }
    }
  } catch (err) {
    const error = err.response?.data;

    console.log(error);

    toastr.error(error.message, "Failed");
  }
}

///////////////////////////

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

async function getMail() {
  btnControl(true)
  const email = document.getElementById("email").value.trim();
  const errorBox = document.getElementById("signUpError");
  const errorMessage = document.getElementById("signUpErrorText");

  errorBox.style.display = "none";
  errorMessage.innerText = "";

  try {
    const res = await axios.post("/forgotpassword", { email });

    if (res.data.success) {
      toastr.success(res.data.message, "Success");

      setTimeout(() => {
        window.location.href = res.data.redirect;
      }, 800);
    }
  } catch (err) {
    btnControl(false)
    const error = err.response?.data;
    console.log(error);
    errorBox.style.display = "flex";
    errorMessage.innerText = error.message || "Something went wrong.";
  }
}

function btnControl(state) {
  const btn = document.getElementById("confirmBtn");
  btn.disabled = state;
  btn.innerText = state ? "Sending..." : "Send OTP";
}

document.querySelectorAll("input").forEach((input) => {
  input.addEventListener("input", () => {
    document.getElementById("signUpError").style.display = "none";
  });
});
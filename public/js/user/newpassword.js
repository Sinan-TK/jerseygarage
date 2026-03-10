async function newPass() {
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;
  const errorBox = document.getElementById("error-box");
  const errorText = document.getElementById("errorText");
  btnControl(true);

  try {
    const res = await axios.post("/newpassword", { password, confirmPassword });

    if (res.data.success) {
      toastr.success(res.data.message, "Success");

      setTimeout(() => {
        window.location.href = res.data.redirect;
      }, 3000);
    }
  } catch (err) {
    btnControl(false);
    const error = err.response?.data;
    console.log(error);
    errorBox.style.display = "flex";
    errorText.innerText = error?.message || "Something went wrong!";
  }
}

function btnControl(state) {
  const btn = document.querySelector(".confirm-btn");
  btn.disabled = state;
  btn.innerText = state ? "Confirming..." : "Confirm";
}

document.querySelectorAll("input").forEach((input) => {
  input.addEventListener("input", () => {
    document.getElementById("error-box").style.display = "none";
  });
});

const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");

togglePassword.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";

  passwordInput.type = isPassword ? "text" : "password";
  togglePassword.classList.toggle("fa-eye");
  togglePassword.classList.toggle("fa-eye-slash");
});

const confirmPasswordInput = document.getElementById("confirm-password");
const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");

toggleConfirmPassword.addEventListener("click", () => {
  const isPassword = confirmPasswordInput.type === "password";

  confirmPasswordInput.type = isPassword ? "text" : "password";
  toggleConfirmPassword.classList.toggle("fa-eye");
  toggleConfirmPassword.classList.toggle("fa-eye-slash");
});

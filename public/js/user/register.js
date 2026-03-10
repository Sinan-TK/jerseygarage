async function registerData() {
  btnControl(true);

  const email = document.getElementById("email").value.trim();
  const fullName = document.getElementById("fullname").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document
    .getElementById("confirm-password")
    .value.trim();
  const referralCode =
    document.getElementById("referralCcode").value.trim() || "";

  const errorBox = document.getElementById("registerError");
  const errorText = document.getElementById("registerErrorText");

  try {
    const res = await axios.post("/signup", {
      email,
      fullName,
      password,
      confirmPassword,
      referralCode,
    });

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
    errorText.innerText = error.message || "Something went wrong!";
  }
}

document.querySelectorAll("input").forEach((input) => {
  input.addEventListener("input", () => {
    document.getElementById("registerError").style.display = "none";
  });
});

function btnControl(state) {
  const btn = document.querySelector(".register-btn");
  btn.disabled = state;
  btn.innerText = state ? "Signing up..." : "Sign Up";
}

const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");

togglePassword.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";

  passwordInput.type = isPassword ? "text" : "password";
  togglePassword.classList.toggle("fa-eye");
  togglePassword.classList.toggle("fa-eye-slash");
});

const confirmPasswordInput = document.getElementById("confirm-password");
const confirmTogglePassword = document.getElementById("confirmTogglePassword");

confirmTogglePassword.addEventListener("click", () => {
  const isPassword = confirmPasswordInput.type === "password";

  confirmPasswordInput.type = isPassword ? "text" : "password";
  confirmTogglePassword.classList.toggle("fa-eye");
  confirmTogglePassword.classList.toggle("fa-eye-slash");
});

const params = new URLSearchParams(window.location.search);

const ref = params.get("ref");

document.getElementById("referralCcode").value = ref;

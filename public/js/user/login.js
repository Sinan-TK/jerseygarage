async function loginUser() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorBox = document.getElementById("loginError");
  const errorText = document.getElementById("loginErrorText");
  btnControl(true);

  try {
    const res = await axios.post("/login", { email, password });

    if (res.data.success) {
      toastr.success(res.data.message, "Welcome");

      setTimeout(() => {
        if (res.data.redirect) {
          window.location.href = res.data.redirect;
        }
      }, 500);
    }
  } catch (err) {
    const error = err.response?.data;
    console.error(error);
    errorBox.style.display = "flex";
    errorText.innerText = error?.message || "Something went wrong.";
    btnControl(false);
  }
}

document.querySelectorAll("input").forEach((input) => {
  input.addEventListener("input", () => {
    document.getElementById("loginError").style.display = "none";
  });
});

const params = new URLSearchParams(window.location.search);
const isBlocked = params.get("blocked");

if (isBlocked === "true") {
  toastr.error("Your account has been blocked!", "Blocked");
}

const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");

togglePassword.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";

  passwordInput.type = isPassword ? "text" : "password";
  togglePassword.classList.toggle("fa-eye");
  togglePassword.classList.toggle("fa-eye-slash");
});

function btnControl(state) {
  const btn = document.querySelector(".login-btn");
  btn.disabled = state;
  btn.innerText = state ? "Logging in..." : "Login";
}

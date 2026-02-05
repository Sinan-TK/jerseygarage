async function loginUser() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorBox = document.getElementById("loginError");
  const errorText = document.getElementById("loginErrorText");

  try {
    const res = await axios.post("/login", { email, password });

    if (res.data.success) {
      toastr.success("Login successful!", "Welcome");

      setTimeout(() => {
        if (res.data.redirect) {
          window.location.href = res.data.redirect;
        }
      }, 500);
    }
  } catch (err) {
    const error = err.response?.data;

    console.log(error);

    errorBox.style.display = "flex";
    errorText.innerText = error?.message || "Something went wrong.";

    setTimeout(() => {
      errorBox.style.display = "none";
      errorText.innerHTML = "";
    }, 3000);
  }
}

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

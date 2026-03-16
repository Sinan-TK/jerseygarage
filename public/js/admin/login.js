async function loginVerification() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("pw").value.trim();
  const errorBox = document.getElementById("loginError");
  const errorText = document.getElementById("loginErrorText");
  btnControl(true);
  try {
    const res = await axios.post("/admin/login", { email, password });

    // SUCCESS
    if (res.data.success) {
      toastr.success(res.data.message, "Welcome");

      setTimeout(() => {
        if (res.data.redirect) {
          window.location.href = res.data.redirect;
        }
      }, 2000);
    }
  } catch (err) {
    btnControl(false);
    // Axios always puts failed validation inside err.response
    const error = err.response?.data;

    console.log("AXIOS ERROR:", error);

    errorBox.style.display = "flex";
    errorText.innerText = error?.message || "Something went wrong.";

    document.querySelectorAll("input").forEach((input) => {
      input.addEventListener("input", () => {
        if (errorBox) errorBox.style.display = "none";
      });
    });
  }
}

const pwInput = document.getElementById("pw");
const togglePw = document.getElementById("togglePw");

togglePw.addEventListener("click", () => {
  const isPassword = pwInput.type === "password";

  pwInput.type = isPassword ? "text" : "password";
  togglePw.classList.toggle("fa-eye");
  togglePw.classList.toggle("fa-eye-slash");
});

function btnControl(loading) {
  const btn = document.getElementById("login-btn");
  btn.disabled = loading;
  btn.innerText = loading ? "Signing in..." : "Sign In";
}

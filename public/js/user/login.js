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
      }, 2000);
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

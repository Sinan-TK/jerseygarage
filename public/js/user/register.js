async function registerData() {
  const fullName = document.getElementById("fullname").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document
    .getElementById("confirm-password")
    .value.trim();
  const errorBox = document.getElementById("registerError");
  const errorText = document.getElementById("registerErrorText");

  console.log(fullName, password, confirmPassword);

  try {
    const res = await axios.post("/register", {
      fullName,
      password,
      confirmPassword,
    });

    if (res.data.success) {
      toastr.success(res.data.message, "Success");

      setTimeout(() => {
        window.location.href = res.data.redirect;
      }, 3000);
    }
  } catch (err) {
    const error = err.response?.data;

    console.log(error);

    errorBox.style.display = "flex";
    errorText.innerText = error.message || "Something went wrong!";
  }
}

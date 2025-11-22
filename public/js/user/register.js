async function registerData() {
  const fullName = document.getElementById("fullname").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document
    .getElementById("confirm-password")
    .value.trim();
  const errorBox = document.getElementById("registerError");
  const errorText = document.getElementById("registerErrorText");

  console.log(fullName,password,confirmPassword);
  

  try {
    const res = await axios.post("/register", {
      fullName,
      password,
      confirmPassword,
    });

    if (res.data.success) {
        toastr.success(res.data.message, "Success");

        setTimeout(() => {
          window.location.href = "/login"
        }, 3000);

    } else {
      if (res.data.toast) {
        toastr.error(res.data.message, "Failed");
      } else {
        if (errorBox) errorBox.style.display = "flex";
        if (errorText) errorText.innerText = res.data.message;

        setTimeout(() => {
          if (errorBox) errorBox.style.display = "none";
        }, 3000);
      }
    }
  } catch (err) {
    errorBox.style.display = "flex";
    errorText.innerText = "Something went wrong!";
  }
}

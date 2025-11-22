async function loginVerification() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("pw").value.trim();
  const errorBox = document.getElementById("loginError");
  const errorText = document.getElementById("loginErrorText");

  console.log(email, password);

  try {
    const res = await axios.post("/admin/login", { email, password });

    if (res.data.success) {
      toastr.success(res.data.message, "Welcome");

      setTimeout(() => {
        window.location.href = "/admin/dashboard";
      }, 1000);
    } else {
      errorBox.style.display = "flex";
      errorText.innerText = res.data.message;

      setTimeout(() => {
        errorBox.style.display = "none";
        errorText.innerHTML = "";
      }, 3000);

    }
  } catch (err) {
    console.log(err);
    errorBox.style.display = "flex";
    errorText.innerText = "Something went wrong.";
  }
}

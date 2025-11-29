async function loginVerification() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("pw").value.trim();
  const errorBox = document.getElementById("loginError");
  const errorText = document.getElementById("loginErrorText");

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
    // Axios always puts failed validation inside err.response
    const error = err.response?.data;

    console.log("AXIOS ERROR:", error);

    errorBox.style.display = "flex";
    errorText.innerText = error?.message || "Something went wrong.";

    setTimeout(() => {
      errorBox.style.display = "none";
      errorText.innerHTML = "";
    }, 3000);
  }
}

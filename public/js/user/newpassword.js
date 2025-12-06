async function newPass() {
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;
  const errorBox = document.getElementById("error-box");
  const errorText = document.getElementById("errorText");

  try {
    const res = await axios.post("/newpassword", { password, confirmPassword });

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
    errorText.innerText = error?.message || "Something went wrong!";
  }
}

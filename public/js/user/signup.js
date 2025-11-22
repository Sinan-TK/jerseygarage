async function getMail() {
  const email = document.getElementById("email").value.trim();
  const errorBox = document.getElementById("signUpError");
  const errorMessage = document.getElementById("signUpErrorText");

  errorBox.style.display = "none";
  errorMessage.innerText = "";

  try {
    const res = await axios.post("/signup", { email });

    if (res.data.success) {
      toastr.success("Success", res.data.message);

      setTimeout(() => {
        window.location.href = "/verify-otp";
      }, 1000);
    } else {
      errorBox.style.display = "flex";
      errorMessage.innerText = res.data.message;
    }
  } catch (err) {
    errorBox.style.display = "flex";
    errorMessage.innerText = "Something went wrong.";
  }
}

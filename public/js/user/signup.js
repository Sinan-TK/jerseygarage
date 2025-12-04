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
        if (res.data.redirect) {
          window.location.href = res.data.redirect;
        }
      }, 3000);
    }
  } catch (err) {
    const error = err.response?.data;

    console.log(error);

    errorBox.style.display = "flex";
    errorMessage.innerText = error?.message || "Something went wrong.";

    setTimeout(() => {
      errorBox.style.display = "none";
      errorMessage.innerText = "";
    }, 3000);
  }
}

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
        window.location.href = "/";
      }, 800);
    } else {
      errorBox.style.display = "flex";
      errorText.innerText = res.data.message;
    }
  } catch (err) {
    errorBox.style.display = "flex";
    errorText.innerText = "Something went wrong.";
  }
}

function handleSubmit() {
  const btn = document.getElementById("submitBtn");
  const fields = ["firstName", "email", "subject", "message"];
  for (const id of fields) {
    if (!document.getElementById(id).value.trim()) {
      showToast("Please fill in all required fields.");
      return;
    }
  }
  btn.disabled = true;
  btn.innerText = "SENDING...";
  setTimeout(() => {
    btn.disabled = false;
    btn.innerText = "SEND MESSAGE";
    showToast("✓ Message sent! We'll be in touch soon.");
  }, 1500);
}

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3500);
}

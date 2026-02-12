/* =========================
   REFERRAL PAGE JS
========================= */

const copyBtn = document.getElementById("copyBtn");
const shareBtn = document.getElementById("shareBtn");
const codeInput = document.getElementById("referralCode");

/* Copy Code */

copyBtn.addEventListener("click", () => {
  codeInput.select();
  document.execCommand("copy");

  copyBtn.innerHTML = "<i class='fa-solid fa-copy'></i>";

  setTimeout(() => {
    copyBtn.innerHTML = "<i class='fa-regular fa-copy'>";
  }, 1500);
});

/* Share Link */

shareBtn.addEventListener("click", () => {
  const code = codeInput.value;

  const link = `${window.location.origin}/signup?ref=${code}`;

  navigator.clipboard.writeText(link);

  toastr.success("Referral link copied!");
});

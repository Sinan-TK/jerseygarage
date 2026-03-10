function toggleAcc(btn) {
  const item = btn.closest(".acc-item");
  const body = item.querySelector(".acc-body");
  const inner = item.querySelector(".acc-body-inner");
  const isOpen = item.classList.contains("open");

  // Close all
  document.querySelectorAll(".acc-item.open").forEach((i) => {
    i.classList.remove("open");
    i.querySelector(".acc-body").style.maxHeight = "0";
  });

  if (!isOpen) {
    item.classList.add("open");
    body.style.maxHeight = inner.scrollHeight + 32 + "px";
  }
}

function filterCategory(cat, btn) {
  document
    .querySelectorAll(".cat-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");

  document.getElementById("searchInput").value = "";
  document.getElementById("noResults").style.display = "none";

  document.querySelectorAll(".faq-section").forEach((sec) => {
    if (cat === "all" || sec.dataset.category === cat) {
      sec.removeAttribute("data-hidden");
    } else {
      sec.setAttribute("data-hidden", "true");
    }
  });

  // reset all items
  document
    .querySelectorAll(".acc-item")
    .forEach((i) => i.removeAttribute("data-hidden"));
}

function handleSearch() {
  const q = document.getElementById("searchInput").value.toLowerCase().trim();

  // reset category filter
  document
    .querySelectorAll(".cat-btn")
    .forEach((b) => b.classList.remove("active"));
  document.querySelector(".cat-btn").classList.add("active");
  document
    .querySelectorAll(".faq-section")
    .forEach((s) => s.removeAttribute("data-hidden"));

  if (!q) {
    document
      .querySelectorAll(".acc-item")
      .forEach((i) => i.removeAttribute("data-hidden"));
    document.getElementById("noResults").style.display = "none";
    return;
  }

  let anyVisible = false;

  document.querySelectorAll(".faq-section").forEach((sec) => {
    let secHasMatch = false;
    sec.querySelectorAll(".acc-item").forEach((item) => {
      const text =
        (item.dataset.text || "") +
        " " +
        item.querySelector(".acc-trigger span").textContent.toLowerCase() +
        " " +
        item.querySelector(".acc-body-inner").textContent.toLowerCase();
      if (text.includes(q)) {
        item.removeAttribute("data-hidden");
        secHasMatch = true;
        anyVisible = true;
      } else {
        item.setAttribute("data-hidden", "true");
      }
    });
    if (!secHasMatch) sec.setAttribute("data-hidden", "true");
    else sec.removeAttribute("data-hidden");
  });

  document.getElementById("noResults").style.display = anyVisible
    ? "none"
    : "block";
}

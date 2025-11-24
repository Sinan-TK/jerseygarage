/* ROW DROPDOWN */
document.querySelectorAll(".row-arrow").forEach(arrow => {
  arrow.addEventListener("click", () => {
    const id = arrow.dataset.id;
    const panel = document.getElementById(`drop-${id}`);

    // Close others
    document.querySelectorAll(".dropdown-row").forEach(p => {
      if (p !== panel) p.style.display = "none";
    });

    document.querySelectorAll(".row-arrow").forEach(a => {
      if (a !== arrow) a.classList.remove("open");
    });

    // Toggle
    const open = panel.style.display === "table-row";
    panel.style.display = open ? "none" : "table-row";
    arrow.classList.toggle("open", !open);
  });
});


/* STATUS DROPDOWN */
const dd = document.getElementById("statusDropdown");

dd.addEventListener("click", () => {
  dd.querySelector(".dropdown-options").classList.toggle("show-options");
});


document.querySelectorAll(".dropdown-options li").forEach(item => {
  item.addEventListener("click", () => {
    dd.querySelector(".dropdown-selected").textContent = item.textContent;
    dd.dataset.value = item.dataset.value;
  });
});


/* APPLY FILTER */
document.getElementById("applyFilter").addEventListener("click", () => {
  const search = document.getElementById("searchInput").value.toLowerCase();
  const status = dd.dataset.value || "all";

  document.querySelectorAll(".product-row").forEach(row => {
    const matchesSearch = row.dataset.name.includes(search);
    const matchesStatus = status === "all" || row.dataset.status === status;

    row.style.display = matchesSearch && matchesStatus ? "table-row" : "none";
    document.getElementById(`drop-${row.dataset.id}`).style.display = "none";
  });
});


/* CLEAR FILTER */
document.getElementById("clearFilter").addEventListener("click", () => {
  document.getElementById("searchInput").value = "";
  dd.dataset.value = "all";
  dd.querySelector(".dropdown-selected").textContent = "All Products";

  document.querySelectorAll(".product-row").forEach(row => {
    row.style.display = "table-row";
    document.getElementById(`drop-${row.dataset.id}`).style.display = "none";
  });
});

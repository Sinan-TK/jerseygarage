let allProducts = [];

async function loadProducts() {
  try {
    const res = await axios.get("/admin/sales-report/products");
    allProducts = res.data.data;
  } catch (err) {
    const error = err.response?.data;
    console.error("Failed to load products", error);
  }
}

let filteredData = [];
let currentPage = 1;
let totalPages = 1;
let totalItems = 0;
let activeFilter = "all";

function setQuickFilter(type, btn) {
  activeFilter = type;
  document
    .querySelectorAll(".qf-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  const show = type === "custom";
  document.getElementById("customDateGroup").style.display = show
    ? "flex"
    : "none";
  document.getElementById("customDateGroup2").style.display = show
    ? "flex"
    : "none";
}

function onProductInput(input) {
  const val = input.value.trim();
  document.getElementById("clearProduct").style.display = val
    ? "block"
    : "none";
  showSuggestions(val);
}

function showSuggestions(query) {
  const dropdown = document.getElementById("suggestionsDropdown");
  if (!query) {
    dropdown.style.display = "none";
    return;
  }

  const matches = allProducts.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()),
  );

  if (!matches.length) {
    dropdown.innerHTML = `<div class="suggestion-empty"><i class="fa-solid fa-magnifying-glass"></i> No products found</div>`;
  } else {
    dropdown.innerHTML = matches
      .map((p) => {
        const highlighted = p.name.replace(
          new RegExp(`(${query})`, "gi"),
          "<mark>$1</mark>",
        );
        return `<div class="suggestion-item" onclick="selectProduct('${p.name}', '${p._id}')">
        <i class="fa-solid fa-box"></i> ${highlighted}
      </div>`;
      })
      .join("");
  }
  dropdown.style.display = "block";
}

function selectProduct(name, id) {
  document.getElementById("productSearch").value = name;
  document.getElementById("productSearch").dataset.id = id;
  document.getElementById("clearProduct").style.display = "block";
  document.getElementById("suggestionsDropdown").style.display = "none";
  applyFilters();
}

document.addEventListener("click", function (e) {
  if (!e.target.closest(".product-search-group")) {
    document.getElementById("suggestionsDropdown").style.display = "none";
  }
});

function clearAllFilters() {
  activeFilter = "all";
  document
    .querySelectorAll(".qf-btn")
    .forEach((b) => b.classList.remove("active"));
  document.querySelector(".qf-btn").classList.add("active");
  document.getElementById("customDateGroup").style.display = "none";
  document.getElementById("customDateGroup2").style.display = "none";
  document.getElementById("fromDate").value = "";
  document.getElementById("toDate").value = "";
  document.getElementById("paymentFilter").value = "";
  document.getElementById("statusFilter").value = "";
  clearProduct();
}

function clearProduct() {
  document.getElementById("productSearch").value = "";
  document.getElementById("productSearch").dataset.id = "";
  document.getElementById("clearProduct").style.display = "none";
  document.getElementById("productTag").style.display = "none";
  document.getElementById("productFilterBadge").style.display = "none";
  applyFilters();
}

function buildParams() {
  const now = new Date();
  let from = null,
    to = new Date();

  if (activeFilter === "1day") {
    from = new Date();
    from.setHours(0, 0, 0, 0);
  } else if (activeFilter === "1week") {
    from = new Date();
    from.setDate(now.getDate() - 7);
  } else if (activeFilter === "1month") {
    from = new Date();
    from.setMonth(now.getMonth() - 1);
  } else if (activeFilter === "1year") {
    from = new Date();
    from.setFullYear(now.getFullYear() - 1);
  } else if (activeFilter === "custom") {
    from = new Date(document.getElementById("fromDate").value);
    to = new Date(document.getElementById("toDate").value);
  }

  return {
    filter: activeFilter,
    from: from ? from.toISOString() : "",
    to: to.toISOString(),
    paymentStatus: document.getElementById("paymentFilter").value,
    orderStatus: document.getElementById("statusFilter").value,
    productId: document.getElementById("productSearch").dataset.id || "",
  };
}

async function applyFilters(page = 1) {
  const params = buildParams();
  const productQuery = document.getElementById("productSearch").value.trim();

  if (productQuery) {
    document.getElementById("productTagText").textContent = productQuery;
    document.getElementById("productTag").style.display = "block";
    const badge = document.getElementById("productFilterBadge");
    badge.textContent = `Product: ${productQuery}`;
    badge.style.display = "inline-block";
  } else {
    document.getElementById("productTag").style.display = "none";
    document.getElementById("productFilterBadge").style.display = "none";
  }

  try {
    const res = await axios.get("/admin/sales-report/data", {
      params: { ...params, page },
    });

    const data = res.data.data;
    console.log(data);

    filteredData = data.orders;
    console.log(1);
    currentPage = data.pagination.currentPage;
    console.log(2);
    totalPages = data.pagination.totalPages;
    console.log(3);
    totalItems = data.pagination.totalItems;
    console.log(4);

    renderStats(data.summary);
    renderTable();
    renderPagination();
  } catch (err) {
    const error = err.response?.data;
    console.error(error);
    toastr.error(error?.message || "Something went wrong", "Error");
  }
}

function renderStats(summary) {
  document.getElementById("totalOrders").textContent = summary.totalOrders;
  document.getElementById("totalRevenue").textContent =
    `₹${summary.totalRevenue.toFixed(2)}`;
  document.getElementById("totalDiscount").textContent =
    `₹${summary.totalDiscount.toFixed(2)}`;
  document.getElementById("totalRefunds").textContent =
    `₹${summary.totalRefunds.toFixed(2)}`;
  document.getElementById("totalGST").textContent =
    `₹${summary.totalGST.toFixed(2)}`;
}

function renderTable() {
  const tbody = document.getElementById("reportBody");

  if (!filteredData.length) {
    tbody.innerHTML = `<tr><td colspan="11"><div class="empty-state"><i class="fa-solid fa-inbox"></i>No orders found for selected filters</div></td></tr>`;
    document.getElementById("paginationBar").style.display = "none";
    return;
  }

  tbody.innerHTML = filteredData
    .map(
      (o) => `
    <tr>
      <td class="order-id">${o.orderId}</td>
      <td class="text-muted">${o.date}</td>
      <td>${o.customer}</td>
      <td>${o.items}</td>
      <td>₹${o.subtotal.toFixed(2)}</td>
      <td class="text-red">${o.discount > 0 ? `-₹${o.discount.toFixed(2)}` : '<span class="text-muted">—</span>'}</td>
      <td class="text-red">${o.coupon > 0 ? `-₹${o.coupon.toFixed(2)}` : '<span class="text-muted">—</span>'}</td>
      <td>₹${o.gst.toFixed(2)}</td>
      <td><strong>₹${o.total.toFixed(2)}</strong></td>
      <td>${payBadge(o.payment)}</td>
      <td>${statusBadge(o.status)}</td>
    </tr>
  `,
    )
    .join("");

  renderPagination();
}

function payBadge(p) {
  const map = { Paid: "green", Pending: "yellow", Refunded: "blue" };
  return `<span class="badge badge-${map[p] || "red"}">${p}</span>`;
}

function statusBadge(s) {
  const map = {
    Delivered: "green",
    Shipped: "blue",
    Confirmed: "yellow",
    Cancelled: "red",
    Returned: "red",
  };
  return `<span class="badge badge-${map[s] || "blue"}">${s}</span>`;
}

function renderPagination() {
  if (totalPages <= 1) {
    document.getElementById("paginationBar").style.display = "none";
    return;
  }

  const start = (currentPage - 1) * 5 + 1;
  const end = Math.min(currentPage * 5, totalItems);

  document.getElementById("paginationInfo").textContent =
    `Showing ${start}–${end} of ${totalItems} results`;
  document.getElementById("paginationBar").style.display = "flex";

  const btns = document.getElementById("pageButtons");
  btns.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const b = document.createElement("button");
    b.className = "page-btn" + (i === currentPage ? " active" : "");
    b.textContent = i;
    b.onclick = () => applyFilters(i);
    btns.appendChild(b);
  }
}

function downloadExcel() {
  const params = buildParams();
  window.location.href = `/admin/sales-report/download/excel?${new URLSearchParams(params)}`;
}

function downloadPDF() {
  const params = buildParams();
  window.location.href = `/admin/sales-report/download/pdf?${new URLSearchParams(params)}`;
}

loadProducts().then(() => applyFilters());

/* ==============================
      Dummy Coupon Data
  ============================== */

let coupons = [
  {
    _id: "1",
    code: "NEWUSER10",
    discountType: "percentage",
    discountValue: 10,
    minPurchaseAmount: 1000,
    expiryDate: "2026-03-30",
    isActive: true,
  },
  {
    _id: "2",
    code: "FLAT500",
    discountType: "fixed",
    discountValue: 500,
    minPurchaseAmount: 3000,
    expiryDate: "2026-02-28",
    isActive: false,
  },
  {
    _id: "3",
    code: "SALE50",
    discountType: "percentage",
    discountValue: 50,
    minPurchaseAmount: 2000,
    expiryDate: "2026-04-10",
    isActive: true,
  },
];

/* ==============================
      Render Coupons
  ============================== */

function renderCoupons(data) {
  const tableBody = document.getElementById("couponTableBody");
  tableBody.innerHTML = "";

  if (data.length === 0) {
    tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-4 text-muted">
            No coupons found
          </td>
        </tr>
      `;
    return;
  }

  data.forEach((coupon) => {
    const discountDisplay =
      coupon.discountType === "percentage"
        ? `${coupon.discountValue}% OFF`
        : `₹${coupon.discountValue} OFF`;

    const typeBadge =
      coupon.discountType === "percentage"
        ? `<span class="badge bg-primary">Percentage</span>`
        : `<span class="badge bg-warning text-dark">Fixed</span>`;

    const statusBadge = coupon.isActive
      ? `<span class="badge bg-success">Active</span>`
      : `<span class="badge bg-danger">Inactive</span>`;

    tableBody.innerHTML += `
        <tr>
          <td class="fw-semibold">${coupon.code}</td>
          <td>${typeBadge}</td>
          <td><span class="badge bg-info text-dark">${discountDisplay}</span></td>
          <td>₹${coupon.minPurchaseAmount}</td>
          <td>${new Date(coupon.expiryDate).toDateString()}</td>
          <td>${statusBadge}</td>
          <td class="text-center">
            <button class="btn btn-sm btn-outline-primary">Edit</button>
            <button class="btn btn-sm btn-outline-warning" onclick="toggleStatus('${coupon._id}')">Toggle</button>
            <button class="btn btn-sm btn-outline-danger">Delete</button>
          </td>
        </tr>
      `;
  });
}

/* ==============================
      Filters
  ============================== */

function applyFilters() {
  const searchValue = document
    .getElementById("searchInput")
    .value.toLowerCase();
  const statusValue = document.getElementById("statusFilter").value;

  let filtered = coupons.filter((coupon) => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchValue);
    const matchesStatus =
      statusValue === "" ? true : coupon.isActive.toString() === statusValue;

    return matchesSearch && matchesStatus;
  });

  renderCoupons(filtered);
}

function resetFilters() {
  document.getElementById("searchInput").value = "";
  document.getElementById("statusFilter").value = "";
  renderCoupons(coupons);
}

/* ==============================
      Toggle Status
  ============================== */

function toggleStatus(id) {
  coupons = coupons.map((coupon) => {
    if (coupon._id === id) {
      coupon.isActive = !coupon.isActive;
    }
    return coupon;
  });

  renderCoupons(coupons);
}

/* ==============================
      Example Axios Call (Commented)
  ============================== */

/*
  async function fetchCoupons() {
    try {
      const response = await axios.get("/admin/api/coupons");
      coupons = response.data;
      renderCoupons(coupons);
    } catch (error) {
      console.error(error);
    }
  }
  */

/* ==============================
      Initial Load
  ============================== */

renderCoupons(coupons);

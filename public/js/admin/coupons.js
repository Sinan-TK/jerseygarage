/* ==============================
      Render Coupons
  ============================== */

function renderCoupons(data) {
  const coupons = data.coupons;

  const page = data.pagination;

  const tableBody = document.getElementById("couponTableBody");
  tableBody.innerHTML = "";

  if (coupons.length === 0) {
    tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-4 text-muted">
            No coupons found
          </td>
        </tr>
      `;
    return;
  }

  coupons.forEach((coupon) => {
    const discountDisplay =
      coupon.discountType === "percentage"
        ? `${coupon.discountValue}% OFF`
        : `₹${coupon.discountValue} OFF`;

    const typeBadge =
      coupon.discountType === "percentage"
        ? `<span class="discount percentage-discount">Percentage</span>`
        : `<span class="discount flat-discount">Flat</span>`;

    const statusBadge = coupon.isActive
      ? `<span class="status active">Active</span>`
      : `<span class="status inactive">Inactive</span>`;

    tableBody.innerHTML += `
        <tr>
          <td class="fw-semibold">${coupon.code}</td>
          <td>${typeBadge}</td>
          <td><span class="badge bg-info text-dark">${discountDisplay}</span></td>
          <td>${new Date(coupon.expiryDate).toDateString()}</td>
          <td>${statusBadge}</td>
          <td class="action-buttons">
          <button class="details-btn" data-id="${coupon._id}">
            <i class="fa-solid fa-clipboard"></i>
          </button>
          <button class="edit-btn" data-id="${coupon._id}">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="delete-btn" data-id="${coupon._id}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
        </tr>
      `;
  });

  document.querySelector(".pagination").innerHTML = pagination(page);
}

/* ==============================
      Filters
  ============================== */

function applyFilters() {
  fetchCoupons();
}

function resetFilters() {
  document.getElementById("searchInput").value = "";
  document.getElementById("statusFilter").value = "";
  fetchCoupons();
}

/* ==============================
      Example Axios Call (Commented)
  ============================== */

async function fetchCoupons(page = 1) {
  const search = document.getElementById("searchInput").value;
  const statusFilter = document.getElementById("statusFilter").value;

  try {
    const res = await axios.get("/admin/coupons/data", {
      params: {
        search,
        statusFilter,
        page,
      },
    });
    renderCoupons(res.data.data);
  } catch (err) {
    const error = err.response?.data;
    console.log(error);
    toastr.error(error?.message || "Something went wrong!", "Error");
  }
}

fetchCoupons();

/* ==============================
      Initial Load
  ============================== */
const deleteModal = document.getElementById("deleteCouponModal");
const closeDeleteModalBtn = document.getElementById("closeDeleteModalBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

let deleteCouponId = null;

/* Open Delete Modal */
document.addEventListener("click", function (e) {
  if (e.target.closest(".delete-btn")) {
    deleteCouponId = e.target.closest(".delete-btn").dataset.id;
    deleteModal.style.display = "flex";
  }
});

/* Close Delete Modal */
closeDeleteModalBtn?.addEventListener("click", () => {
  deleteModal.style.display = "none";
});

cancelDeleteBtn?.addEventListener("click", () => {
  deleteModal.style.display = "none";
});

/* Confirm Delete */
confirmDeleteBtn?.addEventListener("click", async () => {
  if (!deleteCouponId) return;

  try {
    const res = await axios.delete(`/admin/coupons/delete/${deleteCouponId}`);

    if (res.data.success) {
      toastr.success(res.data.message, "success");

      deleteModal.style.display = "none";

      fetchCoupons();
    }
  } catch (err) {
    const error = err.response?.data;

    console.error(error);
    toastr.error(error?.message || "Something went wrong", "Failed");
  }
});

document.querySelector(".create-coupon-btn").addEventListener("click", () => {
  window.location.href = "/admin/coupons/add";
});

function pagination(data) {
  const backward = data.page > 1 ? true : false;
  const forward = data.page < data.totalPages ? true : false;
  return `${
    backward
      ? `<button onclick="fetchCoupons(${data.page - 1})" class="arrow-btn">
      <i class="fa-solid fa-chevron-left"></i>
  </button>`
      : ""
  }

  <span class="current-page-display">
      ${data.page}
  </span>
    ${
      forward
        ? `<button onclick="fetchCoupons(${data.page + 1})" class="arrow-btn">
      <i class="fa-solid fa-chevron-right"></i>
  </button>`
        : ""
    }`;
}

document.addEventListener("click", function (e) {
  if (e.target.closest(".edit-btn")) {
    const couponId = e.target.closest(".edit-btn").dataset.id;

    window.location.href = `/admin/coupons/edit/${couponId}`;
  }
});

document.addEventListener("click", function (e) {
  if (e.target.closest(".details-btn")) {
    const couponId = e.target.closest(".details-btn").dataset.id;

    window.location.href = `/admin/coupons/details/${couponId}`;
  }
});

document.getElementById("searchInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && document.activeElement === e.target) {
    e.preventDefault();
    fetchCoupons();
  }
});
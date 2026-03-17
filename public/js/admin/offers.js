/* =====================================================
   OFFER TABLE RENDERING
===================================================== */

const offerTableBody = document.getElementById("offerTableBody");

function formatDate(dateString) {
  const date = new Date(dateString);

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

document.getElementById("filter-apply").addEventListener("click", () => {
  getOffers();
});

document.getElementById("filter-reset").addEventListener("click", () => {
  document.getElementById("searchInput").value = "";
  document.getElementById("typeFilter").value = "";
  document.getElementById("statusFilter").value = "";
  getOffers();
});

/* =====================================================
   PRODUCTS & CATEGORIES
===================================================== */

let products = [];

let categories = [];

let offers = [];

/* =====================================================
   Axios Section (Keep For Later)
===================================================== */
async function getOffers(page = 1) {
  const search = document.getElementById("searchInput").value;
  const typeFilter = document.getElementById("typeFilter").value;
  const statusFilter = document.getElementById("statusFilter").value;

  try {
    const res = await axios.get("/admin/offers/data", {
      params: {
        search,
        typeFilter,
        statusFilter,
        page,
      },
    });

    if (res.data.success) {
      const data = res.data.data;

      products = data.products;
      categories = data.categories;
      offers = data.offers;
      renderOffers(data.offers, data.pagination);

      createProducts = setupMultiSearch(
        "productSearchInput",
        "productDropdown",
        products,
        "selectedProductPreview",
      );

      createCategories = setupMultiSearch(
        "categorySearchInput",
        "categoryDropdown",
        categories,
        "selectedCategoryPreview",
      );

      editProducts = setupMultiSearch(
        "editProductSearchInput",
        "editProductDropdown",
        products,
        "editSelectedProductPreview",
      );

      editCategories = setupMultiSearch(
        "editCategorySearchInput",
        "editCategoryDropdown",
        categories,
        "editSelectedCategoryPreview",
      );
    }
  } catch (err) {
    const error = err.response?.data;
    console.log(error);
    toastr.error(error?.message || "Something went wrong!", "Error");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  getOffers();
});

/* =====================================================
   Render Offers
===================================================== */

function renderOffers(data, page) {
  offerTableBody.innerHTML = "";

  data.forEach((offer) => {
    const discountDisplay =
      offer.discountType === "percentage"
        ? `${offer.discountValue}% OFF`
        : `₹${offer.discountValue} OFF`;

    const badgeClass =
      offer.discountType === "percentage" ? "percentage" : "flat";

    const discountClass =
      offer.discountType === "percentage"
        ? "percentage-discount"
        : "flat-discount";

    const statusText = offer.isActive ? "Active" : "Inactive";
    const statusClass = offer.isActive ? "active" : "inactive";

    const appliedNames =
      offer.offerApplyType === "product"
        ? products
            .filter((p) => offer.productIds.includes(p.id))
            .map((p) => p.name)
            .join(", ")
        : categories
            .filter((c) => offer.categoryIds.includes(c.id))
            .map((c) => c.name)
            .join(", ");

    const row = `
      <tr>
        <td>${offer.name}</td>
        <td>${offer.offerApplyType}</td>
        <td>
          <span class="badge ${badgeClass}">
            ${offer.discountType === "percentage" ? "Percentage" : "Flat"}
          </span>
        </td>
        <td>
          <span class="discount ${discountClass}">
            ${discountDisplay}
          </span>
        </td>
        <td>${formatDate(offer.startDate)} → ${formatDate(offer.endDate)}</td>
        <td>
          <span class="status ${statusClass}">
            ${statusText}
          </span>
        </td>
        <td class="action-buttons">
          <button class="details-btn" data-id="${offer._id}">
            <i class="fa-solid fa-clipboard"></i>
          </button>
          <button class="edit-btn" data-id="${offer._id}">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="delete-btn" data-id="${offer._id}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `;

    offerTableBody.insertAdjacentHTML("beforeend", row);
  });
  document.querySelector(".pagination").innerHTML = pagination(page);
}

/* =====================================================
   MULTIPLE SEARCH LOGIC
===================================================== */

function setupMultiSearch(inputId, dropdownId, dataArray, previewId) {
  const input = document.getElementById(inputId);
  const dropdown = document.getElementById(dropdownId);
  const preview = document.getElementById(previewId);

  if (!input || !dropdown || !preview) return null;

  let selectedItems = [];

  function renderPreview() {
    preview.innerHTML = "";

    selectedItems.forEach((item, index) => {
      const div = document.createElement("div");
      div.classList.add("preview-item");

      div.innerHTML = `
        <span>${item.name}</span>
        <i class="fa-solid fa-xmark remove-preview" data-index="${index}"></i>
      `;

      preview.appendChild(div);
    });

    preview.querySelectorAll(".remove-preview").forEach((btn) => {
      btn.addEventListener("click", function () {
        selectedItems.splice(this.dataset.index, 1);
        renderPreview();
      });
    });
  }

  input.addEventListener("input", () => {
    const value = input.value.toLowerCase();
    dropdown.innerHTML = "";

    if (!value) {
      dropdown.style.display = "none";
      return;
    }

    const filtered = dataArray.filter(
      (item) =>
        item.name.toLowerCase().includes(value) &&
        !selectedItems.some(
          (sel) => (sel.id || sel._id) === (item.id || item._id),
        ),
    );

    filtered.forEach((item) => {
      const div = document.createElement("div");
      div.classList.add("dropdown-item");
      div.textContent = item.name;

      div.addEventListener("click", () => {
        selectedItems.push(item);
        renderPreview();
        input.value = "";
        dropdown.style.display = "none";
      });

      dropdown.appendChild(div);
    });

    dropdown.style.display = filtered.length ? "block" : "none";
  });

  return {
    getIds: () => selectedItems.map((item) => item.id || item._id),

    setSelected: (ids) => {
      selectedItems = dataArray.filter((item) => ids.includes(item._id));
      renderPreview();
    },
    clear: () => {
      selectedItems = [];
      renderPreview();
    },
  };
}

/* =====================================================
   INITIALIZE MULTI SEARCH
===================================================== */

let createProducts;
let createCategories;
let editProducts;
let editCategories;

/* =====================================================
   CREATE SUBMIT
===================================================== */

document
  .getElementById("createOfferForm")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const addData = {
      name: document.getElementById("offerName").value,
      offerApplyType: document.getElementById("applyType").value,
      productIds: createProducts?.getIds() || [],
      categoryIds: createCategories?.getIds() || [],
      discountType: document.getElementById("discountType").value,
      discountValue: document.getElementById("discountValue").value,
      startDate: document.getElementById("startDate").value,
      endDate: document.getElementById("endDate").value,
      isActive: document.getElementById("offerStatus").checked,
    };

    try {
      const res = await axios.post("/admin/offers/add", addData);

      if (res.data.success) {
        toastr.success(res.data.message, "success");
        modal.querySelector("form")?.reset();
        modal.style.display = "none";
        getOffers();
      }
    } catch (err) {
      const error = err.response?.data;
      console.log(error);
      toastr.error(error?.message || "Something went wrong!", "Error");
    }
  });

/* =====================================================
   CREATE MODAL CONTROL
===================================================== */

const modal = document.getElementById("createOfferModal");
const openBtn = document.querySelector(".create-offer-btn");
const closeBtn = document.getElementById("closeModalBtn");
const cancelBtn = document.getElementById("cancelBtn");

const applyType = document.getElementById("applyType");
const productGroup = document.getElementById("productSearchGroup");
const categoryGroup = document.getElementById("categorySearchGroup");
const statusToggle = document.getElementById("offerStatus");
const statusLabel = document.querySelector(".status-label");

statusToggle?.addEventListener("change", () => {
  statusLabel.textContent = statusToggle.checked ? "Active" : "Inactive";
});

openBtn?.addEventListener("click", () => {
  modal.style.display = "flex";
});

closeBtn?.addEventListener("click", () => {
  modal.style.display = "none";
});

cancelBtn?.addEventListener("click", () => {
  modal.style.display = "none";
});

/* Toggle product/category fields */
applyType?.addEventListener("change", () => {
  if (!productGroup || !categoryGroup) return;

  if (applyType.value === "product") {
    productGroup.classList.remove("hidden");
    categoryGroup.classList.add("hidden");
  } else if (applyType.value === "category") {
    categoryGroup.classList.remove("hidden");
    productGroup.classList.add("hidden");
  } else {
    productGroup.classList.add("hidden");
    categoryGroup.classList.add("hidden");
  }
});

/* =====================================================
   EDIT MODAL CONTROL
===================================================== */

const editModal = document.getElementById("editOfferModal");
const editStatusToggle = document.getElementById("editOfferStatus");
const editStatusLabel = document.getElementById("editStatusLabel");

const editApplyType = document.getElementById("editApplyType");
const editProductGroup = document.getElementById("editProductSearchGroup");
const editCategoryGroup = document.getElementById("editCategorySearchGroup");

editStatusToggle?.addEventListener("change", function () {
  editStatusLabel.textContent = this.checked ? "Active" : "Inactive";
});

document.addEventListener("click", function (e) {
  if (e.target.closest(".edit-btn")) {
    const offerId = e.target.closest(".edit-btn").dataset.id;
    const offer = offers.find((o) => o._id === offerId);
    if (!offer) return;

    document.getElementById("editOfferId").value = offer._id;
    document.getElementById("editOfferName").value = offer.name;
    document.getElementById("editDiscountType").value = offer.discountType;
    document.getElementById("editDiscountValue").value = offer.discountValue;
    document.getElementById("editStartDate").value = new Date(offer.startDate)
      .toISOString()
      .split("T")[0];
    document.getElementById("editEndDate").value = new Date(offer.endDate)
      .toISOString()
      .split("T")[0];
    document.getElementById("editApplyType").value = offer.offerApplyType;
    editStatusToggle.checked = offer.isActive;
    editStatusLabel.textContent = offer.isActive ? "Active" : "Inactive";

    // toggle field
    if (offer.offerApplyType === "product") {
      editProductGroup.classList.remove("hidden");
      editCategoryGroup.classList.add("hidden");
      editProducts?.setSelected(offer.productIds);
    } else {
      editCategoryGroup.classList.remove("hidden");
      editProductGroup.classList.add("hidden");
      editCategories?.setSelected(offer.categoryIds);
    }

    editModal.style.display = "flex";
  }
});

editApplyType?.addEventListener("change", function () {
  if (this.value === "product") {
    editProductGroup.classList.remove("hidden");
    editCategoryGroup.classList.add("hidden");
  } else {
    editCategoryGroup.classList.remove("hidden");
    editProductGroup.classList.add("hidden");
  }
});

document.getElementById("closeEditModalBtn")?.addEventListener("click", () => {
  editModal.style.display = "none";
});

document.getElementById("cancelEditBtn")?.addEventListener("click", () => {
  editModal.style.display = "none";
});

document
  .getElementById("editOfferForm")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("editOfferId").value;

    const editData = {
      name: document.getElementById("editOfferName").value,
      offerApplyType: document.getElementById("editApplyType").value,
      productIds: editProducts?.getIds() || [],
      categoryIds: editCategories?.getIds() || [],
      discountType: document.getElementById("editDiscountType").value,
      discountValue: document.getElementById("editDiscountValue").value,
      startDate: document.getElementById("editStartDate").value,
      endDate: document.getElementById("editEndDate").value,
      isActive: document.getElementById("editOfferStatus").checked,
    };

    try {
      const res = await axios.put(`/admin/offers/edit/${id}`, editData);

      if (res.data.success) {
        toastr.success(res.data.message, "success");
        editModal.style.display = "none";
        getOffers();
      }
    } catch (err) {
      const error = err.response?.data;
      console.log(error);
      toastr.error(error?.message || "Something went wrong!", "Error");
    }
  });

/* =====================================================
   DELETE MODAL CONTROL
===================================================== */

const deleteModal = document.getElementById("deleteOfferModal");
const closeDeleteModalBtn = document.getElementById("closeDeleteModalBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

let deleteOfferId = null;

/* Open Delete Modal */
document.addEventListener("click", function (e) {
  if (e.target.closest(".delete-btn")) {
    deleteOfferId = e.target.closest(".delete-btn").dataset.id;
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
  if (!deleteOfferId) return;

  try {
    const res = await axios.delete(`/admin/offers/delete/${deleteOfferId}`);

    if (res.data.success) {
      toastr.success(res.data.message, "success");

      deleteModal.style.display = "none";

      getOffers();
    }
  } catch (err) {
    const error = err.response?.data;

    console.error(error);
    toastr.error(error?.message || "Something went wrong", "Failed");
  }
});

function pagination(data) {
  const backward = data.page > 1 ? true : false;
  const forward = data.page < data.totalPages ? true : false;
  return `${
    backward
      ? `<button onclick="getOffers(${data.page - 1})" class="arrow-btn">
      <i class="fa-solid fa-chevron-left"></i>
  </button>`
      : ""
  }

  <span class="current-page-display">
      ${data.page}
  </span>
    ${
      forward
        ? `<button onclick="getOffers(${data.page + 1})" class="arrow-btn">
      <i class="fa-solid fa-chevron-right"></i>
  </button>`
        : ""
    }`;
}

/* =====================================================
   OFFER DETAILS MODAL
===================================================== */

const detailsModal = document.getElementById("offerDetailsModal");
const closeDetailsModalBtn = document.getElementById("closeDetailsModalBtn");
const closeDetailsBtn = document.getElementById("closeDetailsBtn");

/* Open Details */
document.addEventListener("click", function (e) {
  if (e.target.closest(".details-btn")) {
    const offerId = e.target.closest(".details-btn").dataset.id;

    const offer = offers.find((o) => o._id === offerId || o.id === offerId);
    if (!offer) return;

    // Set values
    document.getElementById("detailOfferName").textContent = offer.name;
    document.getElementById("detailOfferType").textContent =
      offer.offerApplyType;

    const discountText =
      offer.discountType === "percentage"
        ? `${offer.discountValue}% OFF`
        : `₹${offer.discountValue} OFF`;

    document.getElementById("detailDiscount").textContent = discountText;

    document.getElementById("detailDateRange").textContent =
      `${formatDate(offer.startDate)} → ${formatDate(offer.endDate)}`;

    const statusElement = document.getElementById("detailStatus");

    statusElement.textContent = offer.isActive ? "Active" : "Inactive";

    statusElement.classList.remove("active", "inactive");

    statusElement.classList.add(offer.isActive ? "active" : "inactive");

    // Applied To Preview
    const preview = document.getElementById("detailAppliedTo");
    preview.innerHTML = "";

    if (offer.offerApplyType === "product") {
      const selectedProducts = products.filter((p) =>
        offer.productIds?.includes(p.id || p._id),
      );

      selectedProducts.forEach((p) => {
        const span = document.createElement("span");
        span.textContent = p.name;
        preview.appendChild(span);
      });
    } else {
      const selectedCategories = categories.filter((c) =>
        offer.categoryIds?.includes(c.id || c._id),
      );

      selectedCategories.forEach((c) => {
        const span = document.createElement("span");
        span.textContent = c.name;
        preview.appendChild(span);
      });
    }

    detailsModal.style.display = "flex";
  }
});

/* Close Modal */
closeDetailsModalBtn?.addEventListener("click", () => {
  detailsModal.style.display = "none";
});

closeDetailsBtn?.addEventListener("click", () => {
  detailsModal.style.display = "none";
});

/* Close on outside click */
window.addEventListener("click", (e) => {
  if (e.target === detailsModal) {
    detailsModal.style.display = "none";
  }
});

document.getElementById("searchInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && document.activeElement === e.target) {
    e.preventDefault();
    getOffers();
  }
});
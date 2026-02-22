let categories = [];
let products = [];

// /* ===============================
//    VIEW PRODUCTS MODAL
// ================================ */
const viewProductsModal = document.getElementById("viewProductsModal");
const viewCloseBtns = document.querySelectorAll(".close-modal, .close-footer");
const btn = document.getElementById("view-products");

function openModalProductList(btn) {
  const categoryId = btn.dataset.category;
  const category = categories.find((o) => o._id === categoryId);
  if (!category) return;

  document.getElementById("category-heading").innerHTML = category.name;
  document.getElementById("category-description").innerHTML =
    category.description;

  const container = document.querySelector(".modal-products");
  container.innerHTML = "";
  const catProducts = products.filter((p) => p.category === category._id);
  if (catProducts.length === 0) {
    container.innerHTML = `
    <div class="no-products">
      No products available in this category
    </div>
  `;
    viewProductsModal.style.display = "flex";
    return;
  }

  catProducts.forEach((product) => {
    if (product.category === category._id) {
      let status = "blocked";
      if (product.is_active) {
        status = "listed";
      }
      container.innerHTML += `
    <div class="product-item">
      <img src="${product.images[0] || "/images/placeholder.png"}" alt="${
        product.name
      }">
      <div class="info">
        <h3>${product.name}</h3>
        <div class="meta">
        <span>•</span>
        <span>Team: ${product.teamName}</span>

        </div>
        <span class="${status}">${status}</span>
      </div>
    </div>
  `;
    }
  });
  viewProductsModal.style.display = "flex";
}

viewCloseBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    viewProductsModal.style.display = "none";
  });
});

viewProductsModal.addEventListener("click", (e) => {
  if (e.target === viewProductsModal) {
    viewProductsModal.style.display = "none";
  }
});

// /* ===============================
//    ADD CATEGORY MODAL
// ================================ */
const categoryModal = document.getElementById("categoryModal");
const closeCategoryBtns = document.querySelectorAll(".close-category-modal");

function openCategoryModal() {
  categoryModal.style.display = "flex";
}

closeCategoryBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    categoryModal.style.display = "none";

    const errBox = document.getElementById("addErrorBox");
    if (errBox) errBox.remove();
  });
});

categoryModal.addEventListener("click", (e) => {
  if (e.target === categoryModal) {
    categoryModal.style.display = "none";

    const errBox = document.getElementById("addErrorBox");
    if (errBox) errBox.remove();
  }
});

/* ===============================
   EDIT CATEGORY MODAL
================================ */
const editModal = document.getElementById("editCategoryModal");
const closeEditBtns = document.querySelectorAll(".close-edit-modal");

// // Function to open edit modal
function openEditModal() {
  editModal.style.display = "flex";
}

// // Close modal logic
closeEditBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    editModal.style.display = "none";

    const errBox = document.getElementById("editErrorBox");
    if (errBox) errBox.remove();
  });
});

editModal.addEventListener("click", (e) => {
  if (e.target === editModal) {
    editModal.style.display = "none";

    const errBox = document.getElementById("editErrorBox");
    if (errBox) errBox.remove();
  }
});

let id = null;

// Attach click listener to each edit button
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".edit");
  if (!btn) return;

  openEditModal();

  id = btn.dataset.id;

  const category = categories.find((o) => o._id === id);
  if (!category) return;

  document.getElementById("editCategoryName").value = category.name;
  document.getElementById("editCategoryDescription").value =
    category.description;
});

async function editConfirm() {
  const name = document.getElementById("editCategoryName").value;
  const description = document.getElementById("editCategoryDescription").value;
  const errorBox = document.getElementById("editError");
  const errorText = document.getElementById("editErrorText");

  try {
    const res = await axios.patch(`/admin/categories/edit/${id}`, {
      name,
      description,
    });

    if (res.data.success) {
      editModal.style.display = "none";
      toastr.success(res.data.message, "success");

      clearFilterFields();
    }
  } catch (err) {
    const error = err.response?.data;

    console.log(error);

    errorBox.style.display = "flex";
    errorText.innerText = error?.message || "Something went wrong.";

    setTimeout(() => {
      errorBox.style.display = "none";
      errorText.innerHTML = "";
    }, 3000);
  }
}

// /* ===============================
//    CATEGORY BLOCK AXIOS
// ================================ */

async function blockConfirm() {
  if (!selectedAction || !selectedId) return;

  try {
    const res = await axios.patch(
      `/admin/categories/${selectedAction}/${selectedId}`,
    );

    if (res.data.success) {
      if (res.data.data.is_active) {
        const status = document.querySelector(
          `.status[data-id="${res.data.data._id}"]`,
        );
        status.textContent = "Active";
        status.classList.replace("inactive", "active");

        const blockButton = document.querySelector(
          `.cat-action[data-id="${res.data.data._id}"]`,
        );
        blockButton.innerHTML = "<i class='fa-solid fa-lock'></i>";
        blockButton.classList.replace("unblock-category", "block-category");
        blockButton.classList.replace("unblock", "block");
        toastr.success(res.data.message, "Unblock");

        confirmModal.style.display = "none";
      } else {
        const status = document.querySelector(
          `.status[data-id="${res.data.data._id}"]`,
        );
        status.textContent = "Blocked";
        status.classList.replace("active", "inactive");

        const blockButton = document.querySelector(
          `.cat-action[data-id="${res.data.data._id}"]`,
        );
        blockButton.innerHTML = "<i class='fa-solid fa-lock-open'></i>";
        blockButton.classList.replace("block-category", "unblock-category");
        blockButton.classList.replace("block", "unblock");
        toastr.error(res.data.message, "Block");

        confirmModal.style.display = "none";
      }
    } else {
      toastr.error("Something went wrong!", "error");
    }
  } catch (err) {
    const error = err.response?.data;

    console.log(error);
    toastr.error(error?.message || "Something went wrong.", "error");
  }
}

// document.addEventListener("DOMContentLoaded", () => {
loadData();

/* ===============================
      CUSTOM DROPDOWN LOGIC
  ================================ */
const dropdown = document.querySelector(".custom-dropdown");
const dropdownSelected = dropdown.querySelector(".dropdown-selected");
const dropdownOptions = dropdown.querySelector(".dropdown-options");
const dropdownItems = dropdownOptions.querySelectorAll("li");
const hiddenInput = document.getElementById("statusFilter");

// const userStatusFromServer = window.userStatusFromServer;

const statusLabels = {
  all: "All Catergories",
  active: "Active Catergories",
  blocked: "Blocked Catergories",
};

dropdownSelected.addEventListener("click", () => {
  dropdownOptions.classList.toggle("show-options");
  dropdownSelected.classList.toggle("active");
});

dropdownItems.forEach((item) => {
  item.addEventListener("click", () => {
    const value = item.getAttribute("data-value");
    dropdownSelected.textContent = item.textContent;
    hiddenInput.value = value;

    dropdownOptions.classList.remove("show-options");
    dropdownSelected.classList.remove("active");
  });
});

document.addEventListener("click", (e) => {
  if (!dropdown.contains(e.target)) {
    dropdownOptions.classList.remove("show-options");
    dropdownSelected.classList.remove("active");
  }
});

/* ===============================
      FILTER CLEAR LOGIC
  ================================ */
const clearBtn = document.getElementById("clearFilter");
const searchInput = document.getElementById("filterInput");

clearBtn.addEventListener("click", () => {
  clearFilterFields();
});

function clearFilterFields() {
  searchInput.value = "";
  hiddenInput.value = "all";
  dropdownSelected.textContent = "All Categories";
  loadData();
}

//ADD CATEGORY SECTION

async function addCategory() {
  const name = document.getElementById("addCategoryName").value;
  const description = document.getElementById("addCategoryDescription").value;
  const errorBox = document.getElementById("addError");
  const errorText = document.getElementById("addErrorText");

  try {
    const res = await axios.post("/admin/categories/add", {
      name,
      description,
    });

    if (res.data.success) {
      toastr.success(res.data.message, "Success");
      categoryModal.style.display = "none";
      document.getElementById("addCategoryName").value = "";
      document.getElementById("addCategoryDescription").value = "";

      clearFilterFields();
    }
  } catch (err) {
    const error = err.response?.data;

    console.log(error);

    errorBox.style.display = "flex";
    errorText.innerText = error?.message || "Something went wrong.";

    setTimeout(() => {
      errorBox.style.display = "none";
      errorText.innerHTML = "";
    }, 3000);
  }
}
// });

const tableBody = document.getElementById("categoryTableBody");

function categoryDiv(data) {
  tableBody.innerHTML = "";

  if (data.categories.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="5" class="no-data-cell">
      No Category Found
    </td>`;
    tableBody.appendChild(row);
    document.querySelector(".pagination").innerHTML = "";
    return;
  }

  data.categories.forEach((category) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>
          <h3>
              ${category.name}
          </h3>
      </td>

      <td>
          <div class="desc-wrapper">
              <p class="desc">
                  ${category.description}
              </p>
          </div>
      </td>

      <!-- STATUS -->
      <td>
          <p class="status ${category.is_active ? "active" : "inactive"}"
              data-id=${category._id}>
              ${category.is_active ? "Active" : "Blocked"}
          </p>
      </td>

      <td>
          <div class="actions">

              <button class="edit edit-btn" data-id="${category._id}">
                  <i class="fa-solid fa-pen-to-square"></i>
              </button>

              <button class="view details-btn" id="view-products"
                  data-category='${category._id}'
                  onclick="openModalProductList(this)">
                  <i class="fa-solid fa-clipboard"></i>
              </button>

              <button
                  class="cat-action ${category.is_active ? "block block-category" : "unblock unblock-category"}" data-id="${category._id}">
                  ${
                    category.is_active
                      ? '<i class="fa-solid fa-lock"></i>'
                      : '<i class="fa-solid fa-lock-open"></i>'
                  }
              </button>

          </div>
      </td>`;

    tableBody.appendChild(row);
  });

  document.querySelector(".pagination").innerHTML = pagination(data.pagination);
}

async function loadData(page = 1) {
  const search = document.getElementById("filterInput").value;
  const status = document.getElementById("statusFilter").value;

  try {
    const res = await axios.get("/admin/categories/data", {
      params: {
        page,
        search,
        status,
      },
    });
    categories = res.data.data.categories;
    products = res.data.data.products;
    categoryDiv(res.data.data);
  } catch (err) {
    const error = err.response?.data;
    console.log(error);
    toastr.error(error?.message || "Something went wrong", "Failed");
  }
}

function pagination(data) {
  const backward = data.page > 1 ? true : false;
  const forward = data.page < data.totalPages ? true : false;
  return `${
    backward
      ? `<button onclick="loadData(${data.page - 1})" class="arrow-btn">
      <i class="fa-solid fa-chevron-left"></i>
  </button>`
      : ""
  }

  <span class="current-page-display">
      ${data.page}
  </span>
    ${
      forward
        ? `<button onclick="loadData(${data.page + 1})" class="arrow-btn">
      <i class="fa-solid fa-chevron-right"></i>
  </button>`
        : ""
    }`;
}

document.querySelector(".apply-btn").addEventListener("click", () => {
  loadData(1);
});

/* =====================================
   CATEGORY BLOCK / UNBLOCK CONFIRM MODAL
===================================== */
const confirmModal = document.getElementById("confirmModal");
const modalTitle = document.getElementById("modalTitle");
const modalMessage = document.getElementById("modalMessage");
const confirmBtn = document.getElementById("confirmBtn");
const cancelBtn = document.getElementById("cancelBtn");
let selectedAction = null;
let selectedId = null;

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".block-category, .unblock-category");
  if (!btn) return;

  e.preventDefault();

  selectedId = btn.dataset.id;
  const categoryName = categories.find((o) => o._id === selectedId)?.name;

  const isUnblock = btn.classList.contains("unblock-category");
  selectedAction = isUnblock ? "unblock" : "block";

  modalTitle.textContent = isUnblock ? "Unblock Category" : "Block Category";

  modalTitle.classList.remove("green-title", "red-title");
  modalTitle.classList.add(isUnblock ? "green-title" : "red-title");

  modalMessage.textContent = isUnblock
    ? `Do you want to unblock "${categoryName}"?`
    : `Are you sure you want to block "${categoryName}"?`;

  confirmModal.style.display = "flex";
});

cancelBtn.addEventListener("click", () => {
  confirmModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === confirmModal) confirmModal.style.display = "none";
});

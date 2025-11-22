/* ===============================
   VIEW PRODUCTS MODAL
================================ */
const viewProductsModal = document.getElementById("viewProductsModal");
const viewCloseBtns = document.querySelectorAll(".close-modal, .close-footer");

function openModalProductList() {
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

/* ===============================
   ADD CATEGORY MODAL
================================ */
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
   CATEGORY COLOR SELECTOR
================================ */
const addColorBoxes = document.querySelectorAll(".color-box");

addColorBoxes.forEach((box) => {
  box.addEventListener("click", () => {
    addColorBoxes.forEach((b) => b.classList.remove("selected"));

    box.classList.add("selected");
    document.getElementById("selectedColor").value = box.dataset.color;
  });
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

document
  .querySelectorAll(".block-category, .unblock-category")
  .forEach((icon) => {
    icon.addEventListener("click", (e) => {
      e.preventDefault();

      const card = icon.closest(".cat-card");
      const categoryName = card.dataset.name;
      // const actionLink = icon.getAttribute("href");
      const isUnblock = icon.classList.contains("unblock");
      selectedId = card.dataset.id;

      selectedAction = isUnblock ? "unblock" : "block";

      modalTitle.textContent = isUnblock
        ? "Unblock Category"
        : "Block Category";
      modalTitle.className = isUnblock ? "green-title" : "red-title";

      modalMessage.textContent = isUnblock
        ? `Do you want to unblock "${categoryName}"?`
        : `Are you sure you want to block "${categoryName}"?`;

      confirmModal.style.display = "flex";
    });
  });

cancelBtn.addEventListener("click", () => {
  confirmModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === confirmModal) confirmModal.style.display = "none";
});

/* ===============================
   EDIT CATEGORY MODAL
================================ */
const editModal = document.getElementById("editCategoryModal");
const closeEditBtns = document.querySelectorAll(".close-edit-modal");
const editColorBoxes = document.querySelectorAll(
  "#editCategoryModal .color-box"
);

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
document.querySelectorAll(".edit").forEach((btn) => {
  btn.addEventListener("click", () => {
    id = btn.dataset.id;
    const name = btn.dataset.name;
    const description = btn.dataset.description;
    const color = btn.dataset.color;

    // Fill inputs
    document.getElementById("editCategoryName").value = name;
    document.getElementById("editCategoryDescription").value = description;
    document.getElementById("editCategoryColor").value = color;

    // Highlight correct color
    editColorBoxes.forEach((box) => {
      box.classList.remove("selected");
      if (box.dataset.color === color) {
        box.classList.add("selected");
      }

      box.addEventListener("click", () => {
        editColorBoxes.forEach((b) => b.classList.remove("selected"));

        box.classList.add("selected");
        document.getElementById("editCategoryColor").value = box.dataset.color;
      });
    });
  });
});

async function editConfirm() {
  const name = document.getElementById("editCategoryName").value;
  const description = document.getElementById("editCategoryDescription").value;
  const color = document.getElementById("editCategoryColor").value;
  const errorBox = document.getElementById("editError");
  const errorText = document.getElementById("editErrorText");

  console.log(name);
  console.log(description);
  console.log(color);
  console.log(id);

  try {
    const res = await axios.patch(`/admin/categories/edit/${id}`, {
      name,
      description,
      color,
    });

    if (res.data.success) {
      editModal.style.display = "none";
      toastr.success(res.data.message, "success");

      const updated = res.data.updatedData;

      // FIND THE CARD USING data-id
      const card = document.querySelector(
        `.cat-card[data-id="${updated._id}"]`
      );

      if (card) {
        // UPDATE NAME
        card.querySelector("h3").textContent = updated.name;

        // UPDATE DESCRIPTION
        card.querySelector(".desc").textContent = updated.description;

        // UPDATE COLOR (background variable)
        card.style.setProperty("--bg", updated.color);

        // UPDATE data attributes for next edit click
        card.dataset.name = updated.name;
        card.dataset.description = updated.description;
        card.dataset.color = updated.color;

        // UPDATE THE EDIT BUTTON ATTRIBUTES
        let editBtn = card.querySelector(".edit");
        editBtn.dataset.name = updated.name;
        editBtn.dataset.description = updated.description;
        editBtn.dataset.color = updated.color;
      }
    } else {
      errorBox.style.display = "flex";
      errorText.innerText = res.data.message;
    }
  } catch (err) {
    console.log("Something went wrong!!");
  }
}

/* ===============================
   CATEGORY BLOCK AXIOS
================================ */

async function blockConfirm() {
  if (!selectedAction || !selectedId) return;
  console.log(selectedAction);
  console.log(selectedId);

  try {
    const res = await axios.patch(
      `/admin/categories/${selectedAction}/${selectedId}`
    );

    if (res.data.success) {
      // toastr.success(res.data.message,"success");
      console.log(res.data.updatedData.is_active);
      if (res.data.updatedData.is_active) {
        const status = document.querySelector(
          `.status[data-id="${res.data.updatedData._id}"]`
        );
        status.textContent = "Active";
        status.classList.replace("inactive", "active");

        const blockButton = document.querySelector(
          `.cat-action[data-id="${res.data.updatedData._id}"]`
        );
        blockButton.textContent = "Block";
        blockButton.classList.replace("unblock-category", "block-category");
        blockButton.classList.replace("unblock", "block");
        toastr.success(res.data.message, "Unblock");

        confirmModal.style.display = "none";
      } else {
        const status = document.querySelector(
          `.status[data-id="${res.data.updatedData._id}"]`
        );
        status.textContent = "Blocked";
        status.classList.replace("active", "inactive");

        const blockButton = document.querySelector(
          `.cat-action[data-id="${res.data.updatedData._id}"]`
        );
        blockButton.textContent = "Unblock";
        blockButton.classList.replace("block-category", "unblock-category");
        blockButton.classList.replace("block", "unblock");
        toastr.error(res.data.message, "Block");

        confirmModal.style.display = "none";
      }
    } else {
      toastr.error("Something went wrong!", "error");
    }
  } catch (err) {
    console.log(err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  /* ===============================
      CUSTOM DROPDOWN LOGIC
  ================================ */
  const dropdown = document.querySelector(".custom-dropdown");
  const dropdownSelected = dropdown.querySelector(".dropdown-selected");
  const dropdownOptions = dropdown.querySelector(".dropdown-options");
  const dropdownItems = dropdownOptions.querySelectorAll("li");
  const hiddenInput = document.getElementById("statusFilter");

  const userStatusFromServer = window.userStatusFromServer;

  const statusLabels = {
    all: "All Catergories",
    active: "Active Catergories",
    blocked: "Blocked Catergories",
  };

  dropdownSelected.textContent =
    statusLabels[userStatusFromServer] || "All Catergories";
  hiddenInput.value = userStatusFromServer;

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
    searchInput.value = "";
    hiddenInput.value = "all";
    dropdownSelected.textContent = "All Categories";
  });
});

async function addCategory() {
  const name = document.getElementById("addCategoryName").value;
  const description = document.getElementById("addCategoryDescription").value;
  const color = document.getElementById("selectedColor").value;
  const errorBox = document.getElementById("editError");
  const errorText = document.getElementById("editErrorText");

  console.log(name, description, color);

  try {
    const res = await axios.post("/admin/categories/add", {
      name,
      description,
      color,
    });

    if(res.data.success){
      toastr.success("Category added","Success");
      setTimeout(()=>{
        window.location.reload();
      },5000);
    }else{
      errorBox.style.display = "flex";
      errorText.innerText = res.data.message;
    }
  } catch (err) {
    console.log("Something went wrong!");
  }
}

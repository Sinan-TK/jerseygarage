/* ===============================
   ROW DROPDOWN
================================ */
document.querySelectorAll(".row-arrow").forEach((arrow) => {
  arrow.addEventListener("click", () => {
    const id = arrow.dataset.id;
    const panel = document.getElementById(`drop-${id}`);

    // Close other dropdown rows
    document.querySelectorAll(".dropdown-row").forEach((p) => {
      if (p !== panel) p.style.display = "none";
    });

    // Reset other arrows
    document.querySelectorAll(".row-arrow").forEach((a) => {
      if (a !== arrow) a.classList.remove("open");
    });

    // Toggle current
    const open = panel.style.display === "table-row";
    panel.style.display = open ? "none" : "table-row";
    arrow.classList.toggle("open", !open);
  });
});

/* ===============================
   STATUS DROPDOWN (FILTER BAR)
================================ */
const dd = document.getElementById("statusDropdown");

dd.addEventListener("click", () => {
  dd.querySelector(".dropdown-options").classList.toggle("show-options");
});

document.querySelectorAll(".dropdown-options li").forEach((item) => {
  item.addEventListener("click", () => {
    dd.querySelector(".dropdown-selected").textContent = item.textContent;
    dd.dataset.value = item.dataset.value;
  });
});

/* APPLY FILTER */
document.getElementById("applyFilter").addEventListener("click", () => {
  const search = document.getElementById("searchInput").value.toLowerCase();
  const status = dd.dataset.value || "all";

  document.querySelectorAll(".product-row").forEach((row) => {
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

  document.querySelectorAll(".product-row").forEach((row) => {
    row.style.display = "table-row";
    document.getElementById(`drop-${row.dataset.id}`).style.display = "none";
  });
});

/* ===============================
   MODALS (ADD + EDIT)
================================ */
const addModal = document.getElementById("addProductModal");
const editModal = document.getElementById("editModal");
const body = document.body;

document.querySelector(".add-btn").addEventListener("click", () => {
  addModal.style.display = "flex";
  body.style.overflow = "hidden";
});

// Close buttons (X and Cancel) for both modals
document.querySelectorAll(".close-btn, .cancel-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const modal = btn.closest(".modal-overlay");
    if (modal) {
      modal.style.display = "none";
      body.style.overflow = "";
    }
  });
});

// Click outside to close (for both modals)
[addModal, editModal].forEach((modal) => {
  modal.addEventListener("mousedown", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
      body.style.overflow = "";
    }
  });
});

/* ===============================
   CATEGORY DROPDOWNS (ADD + EDIT)
================================ */
document.querySelectorAll(".categoryDrop").forEach((drop) => {
  const selected = drop.querySelector(".dropdown-cat-selected");
  const optionsBox = drop.querySelector(".dropdown-cat-options");
  const options = drop.querySelectorAll(".dropdown-cat-options li");
  const hiddenInput = drop.parentElement.querySelector('input[type="hidden"]');

  // Toggle dropdown
  selected.addEventListener("click", (e) => {
    e.stopPropagation();
    drop.classList.toggle("active");
  });

  // Select option
  options.forEach((opt) => {
    opt.addEventListener("click", (e) => {
      e.stopPropagation();
      selected.textContent = opt.textContent;
      hiddenInput.value = opt.dataset.value;
      drop.classList.remove("active");
    });
  });
});

// Close all category dropdowns on outside click
document.addEventListener("click", () => {
  document.querySelectorAll(".categoryDrop").forEach((drop) => {
    drop.classList.remove("active");
  });
});

/* ===============================
   IMAGE CROPPER (ADD PRODUCT ONLY)
================================ */
const OUTPUT_FORMAT = "image/webp";
const OUTPUT_QUALITY = 0.9;

// State arrays (for ADD product)
let selectedFiles = []; // files currently being cropped
let croppedBlobs = []; // final cropped blobs

// DOM for cropping
const fileInput = document.getElementById("fileInput"); // ADD modal only
const cropModal = document.getElementById("cropModal");
const cropImage = document.getElementById("cropImage");
const cropNextBtn = document.getElementById("cropNextBtn");
const cancelCropBtn = document.getElementById("cancelCropBtn");
const previewContainer = document.getElementById("previewContainer");

let cropper = null;

// find first free slot in croppedBlobs or push to end
function getNextFreeIndex() {
  const idx = croppedBlobs.findIndex((b) => b === undefined || b === null);
  return idx === -1 ? croppedBlobs.length : idx;
}

// render previews from croppedBlobs (stable order)
function renderPreviews() {
  if (!previewContainer) return;
  previewContainer.innerHTML = "";
  croppedBlobs.forEach((blob, index) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);

    const card = document.createElement("div");
    card.className = "preview-card";
    card.dataset.index = index;
    card.style =
      "display:flex; flex-direction:column; align-items:center; gap:6px;";

    const img = document.createElement("img");
    img.src = url;
    img.style =
      "width:100px; height:100px; object-fit:cover; border-radius:6px;";

    const controls = document.createElement("div");
    controls.style = "display:flex; gap:6px;";

    // Re-crop
    const recropBtn = document.createElement("button");
    recropBtn.type = "button";
    recropBtn.className = "btn";
    recropBtn.textContent = "Re-Crop";
    recropBtn.onclick = () => {
      openCropperFor(
        new File([blob], `recrop_${index}.webp`, { type: OUTPUT_FORMAT }),
        index
      );
    };

    // Remove
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "btn cancel-btn";
    removeBtn.textContent = "Remove";
    removeBtn.onclick = () => {
      croppedBlobs[index] = null;
      renderPreviews();
    };

    controls.appendChild(recropBtn);
    controls.appendChild(removeBtn);

    card.appendChild(img);
    card.appendChild(controls);

    previewContainer.appendChild(card);
  });
}

// Handle file selection for ADD product
if (fileInput) {
  fileInput.addEventListener("change", (e) => {
    const incoming = Array.from(e.target.files || []);
    if (incoming.length === 0) return;

    selectedFiles = incoming;
    const nextIndex = getNextFreeIndex();
    openCropperFor(selectedFiles[0], nextIndex);
  });
}

function openCropperFor(file, targetIndex = null) {
  const url = URL.createObjectURL(file);
  cropImage.src = url;

  cropModal.style.display = "flex";

  if (cropper) {
    cropper.destroy();
    cropper = null;
  }

  cropImage.onload = () => {
    cropper = new Cropper(cropImage, {
      aspectRatio: 1,
      viewMode: 1,
      autoCropArea: 0.9,
      responsive: true,
    });

    cropModal.dataset.targetIndex =
      typeof targetIndex === "number" ? String(targetIndex) : "";
  };
}

cropNextBtn.addEventListener("click", () => {
  if (!cropper) return;

  const canvas = cropper.getCroppedCanvas({
    maxWidth: 1600,
    maxHeight: 1600,
  });

  canvas.toBlob(
    (blob) => {
      
      const isEdit = editSelectedFiles.length > 0;

      if (isEdit) {
        editNewBlobs.push(blob);
        editSelectedFiles.shift();

        renderEditNewPreviews(); 

        if (editSelectedFiles.length > 0) {
          openEditCropperFor(editSelectedFiles[0]);
        } else {
          editSelectedFiles = [];
          closeCropper();
        }
      } else {
        const idx = getNextFreeIndex();
        croppedBlobs[idx] = blob;
        selectedFiles.shift();

        if (selectedFiles.length > 0) {
          openCropperFor(selectedFiles[0], getNextFreeIndex());
        } else {
          selectedFiles = [];
          closeCropper();
        }

        renderPreviews();
      }
    },
    OUTPUT_FORMAT,
    OUTPUT_QUALITY
  );
});

function closeCropper() {
  cropper.destroy();
  cropper = null;
  cropModal.style.display = "none";
  URL.revokeObjectURL(cropImage.src);
}

cancelCropBtn.addEventListener("click", () => {
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }

  cropModal.style.display = "none";
  URL.revokeObjectURL(cropImage.src);

  selectedFiles = [];
  editSelectedFiles = [];

  if (fileInput) fileInput.value = "";
  if (editFileInput) editFileInput.value = "";
});

/* ===============================
   SUBMIT ADD PRODUCT
================================ */
document.getElementById("addBtn").addEventListener("click", async () => {
  document.getElementById("fileInput").value = "";

  const addBtn = document.getElementById("addBtn");

  //  Proper lock
  addBtn.disabled = true;
  addBtn.innerHTML = "Loading...";

  const productName = document.getElementById("productName").value.trim();
  const teamName = document.getElementById("teamName").value.trim();
  const description = document.getElementById("description").value;
  const categoryName = document.getElementById("seleted-category").value;

  const sizes = ["S", "M", "L", "XL", "XXL"];
  const stock = {};
  const normalPrice = {};
  const basePrice = {};

  sizes.forEach((size) => {
    stock[size] = document.querySelector(`input[name="stock_${size}"]`).value;
    normalPrice[size] = document.querySelector(
      `input[name="normalPrice_${size}"]`
    ).value;
    basePrice[size] = document.querySelector(
      `input[name="basePrice_${size}"]`
    ).value;
  });

  const formData = new FormData();
  formData.append("productName", productName);
  formData.append("teamName", teamName);
  formData.append("description", description);
  formData.append("category", categoryName);
  formData.append("stock", JSON.stringify(stock));
  formData.append("normalPrice", JSON.stringify(normalPrice));
  formData.append("basePrice", JSON.stringify(basePrice));

  croppedBlobs.forEach((blob, idx) => {
    if (!blob) return;
    const file = new File([blob], `image_${idx}.webp`, {
      type: OUTPUT_FORMAT,
    });
    formData.append("images", file);
  });

  try {
    const res = await axios.post("/admin/products/add", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log(res);

    if (res.data.success) {
      toastr.success(res.data.message, "Product added!");
      croppedBlobs = [];
      renderPreviews();

      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  } catch (err) {
    const error = err.response?.data;

    console.log(error?.message);

    toastr.error(error?.message || "Something went wrong", "Failed");

    //  Proper unlock on error
    addBtn.disabled = false;
    addBtn.innerHTML = "Add Product";
  }
});

/* ===============================
   BLOCK / UNBLOCK PRODUCT
================================ */
document.querySelectorAll(".action-btn").forEach((actionBtn) => {
  actionBtn.addEventListener("click", async () => {
    const row = actionBtn.closest(".product-row");
    const productId = row.dataset.id;
    const productStatus = row.querySelector(".status-badge");

    const status =
      productStatus.innerText.trim() === "List" ? "block" : "unblock";

    try {
      const res = await axios.patch(`/admin/products/${status}/${productId}`);

      if (res.data.success) {
        if (status === "block") {
          productStatus.innerText = "Unlist";
          productStatus.classList.replace("active", "inactive");
          actionBtn.classList.replace("block", "list");
          actionBtn.innerHTML = `<i class="fa-solid fa-unlock"></i> List`;
          toastr.error(res.data.message, "Status:");
        } else {
          productStatus.innerText = "List";
          productStatus.classList.replace("inactive", "active");
          actionBtn.classList.replace("list", "block");
          actionBtn.innerHTML = `<i class="fa-solid fa-ban"></i> Block`;
          toastr.success(res.data.message, "Status:");
        }
      }
    } catch (err) {
      const error = err.response?.data;



      console.log(error);


      toastr.error(error.message||"Something went wrong", "Failed");
    }
  });
});

/* ===============================
   EDIT PRODUCT FLOW
================================ */

let editImages = [];

function editModalOpen(e) {
  editNewBlobs = [];
  const btn = e.currentTarget;

  const product = JSON.parse(btn.dataset.product);
  console.log(product);

  const modal = document.getElementById("editModal");
  modal.style.display = "flex";
  body.style.overflow = "hidden";

  document.getElementById("editProductName").value = product.name;
  document.getElementById("teamNameEdit").value = product.teamName;
  document.getElementById("descriptionEdit").value = product.description;

  document.getElementById("edit-category").innerText = btn.dataset.category;
  document.getElementById("edited-seleted-category").value =
    btn.dataset.category;

  const sizes = ["S", "M", "L", "XL", "XXL"];

  const variantMap = {};
  product.variants.forEach((v) => {
    variantMap[v.size] = v;
  });

  sizes.forEach((size) => {
    document.querySelector(
      `#editModal input[name="edit_stock_${size}"]`
    ).value = variantMap[size]?.stock ?? "";

    document.querySelector(
      `#editModal input[name="edit_normalPrice_${size}"]`
    ).value = variantMap[size]?.normal_price ?? "";

    document.querySelector(
      `#editModal input[name="edit_basePrice_${size}"]`
    ).value = variantMap[size]?.base_price ?? "";
  });

  modal.dataset.id = product._id;

  loadEditImages(product.images);
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".edit-btn");
  if (!btn) return;

  editModalOpen({ currentTarget: btn });
});

function loadEditImages(images) {
  const previewContainer = document.getElementById("previewContainerEdit");
  previewContainer.innerHTML = "";

  editImages = [...images];

  images.forEach((imgUrl, index) => {
    const card = document.createElement("div");
    card.style =
      "display:flex; flex-direction:column; align-items:center; gap:6px;";

    const image = document.createElement("img");
    image.src = imgUrl;
    image.style =
      "width:100px; height:100px; object-fit:cover; border-radius:6px;";

    const removeBtn = document.createElement("button");
    removeBtn.className = "btn cancel-btn";
    removeBtn.innerText = "Remove";

    removeBtn.onclick = async () => {
      const productId = document.getElementById("editModal").dataset.id;

      try {
        const res = await axios.patch("/admin/products/remove-image", {
          productId,
          imageUrl: imgUrl,
        });

        if (res.data.success) {
          editImages.splice(index, 1);

          const editBtn = document.querySelector(
            `.product-row[data-id="${productId}"] .edit-btn`
          );

          const productData = JSON.parse(editBtn.dataset.product);
          productData.images = productData.images.filter(
            (img) => img !== imgUrl
          );
          editBtn.dataset.product = JSON.stringify(productData);

          loadEditImages(editImages);

          toastr.success("Image removed");
        } else {
          toastr.error("Failed to remove image");
        }
      } catch (err) {
        toastr.error("Image delete error");
      }
    };

    card.appendChild(image);
    card.appendChild(removeBtn);
    previewContainer.appendChild(card);
  });
}

let editNewBlobs = [];

const editFileInput = document.getElementById("fileInputEdit");

/* SUBMIT EDIT PRODUCT */
async function submitEdit() {
  const productName = document.getElementById("editProductName").value.trim();
  const teamName = document.getElementById("teamNameEdit").value.trim();
  const description = document.getElementById("descriptionEdit").value;
  const categoryName = document.getElementById("edited-seleted-category").value;
  const productId = document.getElementById("editModal").dataset.id;

  const sizes = ["S", "M", "L", "XL", "XXL"];
  const stock = {};
  const normalPrice = {};
  const basePrice = {};

  sizes.forEach((size) => {
    stock[size] = document.querySelector(
      `input[name="edit_stock_${size}"]`
    ).value;
    normalPrice[size] = document.querySelector(
      `input[name="edit_normalPrice_${size}"]`
    ).value;
    basePrice[size] = document.querySelector(
      `input[name="edit_basePrice_${size}"]`
    ).value;
  });

  const formData = new FormData();

  formData.append("productName", productName);
  formData.append("teamName", teamName);
  formData.append("description", description);
  formData.append("category", categoryName);
  formData.append("stock", JSON.stringify(stock));
  formData.append("normalPrice", JSON.stringify(normalPrice));
  formData.append("basePrice", JSON.stringify(basePrice));

  editNewBlobs.forEach((blob, index) => {
    const file =
      blob instanceof File
        ? blob
        : new File([blob], `edit_image_${index}.webp`, {
            type: "image/webp",
          });

    formData.append("images", file);
  });

  for (const [key, value] of formData.entries()) {
    console.log(key, value);
  }

  try {
    const res = await axios.patch(
      `/admin/products/edit/${productId}`,
      formData
    );

    if (res.data.success) {
      toastr.success(res.data.message, "Product updated!");
      editNewBlobs = [];
      editFileInput.value = "";
      setTimeout(() => {
        window.location.reload();
      }, 5000);
    } else {
      toastr.error(res.data.message, "Failed:");
    }
  } catch (err) {
    console.error("UPLOAD ERROR", err);
    toastr.error(err.response?.data?.message || "Error", "Error");
  }
}

let editSelectedFiles = [];
let editCropTargetIndex = null;

if (editFileInput) {
  editFileInput.addEventListener("change", (e) => {
    const incoming = Array.from(e.target.files || []);
    if (incoming.length === 0) return;

    editSelectedFiles = incoming;
    editCropTargetIndex = null; 
    openEditCropperFor(editSelectedFiles[0]);
  });
}

function openEditCropperFor(file) {
  const url = URL.createObjectURL(file);
  cropImage.src = url;
  cropModal.style.display = "flex";

  if (cropper) {
    cropper.destroy();
    cropper = null;
  }

  cropImage.onload = () => {
    cropper = new Cropper(cropImage, {
      aspectRatio: 1,
      viewMode: 1,
      autoCropArea: 0.9,
      responsive: true,
    });
  };
}

function renderEditNewPreviews() {
  const container = document.getElementById("previewContainerEdit");

  editNewBlobs.forEach((blob, index) => {
    const card = document.createElement("div");
    card.style =
      "display:flex; flex-direction:column; align-items:center; gap:6px;";

    const img = document.createElement("img");
    img.src = URL.createObjectURL(blob);
    img.style =
      "width:100px; height:100px; object-fit:cover; border-radius:6px;";

    const removeBtn = document.createElement("button");
    removeBtn.className = "btn cancel-btn";
    removeBtn.innerText = "Remove";
    removeBtn.onclick = () => {
      editNewBlobs.splice(index, 1);
      container.innerHTML = "";
      renderEditNewPreviews();
    };

    card.appendChild(img);
    card.appendChild(removeBtn);
    container.appendChild(card);
  });
}

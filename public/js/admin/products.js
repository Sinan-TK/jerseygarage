/* ROW DROPDOWN */
document.querySelectorAll(".row-arrow").forEach((arrow) => {
  arrow.addEventListener("click", () => {
    const id = arrow.dataset.id;
    const panel = document.getElementById(`drop-${id}`);

    // Close others
    document.querySelectorAll(".dropdown-row").forEach((p) => {
      if (p !== panel) p.style.display = "none";
    });

    document.querySelectorAll(".row-arrow").forEach((a) => {
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

// Add product modal open

const addModal = document.querySelector(".modal-overlay");
const cancelBtn = document.querySelectorAll(".close-btn, .cancel-btn");

document.querySelector(".add-btn").addEventListener("click", () => {
  console.log("active");
  addModal.style.display = "flex";
  document.body.style.overflow = "hidden";
});

cancelBtn.forEach((btn) => {
  btn.addEventListener("click", () => {
    addModal.style.display = "none";
  });
});

addModal.addEventListener("click", (e) => {
  if (e.target === addModal) {
    addModal.style.display = "none";
  }
});

//Category drop

const catDrop = document.querySelector(".categoryDrop");
const options = document.querySelectorAll(".dropdown-cat-options li");
const selected = document.querySelector(".dropdown-cat-selected");
const category = document.getElementById("seleted-category");

category.value = "";

selected.addEventListener("click", () => {
  catDrop.classList.toggle("active");
});

options.forEach((opt) => {
  opt.addEventListener("click", () => {
    selected.textContent = opt.textContent;
    catDrop.classList.remove("active");
    category.value = opt.dataset.value;
  });
});

// close when clicking outside
document.addEventListener("click", (e) => {
  if (!catDrop.contains(e.target)) {
    catDrop.classList.remove("active");
  }
});

// Frontend: product-images.js

const OUTPUT_FORMAT = "image/webp";
const OUTPUT_QUALITY = 0.9;

// State arrays (stable indexing)
let selectedFiles = []; // original File objects selected in current selection cycle (temporary while cropping)
let croppedBlobs = []; // final cropped blobs aligned by index (sparse: null = empty slot)
let nextSlotIndex = 0; // index to place next cropped image

// DOM
const fileInput = document.getElementById("fileInput");
const cropModal = document.getElementById("cropModal");
const cropImage = document.getElementById("cropImage");
const cropNextBtn = document.getElementById("cropNextBtn");
const cancelCropBtn = document.getElementById("cancelCropBtn");
const previewContainer = document.getElementById("previewContainer");

let cropper = null;

/* ---------------------------
  Helpers
----------------------------*/

// find first free slot in croppedBlobs or push to end
function getNextFreeIndex() {
  const idx = croppedBlobs.findIndex((b) => b === undefined || b === null);
  return idx === -1 ? croppedBlobs.length : idx;
}

// render previews from croppedBlobs (stable order)
function renderPreviews() {
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
      // open cropper for existing blob (re-crop)
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
      // remove and re-render
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

/* ---------------------------
  Cropper flow
----------------------------*/

fileInput.addEventListener("change", (e) => {
  const incoming = Array.from(e.target.files || []);
  if (incoming.length === 0) return;

  const existingCount = croppedBlobs.filter(Boolean).length;

  // We'll crop them sequentially
  selectedFiles = incoming;
  // start placing at next free slot(s)
  nextSlotIndex = getNextFreeIndex();
  // open cropper for first selected file
  openCropperFor(selectedFiles[0], nextSlotIndex);
});

function openCropperFor(file, targetIndex = null) {
  // targetIndex: where this cropped blob should be stored
  const url = URL.createObjectURL(file);
  cropImage.src = url;

  // show modal
  cropModal.style.display = "flex";

  // cleanup any existing cropper
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

    // store target index for use after cropping
    cropModal.dataset.targetIndex =
      typeof targetIndex === "number" ? String(targetIndex) : "";
  };
}

cropNextBtn.addEventListener("click", () => {
  if (!cropper) return;

  const canvas = cropper.getCroppedCanvas({ maxWidth: 1600, maxHeight: 1600 });

  canvas.toBlob(
    (blob) => {
      // store blob into the designated index
      const targetIndex = cropModal.dataset.targetIndex
        ? parseInt(cropModal.dataset.targetIndex, 10)
        : getNextFreeIndex();
      croppedBlobs[targetIndex] = blob;

      // cleanup and close
      cropper.destroy();
      cropper = null;
      cropModal.style.display = "none";
      URL.revokeObjectURL(cropImage.src);

      const alreadyCropped = Object.values(croppedBlobs).filter(Boolean).length;

      if (selectedFiles.length > 0) {
        // remove the first (just processed) file from selectedFiles
        selectedFiles.shift();
      }

      if (selectedFiles.length > 0) {
        // next free targetIndex
        const nextIndex = getNextFreeIndex();
        openCropperFor(selectedFiles[0], nextIndex);
      } else {
        // finished batch
        selectedFiles = [];
        cropModal.dataset.targetIndex = "";
      }

      renderPreviews();

      // reset file input so user can select same files again if needed
      fileInput.value = "";
    },
    OUTPUT_FORMAT,
    OUTPUT_QUALITY
  );
});

cancelCropBtn.addEventListener("click", () => {
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
  cropModal.style.display = "none";
  selectedFiles = []; // discard current selection batch
  fileInput.value = "";
});

/* ---------------------------
  Submit product (example)
----------------------------*/
async function submitProduct() {
  // validate min images
  const validCount = croppedBlobs.filter(Boolean).length;

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

  // Prepare formData
  const formData = new FormData();

  formData.append("productName", productName);
  formData.append("teamName", teamName);
  formData.append("description", description);
  formData.append("category", categoryName);
  formData.append("stock", JSON.stringify(stock));
  formData.append("normalPrice", JSON.stringify(normalPrice));
  formData.append("basePrice", JSON.stringify(basePrice));

  // Append cropped blobs in stable order
  croppedBlobs.forEach((blob, idx) => {
    if (!blob) return;
    // name files sequentially to preserve order
    const filename = `image_${idx}.webp`;
    const file = new File([blob], filename, { type: OUTPUT_FORMAT });
    formData.append("images", file); // backend expects field name "images"
  });

  try {
    const res = await axios.post("/admin/products/add", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (res.data.success) {
      toastr.success(res.data.message, "Product added!");
      // reset UI
      croppedBlobs = [];
      renderPreviews();
      // optionally close modal...
      setTimeout(() => {
        window.location.reload();
      }, 5000);
    } else {
      toastr.error(res.data.message, "Failed:");
    }
  } catch (err) {
    console.error("UPLOAD ERROR", err);
    toastr.error(err.response.data.message, "Error");
  }
}

// block and unblock the product
const actionBtn = document.querySelector(".action-btn");

actionBtn.addEventListener("click", async () => {
  const productStatus = document.querySelector(".status-badge");
  const productId = document.querySelector(".product-row").dataset.id;
  const status = productStatus.innerText === "List" ? "block" : "unblock";
  console.log(status);
  console.log(productStatus.innerText);
  console.log(productId);

  try {
    const res = await axios.patch(`/admin/products/${status}/${productId}`);

    if (res.data.success) {
      if (status === "block") {
        productStatus.innerText = "Unlist";
        productStatus.classList.replace("active","inactive");
        actionBtn.classList.replace("block","list");
        productStatus.classList.replace("active","inactive");
        actionBtn.innerHTML = `<i class="fa-solid fa-unlock"></i> List`;


        toastr.error(res.data.message,"Status:");
      }else{
        productStatus.innerText = "List";
        productStatus.classList.replace("inactive","active");
        actionBtn.classList.replace("list","block");
        productStatus.classList.replace("inactive","active");
        actionBtn.innerHTML = `<i class="fa-solid fa-ban"></i> Block`;

        toastr.success(res.data.message,"Status:");
      }

    } else {
    }
  } catch (err) {
    toastr.error(err, "Error");
  }
});

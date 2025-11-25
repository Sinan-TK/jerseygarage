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

/* -------------------------
   CROP SYSTEM VARIABLES
------------------------- */
let cropper = null;
let currentIndex = 0;

let selectedFiles = []; // original files chosen
let croppedImages = []; // final cropped blobs

const fileInput = document.getElementById("fileInput");
const cropModal = document.getElementById("cropModal");
const cropImage = document.getElementById("cropImage");
const cropNextBtn = document.getElementById("cropNextBtn");
const cancelCropBtn = document.getElementById("cancelCropBtn");
const previewContainer = document.getElementById("previewContainer");

/* -------------------------
   IMAGE SELECTED → OPEN FIRST CROP
------------------------- */
fileInput.addEventListener("change", (e) => {
  const maxImages = 5;

  const existingCount = croppedImages.filter(Boolean).length;
  const selectedCount = e.target.files.length;

  if (existingCount + selectedCount > maxImages) {
    toastr.error(`You can only upload ${maxImages} images total.`, "Failed");
    fileInput.value = "";
    return;
  }

  selectedFiles = Array.from(e.target.files);
  currentIndex = 0;
  openCropperFor(selectedFiles[currentIndex]);
});

/* -------------------------
   OPEN CROPPER FOR FILE
------------------------- */
function openCropperFor(file) {
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
    });
  };
}

/* -------------------------
   AFTER CROPPING → SAVE + PREVIEW
------------------------- */
cropNextBtn.addEventListener("click", () => {
  if (!cropper) return;

  const canvas = cropper.getCroppedCanvas({
    maxWidth: 1600,
    maxHeight: 1600,
  });

  canvas.toBlob((blob) => {
    croppedImages[currentIndex] = blob;
    addPreview(blob, currentIndex);

    cropper.destroy();
    cropper = null;
    cropModal.style.display = "none";

    currentIndex++;

    if (currentIndex < selectedFiles.length) {
      openCropperFor(selectedFiles[currentIndex]);
    }

    // Allow selecting more images later
    fileInput.value = "";
  });
});

/* -------------------------
   CANCEL CROP
------------------------- */
cancelCropBtn.addEventListener("click", () => {
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }

  cropModal.style.display = "none";
});

/* -------------------------
   ADD PREVIEW WITH BUTTONS
------------------------- */
function addPreview(blob, index) {
  const url = URL.createObjectURL(blob);

  const wrapper = document.createElement("div");
  wrapper.style = `
    display:flex;
    flex-direction:column;
    align-items:center;
    gap:6px;
  `;
  wrapper.dataset.index = index;

  const img = document.createElement("img");
  img.src = url;
  img.style = `
    width:100px;
    height:100px;
    object-fit:cover;
    border-radius:6px;
  `;

  /* ----- RE-CROP BUTTON ----- */
  const recropBtn = document.createElement("button");
  recropBtn.textContent = "Re-Crop";
  recropBtn.className = "btn";
  recropBtn.style =
    "padding:4px 8px; font-size:12px;border: 1px solid black;color: black;background:white; border-radius:3px";

  recropBtn.addEventListener("mouseover", () => {
    recropBtn.style.backgroundColor = "black";
    recropBtn.style.color = "white";
  });

  recropBtn.addEventListener("mouseout", () => {
    recropBtn.style.backgroundColor = "white";
    recropBtn.style.color = "black";
  });

  recropBtn.addEventListener("click", () => {
    currentIndex = index;
    openCropperFor(new File([blob], "recrop.jpg")); // open current cropped blob again
  });

  /* ----- REMOVE BUTTON ----- */
  const removeBtn = document.createElement("button");
  removeBtn.textContent = "Remove";
  removeBtn.className = "btn cancel-btn";
  removeBtn.style =
    "padding:4px 8px; font-size:12px;border: 1px solid black;color: black;background:white; border-radius:3px";

  removeBtn.addEventListener("mouseover", () => {
    removeBtn.style.backgroundColor = "black";
    removeBtn.style.color = "white";
  });

  removeBtn.addEventListener("mouseout", () => {
    removeBtn.style.backgroundColor = "white";
    removeBtn.style.color = "black";
  });

  removeBtn.addEventListener("click", () => {
    wrapper.remove();
    croppedImages[index] = null; // mark deleted
  });

  wrapper.appendChild(img);
  wrapper.appendChild(recropBtn);
  wrapper.appendChild(removeBtn);

  previewContainer.appendChild(wrapper);
}

//----------------------------------------------------------//
//add product axious//
//---------------------------------------------------------//

async function submitProduct() {
  const productName = document.getElementById("productName").value.trim();
  const teamName = document.getElementById("teamName").value.trim();
  const description = document.getElementById("description").value;
  const categoryName = category.value;
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
  formData.append("stock",stock);
  formData.append("normalPrice",normalPrice);
  formData.append("basePrice",basePrice);

  // add stock + price fields here if needed
  // formData.append("stock_S", stock["S"])

  // Append ONLY existing blobs
  croppedImages.forEach((blob, index) => {
    if (blob) {
      const file = new File([blob], `image_${index}.jpg`, {
        type: "image/jpeg",
      });
      formData.append("images", file);
    }
  });
  try {
    const res = await axios.post(`/admin/products/add`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if(res.data.success){
      toastr.success(res.data.message,"Success");
    }else{
      toastr.error(res.data.message,"Failed");
    }
  } catch (err) {

    console.log(err,"something went wrong!!");
  }
}

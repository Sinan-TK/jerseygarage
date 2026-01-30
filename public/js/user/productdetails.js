/* ===============================
   PRODUCT IMAGE SWITCH
================================ */
const mainImg = document.querySelector(".main-img");
const thumbs = document.querySelectorAll(".thumbs img");

thumbs.forEach((thumb) => {
  thumb.addEventListener("click", () => {
    mainImg.src = thumb.src;

    // reset zoom
    mainImg.style.transform = "scale(1)";
    mainImg.style.transformOrigin = "center";

    // active thumb
    thumbs.forEach((t) => t.classList.remove("active"));
    thumb.classList.add("active");
  });
});

/* ===============================
   IMAGE ZOOM (DESKTOP ONLY)
================================ */
const container = document.querySelector(".img-zoom-container");
const zoomLevel = 1.6;

if (window.innerWidth > 768) {
  container.addEventListener("mousemove", (e) => {
    const rect = container.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    mainImg.style.transformOrigin = `${x}% ${y}%`;
    mainImg.style.transform = `scale(${zoomLevel})`;
  });

  container.addEventListener("mouseleave", () => {
    mainImg.style.transform = "scale(1)";
    mainImg.style.transformOrigin = "center";
  });
}

/* ===============================
   SIZE SELECTION & PRICE UPDATE
================================ */
const sizeButtons = document.querySelectorAll(".size-btn");
const normalPriceEl = document.getElementById("normalPrice");
const basePriceEl = document.getElementById("basePrice");
const stock = document.getElementById("stock");
const sizeDiv = document.querySelector(".sizes");
const variants = JSON.parse(decodeURIComponent(sizeDiv.dataset.variants));
const active = sizeDiv.dataset.active;

sizeButtons.forEach((btn) => {
  const size = btn.dataset.size;
  const variant = variants.find((v) => v.size === size && v.is_available);

  if (active === "false") {
    btn.disabled = true;
    btn.classList.add("disabled");
    btn.classList.remove("active");
    return;
  }

  // disable unavailable sizes
  if (!variant) {
    btn.disabled = true;
    btn.classList.add("disabled");
    return;
  }

  // click handler
  btn.addEventListener("click", () => {
    normalPriceEl.textContent = `₹${variant.normal_price}`;
    basePriceEl.textContent = `₹${variant.base_price}`;
    stock.textContent = `Only ${variant.stock} left in stock`;

    sizeButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

const qtyInput = document.getElementById("quantity");
const plusBtn = document.getElementById("qty-plus");
const minusBtn = document.getElementById("qty-minus");

plusBtn.addEventListener("click", () => {
  qtyInput.value = parseInt(qtyInput.value) + 1;
});

minusBtn.addEventListener("click", () => {
  if (parseInt(qtyInput.value) > 1) {
    qtyInput.value = parseInt(qtyInput.value) - 1;
  }
});

// Prevent manual invalid values
qtyInput.addEventListener("input", () => {
  if (qtyInput.value < 1 || qtyInput.value === "") {
    qtyInput.value = 1;
  }
});

// const buyBtn = document.querySelector(".buy-btn");

// buyBtn.addEventListener("click", async () => {
//   const product_id = buyBtn.dataset.productId;
//   const quantity = document.getElementById("quantity").value.trim();

//   let variant_id = null;

//   sizeButtons.forEach((size) => {
//     if (size.classList.contains("active")) {
//       variant_id = size.dataset.variantId;
//     }
//   });

//   console.log(product_id, variant_id, quantity);

//   try {
//     const res = await axios.post("/user/buy-now", {
//       product_id,
//       variant_id,
//       quantity,
//     });

//     if (res.data.success) {
//       window.location.href = res.data.redirect;
//     }
//   } catch (err) {
//     const error = err.response?.data;

//     toastr.error(error?.message, "Error!!");
//   }
// });

const wishlistBtn = document.querySelector(".wish-btn");

wishlistBtn.addEventListener("click", async (e) => {
  e.preventDefault(); // stops link navigation
  e.stopPropagation(); // stops bubbling

  let variantId = null;

  sizeButtons.forEach((size) => {
    if (size.classList.contains("active")) {
      variantId = size.dataset.variantId;
    }
  });

  try {
    const res = await axios.post(`/user/wishlist`, { variantId });

    if (res.data.data) {
      toastr.success(res.data.message, "Added!!");
      wishlistBtn.classList.replace("isWishlistedFalse", "isWishlistedTrue");
    } else {
      toastr.success(res.data.message, "Removed!!");
      wishlistBtn.classList.replace("isWishlistedTrue", "isWishlistedFalse");
    }
  } catch (err) {
    const error = err.response?.data;

    toastr.error(error?.message, "Error!!");

    if (error.redirect) {
      setTimeout(() => {
        window.location.href = error.redirect;
      }, 1000);
    }
  }
});

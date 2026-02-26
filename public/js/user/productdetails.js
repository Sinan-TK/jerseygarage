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
    normalPriceEl.textContent = `₹${variant.offer_price? variant.base_price : variant.normal_price}`;
    basePriceEl.textContent = `₹${variant.offer_price? variant.offer_price :variant.base_price}`;
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

document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".add-to-cart-btn");

  if (!btn) return; // Not add-to-cart

  e.preventDefault();
  e.stopPropagation();

  const product_id = btn.dataset.product;
  const variant_id = btn.dataset.variant;
  const quantity = 1;

  console.log(product_id, variant_id, quantity);

  try {
    const res = await axios.post("/user/add-to-cart", {
      product_id,
      variant_id,
      quantity,
    });

    if (res.data.success) {
      toastr.success(res.data.message, "Success");

      document.querySelector(".cart-count").innerText =
        res.data.data.items_count;
    }
  } catch (err) {
    const error = err.response?.data;
    toastr.error(error?.message || "Something went wrong", "Failed");

    setTimeout(() => {
      if (error?.redirect) {
        window.location.href = error.redirect;
      }
    }, 1000);
  }
});

const cartBtn = document.getElementById("cartBtn");

cartBtn.addEventListener("click", async () => {
  const product_id = cartBtn.dataset.product;
  // const variant_id = cartBtn.dataset.variant;

  let variant_id = null;

  sizeButtons.forEach((size) => {
    if (size.classList.contains("active")) {
      variant_id = size.dataset.variantId;
    }
  });

  const quantity = document.getElementById("quantity").value.trim();

  console.log(product_id, variant_id, quantity);

  try {
    const res = await axios.post("/user/add-to-cart", {
      product_id,
      variant_id,
      quantity,
    });

    if (res.data.success) {
      toastr.success(res.data.message, "Success");

      document.querySelector(".cart-count").innerText =
        res.data.data.items_count;
    }
  } catch (err) {
    const error = err.response?.data;
    toastr.error(error?.message || "Something went wrong", "Failed");

    setTimeout(() => {
      if (error?.redirect) {
        window.location.href = error.redirect;
      }
    }, 1000);
  }
});

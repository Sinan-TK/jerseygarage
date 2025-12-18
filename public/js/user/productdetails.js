/* ===============================
   PRODUCT IMAGE SWITCH
================================ */
const mainImg = document.querySelector(".main-img");
const thumbs = document.querySelectorAll(".thumbs img");

thumbs.forEach(thumb => {
  thumb.addEventListener("click", () => {
    mainImg.src = thumb.src;

    // reset zoom
    mainImg.style.transform = "scale(1)";
    mainImg.style.transformOrigin = "center";

    // active thumb
    thumbs.forEach(t => t.classList.remove("active"));
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

sizeButtons.forEach(btn => {
  const size = btn.dataset.size;
  const variant = variants.find(v => v.size === size && v.is_available);

  if(!active){
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

    sizeButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

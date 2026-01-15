// dropdown logic (only for Categories and Teams now)
function toggleDD(id) {
  document.getElementById(id).classList.toggle("open");
}

// Ensure Categories and Teams are closed on load
document.addEventListener("DOMContentLoaded", () => {
  const dropdowns = ["catDD", "teamDD"];
  dropdowns.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.classList.remove("open");
    }
  });
});

document.querySelector(".btn-clear").addEventListener("click", () => {
  const options = ["categories", "team", "size"];

  options.forEach((name) => {
    document.querySelectorAll(`input[name="${name}"]`).forEach((cb) => {
      cb.checked = false;
    });
  });

  document.getElementById("minRange").value = 0;
  document.getElementById("maxRange").value = 2000;
  updatePrice();
});

// double slider price logic
const minRange = document.getElementById("minRange");
const maxRange = document.getElementById("maxRange");
const priceDisplay = document.getElementById("priceDisplay");
const rangeGap = 100; // Minimum gap between handles

function updatePrice() {
  let minVal = parseInt(minRange.value);
  let maxVal = parseInt(maxRange.value);

  // Ensure min slider is not greater than max slider, maintaining gap
  if (minVal >= maxVal - rangeGap) {
    minVal = maxVal - rangeGap;
    if (minVal < minRange.min) minVal = parseInt(minRange.min);
    minRange.value = minVal;
  }

  // Ensure max slider is not less than min slider, maintaining gap
  if (maxVal <= minVal + rangeGap) {
    maxVal = minVal + rangeGap;
    if (maxVal > maxRange.max) maxVal = parseInt(maxRange.max);
    maxRange.value = maxVal;
  }

  priceDisplay.textContent = `₹${minRange.value} - ₹${maxRange.value}`;
}

// Initial call to set the display text
updatePrice();

minRange.addEventListener("input", updatePrice);
maxRange.addEventListener("input", updatePrice);

const sortDropdown = document.getElementById("sortDropdown");
const selected = sortDropdown.querySelector(".dropdown-selected");
const options = sortDropdown.querySelectorAll(".dropdown-options li");

// Toggle dropdown
selected.addEventListener("click", (e) => {
  e.stopPropagation();
  sortDropdown.classList.toggle("active");
});

// Select option
options.forEach((option) => {
  option.addEventListener("click", () => {
    selected.innerHTML = `${option.textContent} <i class="fa-solid fa-caret-down"></i>`;
    selected.dataset.value = option.dataset.value;
    sortDropdown.classList.remove("active");
  });
});

// Close on outside click
document.addEventListener("click", () => {
  sortDropdown.classList.remove("active");
});

function getCheckedValue(name) {
  const checked = document.querySelector(`input[name="${name}"]:checked`);
  return checked ? checked.value : null;
}

document.querySelector(".btn-apply").addEventListener("click", () => {
  const category = getCheckedValue("categories") || "";
  const team = getCheckedValue("team") || "";
  const size = getCheckedValue("size") || "";
  // const sort = document.querySelector(".dropdown-selected").value||"";
  const minRange = document.getElementById("minRange").value;
  const maxRange = document.getElementById("maxRange").value;

  const page = document.querySelector(".current-page-display").innerHTML.trim();

  // fill hidden inputs
  document.getElementById("f-category").value = category;
  document.getElementById("f-team").value = team;
  document.getElementById("f-size").value = size;
  document.getElementById("f-minRange").value = minRange;
  document.getElementById("f-maxRange").value = maxRange;
  document.getElementById("f-sort").value = selected.dataset.value || "";
  document.getElementById("f-page").value = page;

  console.log(page);

  // submit form (GET → page reload → EJS re-render)
  document.getElementById("filterForm").submit();
});

options.forEach((option) => {
  option.addEventListener("click", () => {
    // update UI
    selected.innerHTML = `${option.textContent} <i class="fa-solid fa-caret-down"></i>`;
    selected.dataset.value = option.dataset.value;

    // set hidden input
    document.getElementById("f-sort").value = option.dataset.value;
    document.getElementById("f-category").value =
      getCheckedValue("categories") || "";
    document.getElementById("f-team").value = getCheckedValue("team") || "";
    document.getElementById("f-size").value = getCheckedValue("size") || "";
    document.getElementById("f-minRange").value =
      document.getElementById("minRange").value;
    document.getElementById("f-maxRange").value =
      document.getElementById("maxRange").value;

    // close dropdown
    sortDropdown.classList.remove("active");

    document.getElementById("filterForm").submit();
  });
});

// document.querySelectorAll(".product-item").forEach((item) => {
//   item.addEventListener("click", () => {
//     console.log(item.dataset.id);
//   });
// });

const wishlistBtn = document.querySelectorAll(".wishlist-btn");

wishlistBtn.forEach((btn) => {
  btn.addEventListener("click", async (e) => {
    e.preventDefault(); // stops link navigation
    e.stopPropagation(); // stops bubbling

    const variantId = btn.dataset.varient;

    console.log(variantId);

    try {
      const res = await axios.post(`/user/wishlist`, { variantId });

      if (res.data.data) {
        toastr.success(res.data.message, "Added!!");
        btn.classList.replace("isWishlistedFalse", "isWishlistedTrue");
      } else {
        toastr.success(res.data.message, "Removed!!");
        btn.classList.replace("isWishlistedTrue", "isWishlistedFalse");
      }
    } catch (err) {
      const error = err.response?.data;

      toastr.error(error?.message, "Error!!");
    }
  });
});


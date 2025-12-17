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

    console.log("Selected sort:", option.dataset.value);
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

//filter
document.querySelector(".btn-apply").addEventListener("click", async () => {
  const category = getCheckedValue("categories") || "";
  const team = getCheckedValue("team") || "";
  const size = getCheckedValue("size") || "";
  const minRange = document.getElementById("minRange").value;
  const maxRange = document.getElementById("maxRange").value;

  try {
    const res = await axios.get("/shop", {
      params: {
        category,
        team,
        size,
        minRange,
        maxRange,
      },
    });
  } catch (err) {
    console.log(err);
  }
});

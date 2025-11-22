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

window.loadFilter = async function (page = 1) {
  const category = getSelectedValue("categories");
  const team = getSelectedValue("team");
  const size = getSelectedValue("size");
  const minRange = document.getElementById("minRange").value;
  const maxRange = document.getElementById("maxRange").value;

  const res = await axios.get(`/shop/data`, {
    params: { category, team, size, minRange, maxRange, sort, page },
  });

  const user = res.data.data.user;
  const products = res.data.data.products;
  const wishlist = res.data.data.wishlist;

  if (products.length === 0) {
    document.querySelector(".shop-body").innerHTML = noProducts();
  } else {
    document.querySelector(".shop-grid").innerHTML = products
      .map((product) => loadProducts(product, user, wishlist))
      .join("");

    document.querySelector(".pagination").innerHTML = pagination(
      res.data.data.pagination
    );
  }
};

function noProducts() {
  return `
    <div class="no-products">
      <h2>No Products Found</h2>
      <p>Try adjusting your filters or search criteria.</p>
    </div>
  `;
}

function loadProducts(product, user, wishlist) {
  const variant = product.variants[0];
  let wishlisted = false;
  if (user && wishlist && variant) {
    wishlisted = wishlist.items.some(
      (item) => item.variant_id.toString() === variant._id.toString()
    );
  }

  return `
    <div class="product-item">
    ${
      user
        ? `
  <div class="product-actions">
    <button
      data-variant="${variant._id}"
      class="wishlist-btn ${
        wishlisted ? `isWishlistedTrue` : `isWishlistedFalse`
      }"
      title="Add to Wishlist">
      <i class="fa-regular fa-heart"></i>
    </button>
  </div>
`
        : ""
    }
            <a href="/product/${product._id}">
                <img src="${product.images[0]}" alt="${product.name}">

                <div class="product-details">
                    <p class="product-name">
                        ${product.name}
                    </p>

                    <div class="price-section">
                        <p class="product-price-normal">
                            ₹${variant.normal_price}
                        </p>
                        <p class="product-price-base">
                                ₹${variant.base_price}
                        </p>
                    </div>

                    <button class="add-to-cart-btn">
                        <i class="fa-solid fa-cart-shopping"></i>
                        Add to Cart
                    </button>
                </div>
            </a>
    </div>
        `;
}

function pagination(data) {
  const backward = data.currentPage > 1 ? true : false;
  const forward = data.currentPage < data.totalPages ? true : false;
  return `${
    backward
      ? `<button onclick="loadFilter(${
          data.currentPage - 1
        })" class="arrow-btn">
      <i class="fa-solid fa-chevron-left"></i>
  </button>`
      : ""
  }

  <span class="current-page-display">
      ${data.currentPage}
  </span>
    ${
      forward
        ? `<button onclick="loadFilter(${
            data.currentPage + 1
          })" class="arrow-btn">
      <i class="fa-solid fa-chevron-right"></i>
  </button>`
        : ""
    }`;
}

document.addEventListener("DOMContentLoaded", () => {
  loadFilter();

  // Ensure Categories and Teams are closed on load
  const dropdowns = ["catDD", "teamDD"];
  dropdowns.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.classList.remove("open");
    }
  });
});

function toggleDD(id) {
  document.getElementById(id).classList.toggle("open");
}

const sortDropdown = document.getElementById("sortDropdown");
const selected = sortDropdown.querySelector(".dropdown-selected");
const options = sortDropdown.querySelectorAll(".dropdown-options li");

let sort = "all";

// Toggle dropdown
selected.addEventListener("click", (e) => {
  e.stopPropagation();
  sortDropdown.classList.toggle("active");
});

// Select option
options.forEach((option) => {
  option.addEventListener("click", () => {
    sort = option.dataset.value;
    selected.innerHTML = `${option.textContent} <i class="fa-solid fa-caret-down"></i>`;
    selected.dataset.value = option.dataset.value;
    sortDropdown.classList.remove("active");
    loadFilter();
  });
});

document.querySelector(".btn-apply").addEventListener("click", () => {
  loadFilter();
});

function getSelectedValue(item) {
  const selected = document.querySelector(`input[name="${item}"]:checked`);
  return selected ? selected.value : "";
}

const minRange = document.getElementById("minRange");
const maxRange = document.getElementById("maxRange");
const priceDisplay = document.getElementById("priceDisplay");

const MIN_GAP = 100;

// initial values
minRange.value = 0;
maxRange.value = 2000;
priceDisplay.textContent = `₹${minRange.value} - ₹${maxRange.value}`;

minRange.addEventListener("input", () => {
  if (Number(maxRange.value) - Number(minRange.value) < MIN_GAP) {
    minRange.value = Number(maxRange.value) - MIN_GAP;
  }
  updatePrice();
});

maxRange.addEventListener("input", () => {
  if (Number(maxRange.value) - Number(minRange.value) < MIN_GAP) {
    maxRange.value = Number(minRange.value) + MIN_GAP;
  }
  updatePrice();
});

function updatePrice() {
  priceDisplay.textContent = `₹${minRange.value} - ₹${maxRange.value}`;
}

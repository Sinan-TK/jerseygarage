window.loadFilter = async function (page = 1, search = "") {
  const params = new URLSearchParams(window.location.search);

  const category = getSelectedValue("categories") || params.get("category");
  const team = getSelectedValue("team") || params.get("team");
  const size = getSelectedValue("size") || params.get("size");
  const minRange = document.getElementById("minRange").value;
  const maxRange = document.getElementById("maxRange").value;

  const res = await axios.get(`/shop/data`, {
    params: { category, team, size, minRange, maxRange, sort, page, search },
  });

  const user = res.data.data.user;
  const products = res.data.data.products;
  const wishlist = res.data.data.wishlist;
  const offers = res.data.data.offers;

  if (products.length === 0) {
    document.querySelector(".shop-body").innerHTML = noProducts();
    document.querySelector(".shop-grid").innerHTML = "";
    document.querySelector(".pagination").innerHTML = "";
  } else {
    document.querySelector(".shop-body").innerHTML = "";
    document.querySelector(".shop-grid").innerHTML = products
      .map((product) => loadProducts(product, user, wishlist, offers))
      .join("");

    document.querySelector(".pagination").innerHTML = pagination(
      res.data.data.pagination,
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

function loadProducts(product, user, wishlist, offers) {
  const variant = product.variants[0];
  let wishlisted = false;
  const applicableOffers = [];

  for (let i = 0; i < offers.length; i++) {
    const offer = offers[i];

    if (
      offer.offerApplyType === "product" &&
      offer.productIds &&
      offer.productIds.find(function (id) {
        return id.toString() === product._id.toString();
      })
    ) {
      applicableOffers.push(offer);
      continue;
    }
    if (
      offer.offerApplyType === "category" &&
      offer.categoryIds &&
      offer.categoryIds.find(function (id) {
        return id.toString() === product.category.toString();
      })
    ) {
      applicableOffers.push(offer);
    }
  }

  if (user && wishlist && variant) {
    wishlisted = wishlist.items.some(
      (item) => item.variant_id.toString() === variant._id.toString(),
    );
  }


  return `
    <div class="product-item">

    ${
      applicableOffers.length !== 0
        ? `
    <div class="offer-div">
      <span>Offer</span>
    </div>
  `
        : ""
    }

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

                    <button class="add-to-cart-btn" data-variant="${variant._id}" data-product="${product._id}">
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

document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".add-to-cart-btn");

  if (!btn) return; // Not add-to-cart

  e.preventDefault();
  e.stopPropagation();

  const product_id = btn.dataset.product;
  const variant_id = btn.dataset.variant;
  const quantity = 1;

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

document.getElementById("search-apply").addEventListener("click", () => {
  const search = document.getElementById("search").value;
  loadFilter(1, search);
});

document.querySelector(".clear-btn").addEventListener("click", () => {
  document.getElementById("search").value = "";
  loadFilter(1, "");
});

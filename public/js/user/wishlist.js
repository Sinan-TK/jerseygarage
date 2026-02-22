document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".remove-btn");
  if (!btn) return;

  e.preventDefault();
  e.stopPropagation();

  const id = btn.dataset.item;

  try {
    const res = await axios.delete(`/user/wishlist/${id}`);

    if (res.data.success) {
      toastr.success(res.data.message, "Removed!!");
      loadData();
    }
  } catch (err) {
    const error = err.response?.data;

    toastr.error(error?.message || "something went wrong", "Error!!");

    if (error?.redirect) {
      setTimeout(() => {
        window.location.href = error.redirect;
      }, 1500);
    }
  }
});

// const addToCart = document.querySelectorAll(".add-to-cart-btn");

document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".add-to-cart-btn");
  if (!btn) return;

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
        `${res.data.data.items_count}`;
      loadData();
    }
  } catch (err) {
    const error = err.response?.data;

    toastr.error(error?.message || "Something went wrong", "Error!!");
  }
});

loadData();

async function loadData() {
  try {
    const res = await axios.get("/user/wishlist/data");
    document.getElementById("items-count").innerHTML =
      `${res.data.data.length}`;
    wishlistCards(res.data.data);
  } catch (err) {
    const error = err.response?.data;

    toastr.error(error?.message || "Somehting went wrong", "Error!!");
  }
}

const wishlistGrid = document.querySelector(".wishlist-grid");

function wishlistCards(products) {
  wishlistGrid.innerHTML = "";
  if (products.length === 0) {
    const empty = document.querySelector(".empty-wishlist");
    empty.style.display = "flex";
    return;
  }

  products.forEach((product) => {
    const card = document.createElement("div");
    card.className = "wishlist-card";
    card.innerHTML = `
        <button class="remove-btn" data-item="${product.variant_id._id}">×</button>
        <a href="/product/${product.variant_id.product_id._id}">
        <div class="product-img"><img src="${product.variant_id.product_id.images[0]}"></div>
        </a>
        <div class="product-info">
          <h4>
            ${product.variant_id.product_id.name}
          </h4>
          <p class="variant">Size: ${product.variant_id.size}
          </p>
          <p class="price">₹${product.variant_id.base_price}
          </p>
        </div>

        <button data-variant="${product.variant_id._id}" data-product="${product.variant_id.product_id._id}"  class="cart-btn add-to-cart-btn">Add to Cart</button>
        `;
    wishlistGrid.appendChild(card);
  });
}

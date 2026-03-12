const wishlistBtn = document.querySelectorAll(".wishlist-btn");

wishlistBtn.forEach((btn) => {
  btn.addEventListener("click", async (e) => {
    e.preventDefault(); // stops link navigation
    e.stopPropagation(); // stops bubbling

    const variantId = btn.dataset.variant;

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
      console.error(error);
      toastr.error(error?.message, "Error!!");
    }
  });
});

const addToCart = document.querySelectorAll(".add-to-cart-btn");

addToCart.forEach((btn) => {
  btn.addEventListener("click", async (e) => {
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
      }
    } catch (err) {
      const error = err.response?.data;

      toastr.error(error.message, "Error!!");
    }
  });
});

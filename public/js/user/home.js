document.querySelectorAll(".product-item").forEach((item) => {
  item.addEventListener("click", () => {
    console.log(item.dataset.id);
  });
});

const wishlistBtn = document.querySelectorAll(".wishlist-btn");

wishlistBtn.forEach((btn) => {
  btn.addEventListener("click", async (e) => {
    e.preventDefault(); // stops link navigation
    e.stopPropagation(); // stops bubbling

    const variantId = btn.dataset.varient;

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

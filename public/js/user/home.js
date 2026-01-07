document.querySelectorAll(".product-item").forEach((item) => {
  item.addEventListener("click", () => {
    console.log(item.dataset.id);
  });
});

const wishlistBtn = document.querySelectorAll(".wishlist-btn");

wishlistBtn.forEach((btn) => {
  btn.addEventListener("click", async(e) => {
    e.preventDefault();   // stops link navigation
    e.stopPropagation();  // stops bubbling

    const productId = btn.dataset.productId;
    console.log(productId);

    try {
      const res = await axios.post(`/user/wishlist/${productId}`);

      toastr.success(res);

    } catch (err) {
      const error = err.response?.data;
      console.log(error);

      toastr.error(error?.message,"Sorry!")
    }

  });
});

console.log(res);

document.querySelectorAll(".remove-btn").forEach((btn) => {
  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    console.log(btn.dataset.item);
    const id = btn.dataset.item;

    try {
      const res = await axios.patch(`/user/wishlist/${id}`);

      if (res.data.success) {
        toastr.success(res.data.message, "Removed!!");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (err) {
      const error = err.response?.data;

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
        document.querySelector(".cart-count").innerText = `${res.data.data.items_count}`;
      }
    } catch (err) {
      const error = err.response?.data;

      toastr.error(error.message, "Error!!");
    }
  });
});
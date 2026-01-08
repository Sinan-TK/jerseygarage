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

document.getElementById("shop").addEventListener("click", () => {
  location.href = "/shop";
});

document.getElementById("orderDetails").addEventListener("click", () => {
  const id = document.querySelector(".order-info").dataset.id;
  location.href = `/user/orders/${id}`;
});

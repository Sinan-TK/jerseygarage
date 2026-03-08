function renderOrders(orders) {
  const container = document.getElementById("orderList");

  if (orders.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:40px; color:#6b7280;">
        No orders found
      </div>
    `;
    return;
  }

  container.innerHTML = orders
    .map(
      (order) => `
    <div class="order-card">
      <div class="order-left">
        <h4>${order.orderId}</h4>
        <p class="order-date">Placed on ${new Date(
          order.createdAt,
        ).toLocaleDateString("en-US", {
          month: "long",
          day: "2-digit",
          year: "numeric",
        })}</p>
        <p class="order-items">${order.products.length} items • ₹${order.totalPrice}</p>
      </div>
      <div class="order-right">
        <span class="status status-${order.orderStatus}">${order.orderStatus}</span>
        <a href="/user/orders/${order._id}" class="order-link">View Details</a>
      </div>
    </div>
  `,
    )
    .join("");
}
loadOrders();

async function loadOrders(page = 1) {
  try {
    const res = await axios.get("/user/orders/data", { params: { page } });
    renderOrders(res.data.data.orders);
    pagination(res.data.data.pagination);
  } catch (err) {
    const error = err.response?.data;
    console.error(error);
    toastr.error(error?.message || "Something went wrong", "Failed");
  }
}

function pagination(pagination) {
  const { page, totalPages, totalDocuments, limit } = pagination;

  const from = totalDocuments === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, totalDocuments);

  document.getElementById("paginationInfo").textContent =
    totalDocuments === 0
      ? "No orders found"
      : `Showing ${from}–${to} of ${totalDocuments} orders`;

  document.getElementById("pagination").innerHTML = `
    ${
      page > 1
        ? `<button class="arrow-btn" onclick="loadOrders(${page - 1})">
           <i class="fa-solid fa-chevron-left"></i>
         </button>`
        : ""
    }
    <span class="current-page-display">${page}</span>
    ${
      page < totalPages
        ? `<button class="arrow-btn" onclick="loadOrders(${page + 1})">
           <i class="fa-solid fa-chevron-right"></i>
         </button>`
        : ""
    }
  `;
}

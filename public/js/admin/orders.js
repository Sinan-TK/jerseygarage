const tableBody = document.getElementById("orderTableBody");

/* Render Orders */

function renderOrders(data) {
  tableBody.innerHTML = "";

  data.orders.forEach((order) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${order.orderId}</td>
      <td>${order.user_id.full_name}</td>
      <td>${formatDate(order.createdAt)}</td>
      <td>${formatDate(order.updatedAt)}</td>

      <td>
        <span class="status status-${order.orderStatus}">
          ${capitalize(order.orderStatus)}
        </span>
      </td>

      <td>₹${order.totalPrice}</td>
      <td>${order.products.length}</td>

      <td>
        <span class="payment">
          ${order.paymentMethod.toUpperCase()}
        </span>
      </td>

      <td>
        <a href="/admin/orders/details/${order._id}" class="action-link">View Details</a>
      </td>
    `;

    tableBody.appendChild(row);
  });

  document.querySelector(".pagination").innerHTML = pagination(data.pagination);
}

/* Helpers */

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatDate(dateStr) {
  const date = new Date(dateStr);

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/* Filters */
async function loadFilter(page) {
  const search = document.getElementById("searchOrder").value.toLowerCase();
  const status = document.getElementById("statusFilter").value;
  const payment = document.getElementById("paymentFilter").value;
  const fromDate = document.getElementById("fromDate").value;
  const toDate = document.getElementById("toDate").value;

  {
    try {
      const res = await axios.get("/admin/orders/data", {
        params: {
          search,
          status,
          payment,
          fromDate,
          toDate,
          page,
        },
      });

      renderOrders(res.data.data);
    } catch (err) {
      const error = err.response?.data;
      console.log(error);
      toastr.error(error?.message || "Something went wrong", "Failed");
    }
  }
}

function clearFilter() {
  window.location.href = "/admin/orders";
}

async function loadOrders() {
  try {
    const res = await axios.get("/admin/orders/data");

    console.log(res.data.data.orders);

    renderOrders(res.data.data);
  } catch (err) {
    console.log(err);
  }
}

loadOrders();

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

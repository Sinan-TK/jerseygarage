const orders = [
  {
    id: "#ORD-20260127-SZHSPT",
    customer: "John Ready",
    date: "2026-01-27 15:36",
    update: "2026-01-27 15:36",
    status: "draft",
    total: "₹7247.10",
    items: 1,
    payment: "razorpay"
  },
  {
    id: "#ORD-20260127-75C5RK",
    customer: "Nithin Raj",
    date: "2026-01-27 14:09",
    update: "2026-01-27 14:09",
    status: "pending",
    total: "₹1019.10",
    items: 1,
    payment: "razorpay"
  },
  {
    id: "#ORD-20260127-YBTNOV",
    customer: "Nithin Raj",
    date: "2026-01-27 14:32",
    update: "2026-01-27 14:32",
    status: "completed",
    total: "₹2134.20",
    items: 2,
    payment: "cod"
  }
];

const tableBody = document.getElementById("orderTableBody");

/* Render Orders */

function renderOrders(data) {

  tableBody.innerHTML = "";

  data.forEach(order => {

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${order.id}</td>
      <td>${order.customer}</td>
      <td>${formatDate(order.date)}</td>
      <td>${formatDate(order.update)}</td>

      <td>
        <span class="status status-${order.status}">
          ${capitalize(order.status)}
        </span>
      </td>

      <td>${order.total}</td>
      <td>${order.items}</td>

      <td>
        <span class="payment">
          ${order.payment.toUpperCase()}
        </span>
      </td>

      <td>
        <a href="#" class="action-link">View Details</a>
      </td>
    `;

    tableBody.appendChild(row);

  });

}

/* Helpers */

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatDate(dateStr) {

  const date = new Date(dateStr);

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

/* Filters */

document.getElementById("applyFilter").addEventListener("click", () => {

  const search = document.getElementById("searchOrder").value.toLowerCase();
  const status = document.getElementById("statusFilter").value;
  const payment = document.getElementById("paymentFilter").value;

  let filtered = orders.filter(order => {

    let match = true;

    if (search && !order.id.toLowerCase().includes(search)) {
      match = false;
    }

    if (status !== "all" && order.status !== status) {
      match = false;
    }

    if (payment !== "all" && order.payment !== payment) {
      match = false;
    }

    return match;

  });

  renderOrders(filtered);

});

/* Clear */

document.getElementById("clearFilter").addEventListener("click", () => {

  document.getElementById("searchOrder").value = "";
  document.getElementById("statusFilter").value = "all";
  document.getElementById("paymentFilter").value = "all";

  renderOrders(orders);

});

/* Initial Load */

renderOrders(orders);


function clearFilter(){
    window.location.href = "/admin/orders";
}
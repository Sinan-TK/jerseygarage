document.getElementById("headerDate").textContent =
  new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const demoStatus = {
  labels: ["Delivered", "Shipped", "Placed", "Cancelled", "Returned"],
  data: [142, 38, 29, 24, 15],
  colors: ["#16a34a", "#2563eb", "#d97706", "#e53935", "#7c3aed"],
};

// Stats
async function loadStats() {
  try {
    const res = await axios.get("/admin/dashboard/stats");

    const { totalOrders, totalRevenue, totalCustomers, totalProducts } =
      res.data.data;
    document.getElementById("statOrders").textContent = totalOrders;
    document.getElementById("statRevenue").textContent =
      `₹${totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
    document.getElementById("statCustomers").textContent = totalCustomers;
    document.getElementById("statProducts").textContent = totalProducts;
  } catch (err) {
    const error = err.response?.data;
    console.log(error);
    toastr.error(error?.message || "Something went wrong: Stats", "Failed");
  }
}

let revenueChart = null;
function setChartFilter(filter, btn) {
  document
    .querySelectorAll(".cf-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  loadChart(filter);
}
async function loadChart(filter = "weekly") {
  try {
    const res = await axios.get("/admin/dashboard/chart", {
      params: { filter },
    });
    const { labels, revenue, orders } = res.data.data;
    if (revenueChart) revenueChart.destroy();
    revenueChart = new Chart(
      document.getElementById("revenueChart").getContext("2d"),
      {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Revenue (₹)",
              data: revenue,
              backgroundColor: "rgba(229,57,53,0.12)",
              borderColor: "#e53935",
              borderWidth: 2,
              borderRadius: 6,
              yAxisID: "y",
            },
            {
              label: "Orders",
              data: orders,
              type: "line",
              borderColor: "#2563eb",
              backgroundColor: "rgba(37,99,235,0.06)",
              borderWidth: 2.5,
              pointBackgroundColor: "#2563eb",
              pointRadius: 3,
              tension: 0.4,
              fill: true,
              yAxisID: "y1",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: {
              position: "top",
              labels: { font: { size: 11 }, usePointStyle: true, padding: 16 },
            },
            tooltip: {
              callbacks: {
                label: (ctx) =>
                  ctx.dataset.label === "Revenue (₹)"
                    ? ` ₹${ctx.raw.toLocaleString("en-IN")}`
                    : ` ${ctx.raw} orders`,
              },
            },
          },
          scales: {
            y: {
              type: "linear",
              position: "left",
              grid: { color: "#f3f4f6" },
              ticks: {
                callback: (v) => `₹${(v / 1000).toFixed(0)}k`,
                font: { size: 10 },
              },
            },
            y1: {
              type: "linear",
              position: "right",
              grid: { drawOnChartArea: false },
              ticks: { font: { size: 10 } },
            },
            x: { grid: { display: false }, ticks: { font: { size: 10 } } },
          },
        },
      },
    );
  } catch (err) {
    const error = err.response?.data;
    console.log(error);
    toastr.error(error?.message || "Something went wrong: Chart", "Failed");
  }
}

// Donut
async function loadStatusChart() {
  try {
    const res = await axios.get("/admin/dashboard/status");
    const { labels, data, colors } = res.data.data;
    new Chart(document.getElementById("statusChart").getContext("2d"), {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          { data, backgroundColor: colors, borderWidth: 0, hoverOffset: 4 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "68%",
        plugins: { legend: { display: false } },
      },
    });
    const total = data.reduce((s, v) => s + v, 0);
    document.getElementById("donutLegend").innerHTML = labels
      .map(
        (l, i) => `
      <div class="donut-legend-item">
        <div class="donut-legend-left"><div class="donut-dot" style="background:${colors[i]}"></div><span>${l}</span></div>
        <span class="donut-legend-val">${data[i]} <span style="color:var(--muted);font-weight:400;">(${Math.round((data[i] / total) * 100)}%)</span></span>
      </div>
    `,
      )
      .join("");
  } catch (err) {
    const error = err.response?.data;
    console.log(error);
    toastr.error(error?.message || "Something went wrong: Status", "Failed");
  }
}

// Podium
function renderPodium(podiumId, rowsId, items) {
  const podiumOrder = [items[1], items[0], items[2]];
  const emojis = ["🥈", "🥇", "🥉"];
  const heights = ["65px", "95px", "50px"];
  document.getElementById(podiumId).innerHTML = podiumOrder
    .map(
      (item, i) => `
      <div class="podium-item">
        <div class="podium-rank">${emojis[i]}</div>
        <div class="podium-bar" style="height:${heights[i]}">${item.totalSold}</div>
        <div class="podium-name">${item.name}</div>
      </div>
    `,
    )
    .join("");
  document.getElementById(rowsId).innerHTML = items
    .map(
      (item, i) => `
      <div class="top-row">
        <div class="top-row-rank">${i + 1}</div>
        <div class="top-row-name">${item.name}</div>
        <div class="top-row-val">${item.totalSold} sold</div>
      </div>
    `,
    )
    .join("");
}

async function loadTopLists() {
  try {
    const res = await axios.get("/admin/dashboard/top");

    renderPodium("productPodium", "productRows", res.data.data.topProducts);
    renderPodium("categoryPodium", "categoryRows", res.data.data.topCategories);
  } catch (err) {
    const error = err.response?.data;
    console.log(error);
    toastr.error(error?.message || "Something went wrong: Top", "Failed");
  }
}

// Ledger
async function downloadLedger() {
  const from = document.getElementById("ledgerFrom").value;
  const to = document.getElementById("ledgerTo").value;
  const params = new URLSearchParams();
  if (from) params.append("from", from);
  if (to) params.append("to", to);

  try {
    const res = await axios.get(`/admin/ledger/download?${params.toString()}`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));

    // Get filename from header (optional)
    const contentDisposition = res.headers["content-disposition"];
    const fileName =
      contentDisposition?.split("filename=")[1]?.replace(/"/g, "") ||
      "ledger.xlsx";

    // Create download link
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  } catch (err) {
    const error = err.response?.data;
    console.log(error);
    toastr.error(error?.message || "Something went wrong", "Failed");
  }
}

loadStats();
loadChart("weekly");
loadStatusChart();
loadTopLists();

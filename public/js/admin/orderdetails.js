const orderData = [
  {
    name: "Chain Wallet // 002",
    size: "S",
    price: 1683,
    qty: 1,
    image: "/images/item1.png",
  },
  {
    name: "Nitro // 003",
    size: "ONE SIZE",
    price: 854.1,
    qty: 1,
    image: "/images/item2.png",
  },
  {
    name: "UM Pin Tuck Core // Moss Green",
    size: "XS",
    price: 1125,
    qty: 1,
    image: "/images/item3.png",
  },
];

const shippingCost = 30;
const discountValue = 406.9;

const itemsContainer = document.getElementById("orderItems");

let subTotal = 0;

function renderItems() {
  itemsContainer.innerHTML = "";
  subTotal = 0;

  orderData.forEach((item) => {
    const total = item.price * item.qty;
    subTotal += total;

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>
        <div class="product-box">
          <img src="${item.image}">
          <div>
            <div class="product-name">${item.name}</div>
            <div class="product-size">Size: ${item.size} | x${item.qty}</div>
          </div>
        </div>
      </td>

      <td>₹${item.price.toFixed(2)} × ${item.qty}</td>
      <td>₹${total.toFixed(2)}</td>
      <td><span class="order-badge">None</span></td>
    `;

    itemsContainer.appendChild(row);
  });

  updateTotals();
}

function updateTotals() {
  document.getElementById("subTotal").innerText = `₹${subTotal.toFixed(2)}`;
  document.getElementById("shipping").innerText = `₹${shippingCost.toFixed(2)}`;
  document.getElementById("discount").innerText =
    `-₹${discountValue.toFixed(2)}`;

  const grand = subTotal + shippingCost - discountValue;

  document.getElementById("grandTotal").innerText = `₹${grand.toFixed(2)}`;
}

/* Update Status */

document.getElementById("updateStatus").addEventListener("click", () => {
  const orderStatus = document.getElementById("orderStatus").value;
  const paymentStatus = document.getElementById("paymentStatus").value;

  alert(`Order: ${orderStatus}\nPayment: ${paymentStatus}`);
});

renderItems();

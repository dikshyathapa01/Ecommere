const API = "http://localhost:3000/api";
const token = localStorage.getItem("token");

if (!token) {
  alert("Please login first");
  window.location.href = "/frontend/login.html";
}

// Tab switching
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    tabContents.forEach(tc => tc.classList.remove('active'));
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});

// Load user info
async function loadUser() {
  try {
    const res = await fetch(`${API}/users/me`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const user = await res.json();
    document.getElementById("userName").innerText = user.name;
  } catch (err) {
    console.error(err);
  }
}

// Load products
async function loadProducts() {
  try {
    const res = await fetch(`${API}/products`);
    const products = await res.json();
    const container = document.getElementById("productsList");
    container.innerHTML = "";
    products.forEach(p => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
        <img src="${API}/uploads/${p.image}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p>$${p.price}</p>
      `;
      container.appendChild(card);
    });
  } catch (err) { console.error(err); }
}

// Load orders
async function loadOrders() {
  try {
    const res = await fetch(`${API}/orders/my`, { headers: { "Authorization": `Bearer ${token}` } });
    const orders = await res.json();
    const list = document.getElementById("ordersList");
    list.innerHTML = "";
    orders.forEach(o => {
      const li = document.createElement("li");
      li.textContent = `Order #${o.id} - ${o.status} - $${o.total}`;
      list.appendChild(li);
    });
  } catch (err) { console.error(err); }
}

// Load payments
async function loadPayments() {
  try {
    const res = await fetch(`${API}/payments/my`, { headers: { "Authorization": `Bearer ${token}` } });
    const payments = await res.json();
    const list = document.getElementById("paymentsList");
    list.innerHTML = "";
    payments.forEach(p => {
      const li = document.createElement("li");
      li.textContent = `Payment #${p.id} - ${p.amount} - ${p.status}`;
      list.appendChild(li);
    });
  } catch (err) { console.error(err); }
}

// Load cart
async function loadCart() {
  try {
    const res = await fetch(`${API}/cart/my`, { headers: { "Authorization": `Bearer ${token}` } });
    const cartItems = await res.json();
    const list = document.getElementById("cartList");
    list.innerHTML = "";
    cartItems.forEach(item => {
      const li = document.createElement("li");
      li.textContent = `${item.product.name} x${item.quantity} - $${item.product.price}`;
      list.appendChild(li);
    });
  } catch (err) { console.error(err); }
}

// Initial load
loadUser();
loadProducts();
loadOrders();
loadPayments();
loadCart();
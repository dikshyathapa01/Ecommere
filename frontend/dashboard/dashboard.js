requireAuth();

async function loadDashboard() {
  try {
    const [products, orders] = await Promise.all([
      apiFetch("/products").catch(() => []),
      apiFetch("/orders").catch(() => []),
    ]);

    document.getElementById("totalProducts").textContent = products.length || 0;
    document.getElementById("totalOrders").textContent = orders.length || 0;

    const revenue = (Array.isArray(orders) ? orders : []).reduce(
      (sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0
    );
    document.getElementById("totalRevenue").textContent = `$${revenue.toFixed(2)}`;

    // Cart count
    try {
      const cart = await apiFetch("/shopping-cart");
      document.getElementById("cartItems").textContent = Array.isArray(cart) ? cart.length : 0;
    } catch {
      document.getElementById("cartItems").textContent = "0";
    }

    // Recent orders
    const tbody = document.getElementById("recentOrdersBody");
    const recent = (Array.isArray(orders) ? orders : []).slice(0, 5);
    if (recent.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4"><div class="empty-state"><div class="icon">📭</div><h3>No orders yet</h3><p>Orders will appear here once placed.</p></div></td></tr>`;
      return;
    }
    tbody.innerHTML = recent.map(o => `
      <tr>
        <td><strong>${o.id.slice(0, 8)}…</strong></td>
        <td><span class="badge badge-${o.status}">${o.status}</span></td>
        <td>$${parseFloat(o.totalAmount).toFixed(2)}</td>
        <td>${new Date(o.orderDate).toLocaleDateString()}</td>
      </tr>
    `).join("");
  } catch (err) {
    showToast(err.message, "error");
  }
}

// Load user name
async function loadUserName() {
  try {
    const user = await apiFetch("/users/me");
    document.getElementById("userName").textContent = user.name || "User";
  } catch {
    document.getElementById("userName").textContent = "User";
  }
}

loadUserName();
loadDashboard();

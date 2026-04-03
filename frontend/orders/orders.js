requireAuth();

let allOrders = [];
let currentStatus = "all";
let allProducts = []; // for order item dropdown

async function loadOrders() {
  try {
    const orders = await apiFetch("/orders");
    allOrders = Array.isArray(orders) ? orders : [];
    renderOrders(allOrders);
    updateStats(allOrders);
  } catch (err) {
    showToast(err.message, "error");
    document.getElementById("ordersBody").innerHTML =
      `<tr><td colspan="8"><div class="empty-state"><div class="icon">⚠️</div><h3>Failed to load</h3><p>${escapeHtml(err.message)}</p></div></td></tr>`;
  }
}

async function loadProductsForDropdown() {
  try {
    allProducts = await apiFetch("/products");
  } catch { allProducts = []; }
}

function escapeHtml(text) {
  const d = document.createElement("div");
  d.textContent = text || "";
  return d.innerHTML;
}

function updateStats(orders) {
  document.getElementById("totalOrders").textContent = orders.length;
  document.getElementById("pendingOrders").textContent = orders.filter((o) => o.status === "pending").length;
  document.getElementById("deliveredOrders").textContent = orders.filter((o) => o.status === "delivered").length;
  const revenue = orders.reduce((s, o) => s + (parseFloat(o.totalAmount) || 0), 0);
  document.getElementById("totalRevenue").textContent = `$${revenue.toFixed(2)}`;
}

function renderOrders(orders) {
  const tbody = document.getElementById("ordersBody");
  let filtered = currentStatus === "all" ? orders : orders.filter((o) => o.status === currentStatus);

  // Search filter
  const q = document.getElementById("searchInput").value.toLowerCase();
  if (q) filtered = filtered.filter((o) => o.id.toLowerCase().includes(q));

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><div class="icon">📭</div><h3>No orders found</h3><p>No orders match the current filter.</p></div></td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map(
      (o) => `
    <tr>
      <td><strong title="${escapeHtml(o.id)}">${o.id.slice(0, 8)}…</strong></td>
      <td>${o.userId ? o.userId.slice(0, 8) + "…" : "—"}</td>
      <td>${o.orderItems ? o.orderItems.length : 0} items</td>
      <td><strong>$${parseFloat(o.totalAmount).toFixed(2)}</strong></td>
      <td><span class="badge badge-${o.status}">${o.status}</span></td>
      <td>${escapeHtml(o.paymentMethod || "—")}</td>
      <td>${new Date(o.orderDate).toLocaleDateString()}</td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn btn-secondary btn-sm" onclick="viewOrder('${o.id}')" title="View Details">👁</button>
          <button class="btn btn-primary btn-sm" onclick="openStatusModal('${o.id}','${o.status}')" title="Update Status">📝</button>
          <button class="btn btn-danger btn-sm" onclick="deleteOrder('${o.id}')" title="Delete">🗑️</button>
        </div>
      </td>
    </tr>`
    )
    .join("");
}

// Status filter tabs
document.querySelectorAll(".status-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".status-btn").forEach((b) => {
      b.classList.remove("active");
      b.style.background = "";
      b.style.color = "";
    });
    btn.classList.add("active");
    btn.style.background = "var(--gradient)";
    btn.style.color = "#fff";
    currentStatus = btn.dataset.status;
    renderOrders(allOrders);
  });
});

// Search
document.getElementById("searchInput").addEventListener("input", () => renderOrders(allOrders));

// View detail
async function viewOrder(id) {
  try {
    const o = await apiFetch(`/orders/${id}`);
    const statuses = ["pending", "confirmed", "shipped", "delivered"];
    const idx = statuses.indexOf(o.status);
    const isCancelled = o.status === "cancelled";

    const timeline = statuses
      .map((s, i) => {
        const isActive = !isCancelled && i <= idx;
        return `
          <div class="timeline-step">
            <div class="timeline-dot ${isActive ? "active" : ""} ${isCancelled && s === "pending" ? "cancelled" : ""}">${i + 1}</div>
            <span class="timeline-label">${s}</span>
          </div>
          ${i < statuses.length - 1 ? `<div class="timeline-line ${!isCancelled && i < idx ? "active" : ""}"></div>` : ""}
        `;
      })
      .join("");

    const items = (o.orderItems || [])
      .map(
        (it) => `
        <tr>
          <td>${it.product ? escapeHtml(it.product.name) : it.productId || "—"}</td>
          <td>${it.quantity}</td>
          <td>$${parseFloat(it.price).toFixed(2)}</td>
          <td>$${(it.quantity * parseFloat(it.price)).toFixed(2)}</td>
        </tr>`
      )
      .join("");

    document.getElementById("orderDetailBody").innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
        <div>
          <h3 style="font-size:1rem;margin-bottom:4px">Order #${escapeHtml(o.id.slice(0, 8))}…</h3>
          <p style="font-size:0.85rem;color:var(--text-muted)">${new Date(o.orderDate).toLocaleString()}</p>
        </div>
        <span class="badge badge-${o.status}" style="font-size:0.9rem;padding:6px 16px">${o.status}</span>
      </div>

      <div class="order-timeline">${timeline}</div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin:1.5rem 0">
        <div class="glass-card" style="padding:1rem">
          <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:4px">Shipping Address</p>
          <strong>${escapeHtml(o.shippingAddress)}</strong>
        </div>
        <div class="glass-card" style="padding:1rem">
          <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:4px">Payment Method</p>
          <strong>${escapeHtml(o.paymentMethod)}</strong>
        </div>
      </div>

      <h4 style="margin-bottom:0.8rem">Order Items</h4>
      <table style="width:100%">
        <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>
        <tbody>${items || "<tr><td colspan='4'>No items</td></tr>"}</tbody>
        <tfoot>
          <tr style="font-weight:700;border-top:2px solid var(--border)">
            <td colspan="3" style="text-align:right;padding:12px 18px">Total:</td>
            <td style="padding:12px 18px">$${parseFloat(o.totalAmount).toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    `;
    document.getElementById("orderDetailModal").classList.add("active");
  } catch (err) {
    showToast(err.message, "error");
  }
}

function closeDetailModal() {
  document.getElementById("orderDetailModal").classList.remove("active");
}

// Status modal
function openStatusModal(id, current) {
  document.getElementById("statusOrderId").value = id;
  document.getElementById("newStatus").value = current;
  document.getElementById("statusModal").classList.add("active");
}
function closeStatusModal() {
  document.getElementById("statusModal").classList.remove("active");
}
async function updateStatus() {
  const id = document.getElementById("statusOrderId").value;
  const status = document.getElementById("newStatus").value;
  try {
    await apiFetch(`/orders/${id}/status`, { method: "PATCH", body: { status } });
    showToast("Order status updated!");
    closeStatusModal();
    loadOrders();
  } catch (err) {
    showToast(err.message, "error");
  }
}

// Create order modal
function openCreateModal() {
  document.getElementById("oAddress").value = "";
  document.getElementById("oPayment").value = "credit_card";
  document.getElementById("orderItemRows").innerHTML = "";
  addOrderItemRow();
  document.getElementById("createOrderModal").classList.add("active");
}
function closeCreateModal() {
  document.getElementById("createOrderModal").classList.remove("active");
}

function addOrderItemRow() {
  const row = document.createElement("div");
  row.className = "form-row";
  row.style.marginBottom = "8px";
  row.style.gridTemplateColumns = "1fr 80px 80px 38px";

  let productOptions = '<option value="">Select product…</option>';
  if (allProducts.length) {
    productOptions += allProducts.map((p) => `<option value="${p.id}" data-price="${p.price}">${escapeHtml(p.name)} ($${p.price})</option>`).join("");
  } else {
    productOptions += '<option value="">Type product ID below</option>';
  }

  row.innerHTML = `
    <select class="form-control oi-product" onchange="autoFillPrice(this)">${productOptions}</select>
    <input class="form-control oi-qty" type="number" min="1" value="1" placeholder="Qty">
    <input class="form-control oi-price" type="number" step="0.01" min="0" placeholder="Price">
    <button class="btn btn-danger btn-sm btn-icon" onclick="this.parentElement.remove()">×</button>
  `;
  document.getElementById("orderItemRows").appendChild(row);
}

function autoFillPrice(select) {
  const opt = select.options[select.selectedIndex];
  const price = opt.getAttribute("data-price");
  if (price) {
    select.closest(".form-row").querySelector(".oi-price").value = price;
  }
}

async function submitOrder() {
  const shippingAddress = document.getElementById("oAddress").value.trim();
  const paymentMethod = document.getElementById("oPayment").value;

  if (shippingAddress.length < 10) {
    showToast("Shipping address must be at least 10 characters", "error");
    return;
  }

  const rows = document.querySelectorAll("#orderItemRows .form-row");
  const orderItems = [];
  rows.forEach((r) => {
    const productId = r.querySelector(".oi-product").value;
    const quantity = Number(r.querySelector(".oi-qty").value);
    const price = Number(r.querySelector(".oi-price").value);
    if (productId && quantity > 0 && price > 0) {
      orderItems.push({ productId, quantity, price });
    }
  });

  if (!orderItems.length) {
    showToast("Add at least one order item", "error");
    return;
  }

  try {
    await apiFetch("/orders", {
      method: "POST",
      body: { orderItems, shippingAddress, paymentMethod },
    });
    showToast("Order placed!");
    closeCreateModal();
    loadOrders();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function deleteOrder(id) {
  if (!confirm("Delete this order?")) return;
  try {
    await apiFetch(`/orders/${id}`, { method: "DELETE" });
    showToast("Order deleted!");
    loadOrders();
  } catch (err) {
    showToast(err.message, "error");
  }
}

// Init
loadProductsForDropdown();
loadOrders();

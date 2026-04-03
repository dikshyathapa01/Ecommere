requireAuth();

let cartItems = [];
let allProducts = [];

// ── Load cart items ──
async function loadCart() {
  try {
    const data = await apiFetch("/shopping-cart");
    cartItems = Array.isArray(data) ? data : [];
    renderCart();
    updateStats();
  } catch (err) {
    showToast(err.message, "error");
    document.getElementById("cartContainer").innerHTML =
      `<div class="empty-state"><div class="icon">⚠️</div><h3>Failed to load cart</h3><p>${escapeHtml(err.message)}</p></div>`;
  }
}

// ── Load products for "Add" section ──
async function loadProducts() {
  try {
    allProducts = await apiFetch("/products");
    if (!Array.isArray(allProducts)) allProducts = [];
    renderProductBrowser();
  } catch {
    allProducts = [];
  }
}

function escapeHtml(text) {
  const d = document.createElement("div");
  d.textContent = text || "";
  return d.innerHTML;
}

function getItemPrice(item) {
  if (item.product && item.product.price) return Number(item.product.price);
  return 0;
}

// ── Stats ──
function updateStats() {
  const totalQty = cartItems.reduce((s, i) => s + i.quantity, 0);
  document.getElementById("itemCount").textContent = totalQty;
  const total = cartItems.reduce((s, i) => s + getItemPrice(i) * i.quantity, 0);
  document.getElementById("cartTotal").textContent = `$${total.toFixed(2)}`;
  document.getElementById("checkoutTotal").textContent = `$${total.toFixed(2)}`;

  const checkoutBar = document.getElementById("checkoutBar");
  const clearBtn = document.getElementById("clearBtn");
  if (cartItems.length > 0) {
    checkoutBar.style.display = "flex";
    clearBtn.style.display = "inline-flex";
  } else {
    checkoutBar.style.display = "none";
    clearBtn.style.display = "none";
  }
}

// ── Render cart items ──
function renderCart() {
  const container = document.getElementById("cartContainer");
  if (!cartItems.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Browse products and add items to your cart</p>
        <a href="../products/products.html" class="btn btn-primary" style="margin-top:1rem">Browse Products</a>
      </div>`;
    return;
  }

  container.innerHTML = cartItems
    .map(
      (item) => `
    <div class="cart-item">
      <div class="cart-item-img">📦</div>
      <div class="cart-item-info">
        <h4>${item.product ? escapeHtml(item.product.name) : "Product"}</h4>
        <p>$${getItemPrice(item).toFixed(2)} each${item.product && item.product.brand ? " · " + escapeHtml(item.product.brand) : ""}</p>
      </div>
      <div class="cart-qty">
        <button onclick="updateQty('${item.id}', ${item.quantity - 1})">−</button>
        <span>${item.quantity}</span>
        <button onclick="updateQty('${item.id}', ${item.quantity + 1})">+</button>
      </div>
      <div style="min-width:80px;text-align:right;font-weight:700;color:var(--primary-dark)">
        $${(getItemPrice(item) * item.quantity).toFixed(2)}
      </div>
      <button class="btn btn-danger btn-sm btn-icon" onclick="removeItem('${item.id}')" title="Remove">×</button>
    </div>`
    )
    .join("");
}

// ── Render product browser for quick add ──
function renderProductBrowser() {
  const container = document.getElementById("productBrowser");
  if (!container) return;
  if (!allProducts.length) {
    container.innerHTML = `<p style="color:var(--text-muted);padding:1rem">No products available.</p>`;
    return;
  }

  // Don't show products already in cart with high quantity
  container.innerHTML = allProducts
    .map(
      (p) => {
        const inCart = cartItems.find((c) => c.productId === p.id);
        return `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid var(--border)">
          <div style="flex:1">
            <strong>${escapeHtml(p.name)}</strong>
            <span style="color:var(--text-muted);font-size:0.82rem;margin-left:8px">$${Number(p.price).toFixed(2)}</span>
            ${inCart ? `<span class="badge badge-active" style="margin-left:8px;font-size:0.72rem">${inCart.quantity} in cart</span>` : ""}
          </div>
          <button class="btn btn-success btn-sm" onclick="addToCart('${p.id}')">+ Add</button>
        </div>`;
      }
    )
    .join("");
}

// ── Cart operations ──
async function addToCart(productId) {
  try {
    await apiFetch("/shopping-cart", {
      method: "POST",
      body: { productId, quantity: 1 },
    });
    showToast("Added to cart!");
    loadCart().then(() => renderProductBrowser());
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function updateQty(id, newQty) {
  if (newQty < 1) {
    removeItem(id);
    return;
  }
  try {
    await apiFetch(`/shopping-cart/${id}`, {
      method: "PUT",
      body: { quantity: newQty },
    });
    loadCart();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function removeItem(id) {
  try {
    await apiFetch(`/shopping-cart/${id}`, { method: "DELETE" });
    showToast("Item removed");
    loadCart().then(() => renderProductBrowser());
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function clearCart() {
  if (!confirm("Clear your entire cart?")) return;
  try {
    await apiFetch("/shopping-cart/clear", { method: "DELETE" });
    showToast("Cart cleared!");
    loadCart().then(() => renderProductBrowser());
  } catch (err) {
    showToast(err.message, "error");
  }
}

function proceedToCheckout() {
  window.location.href = "../orders/orders.html";
}

// ── Product search filter ──
function setupProductSearch() {
  const input = document.getElementById("prodSearchInput");
  if (!input) return;
  input.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = allProducts.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.brand || "").toLowerCase().includes(q)
    );
    const temp = allProducts;
    allProducts = filtered;
    renderProductBrowser();
    allProducts = temp;
  });
}

// ── Init ──
loadCart();
loadProducts().then(() => setupProductSearch());

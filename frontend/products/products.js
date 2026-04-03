requireAuth();

let products = [];
let editingId = null;

async function loadProducts() {
  try {
    products = await apiFetch("/products");
    if (!Array.isArray(products)) products = [];
    renderProducts(products);
    updateStats(products);
  } catch (err) {
    showToast(err.message, "error");
    document.getElementById("productGrid").innerHTML =
      `<div class="empty-state"><div class="icon">⚠️</div><h3>Failed to load products</h3><p>${escapeHtml(err.message)}</p></div>`;
  }
}

function escapeHtml(text) {
  const d = document.createElement("div");
  d.textContent = text || "";
  return d.innerHTML;
}

function updateStats(list) {
  document.getElementById("totalCount").textContent = list.length;
  const avg = list.length ? (list.reduce((s, p) => s + Number(p.price), 0) / list.length) : 0;
  document.getElementById("avgPrice").textContent = `$${avg.toFixed(2)}`;
  const brands = new Set(list.map((p) => p.brand).filter(Boolean));
  document.getElementById("totalBrands").textContent = brands.size;
}

function renderProducts(list) {
  const grid = document.getElementById("productGrid");

  if (!list.length) {
    grid.innerHTML = `<div class="empty-state"><div class="icon">📦</div><h3>No Products</h3><p>Add your first product</p></div>`;
    return;
  }

  grid.innerHTML = list.map((p) => `
    <div class="product-card">
      <div class="card-img">📦</div>
      <div class="card-body">
        <h3>${escapeHtml(p.name)}</h3>
        <div class="brand">${escapeHtml(p.brand || "")}</div>
        <div class="price">$${Number(p.price).toFixed(2)}</div>
        <p class="desc">${escapeHtml(p.description || "")}</p>
        ${p.variant && p.variant.length ? `<div class="variant-pills">${p.variant.map((v) => `<span class="variant-pill">${escapeHtml(v.color)} / ${escapeHtml(v.size)} (${v.stock})</span>`).join("")}</div>` : ""}
      </div>
      <div class="card-actions">
        <button class="btn btn-success btn-sm" onclick="addToCart('${p.id}')">🛒 Add to Cart</button>
        <button class="btn btn-secondary btn-sm" onclick="editProduct('${p.id}')">✏️ Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteProduct('${p.id}')">🗑️ Delete</button>
      </div>
    </div>
  `).join("");
}

// --- Modal ---
function openAddModal() {
  editingId = null;
  document.getElementById("modalTitle").textContent = "Add Product";
  document.getElementById("editId").value = "";
  document.getElementById("pName").value = "";
  document.getElementById("pPrice").value = "";
  document.getElementById("pBrand").value = "";
  document.getElementById("pDesc").value = "";
  document.getElementById("variantRows").innerHTML = "";
  addVariantRow();
  document.getElementById("productModal").classList.add("active");
}

function closeModal() {
  document.getElementById("productModal").classList.remove("active");
}

function addVariantRow() {
  const row = document.createElement("div");
  row.className = "form-row";
  row.style.marginBottom = "8px";
  row.style.gridTemplateColumns = "1fr 1fr 80px 38px";
  row.innerHTML = `
    <input class="form-control v-color" placeholder="Color" />
    <input class="form-control v-size" placeholder="Size" />
    <input class="form-control v-stock" type="number" min="0" placeholder="Stock" value="0" />
    <button class="btn btn-danger btn-sm btn-icon" type="button" onclick="this.parentElement.remove()">×</button>
  `;
  document.getElementById("variantRows").appendChild(row);
}

function getVariantsFromForm() {
  const rows = document.querySelectorAll("#variantRows .form-row");
  const variants = [];
  rows.forEach((r) => {
    const color = r.querySelector(".v-color").value.trim();
    const size = r.querySelector(".v-size").value.trim();
    const stock = Number(r.querySelector(".v-stock").value) || 0;
    if (color && size) {
      variants.push({ color, size, stock });
    }
  });
  return variants;
}

async function saveProduct() {
  const name = document.getElementById("pName").value.trim();
  const price = Math.round(Number(document.getElementById("pPrice").value));
  const brand = document.getElementById("pBrand").value.trim();
  const description = document.getElementById("pDesc").value.trim();
  const variant = getVariantsFromForm();

  if (!name || !price || !brand || !description) {
    showToast("All fields are required", "error");
    return;
  }
  if (!variant.length) {
    showToast("Add at least one variant", "error");
    return;
  }

  const body = { name, price, brand, description, variant };

  try {
    if (editingId) {
      await apiFetch(`/products/${editingId}`, { method: "PUT", body });
      showToast("Product updated!");
    } else {
      await apiFetch("/products", { method: "POST", body });
      showToast("Product created!");
    }
    closeModal();
    loadProducts();
  } catch (err) {
    showToast(err.message, "error");
  }
}

function editProduct(id) {
  const p = products.find((x) => x.id === id);
  if (!p) return;

  editingId = id;
  document.getElementById("modalTitle").textContent = "Edit Product";
  document.getElementById("editId").value = id;
  document.getElementById("pName").value = p.name;
  document.getElementById("pPrice").value = p.price;
  document.getElementById("pBrand").value = p.brand || "";
  document.getElementById("pDesc").value = p.description || "";

  // Populate variant rows
  document.getElementById("variantRows").innerHTML = "";
  if (p.variant && p.variant.length) {
    p.variant.forEach((v) => {
      addVariantRow();
      const rows = document.querySelectorAll("#variantRows .form-row");
      const last = rows[rows.length - 1];
      last.querySelector(".v-color").value = v.color || "";
      last.querySelector(".v-size").value = v.size || "";
      last.querySelector(".v-stock").value = v.stock || 0;
    });
  } else {
    addVariantRow();
  }

  document.getElementById("productModal").classList.add("active");
}

async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;
  try {
    await apiFetch(`/products/${id}`, { method: "DELETE" });
    showToast("Product deleted!");
    loadProducts();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function addToCart(productId) {
  try {
    await apiFetch("/shopping-cart", {
      method: "POST",
      body: { productId, quantity: 1 },
    });
    showToast("Added to cart!");
  } catch (err) {
    showToast(err.message, "error");
  }
}

// Search
document.getElementById("searchInput").addEventListener("input", (e) => {
  const term = e.target.value.toLowerCase();
  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(term) ||
      (p.brand || "").toLowerCase().includes(term)
  );
  renderProducts(filtered);
});

loadProducts();
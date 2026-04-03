requireAuth();

let allCategories = [];
let currentFilter = "all";

async function loadCategories() {
  try {
    const data = await apiFetch("/categories");
    // Backend may return { success, message, appliedFilters } or an array
    allCategories = Array.isArray(data) ? data : [];
    renderTable(allCategories);
    updateStats(allCategories);
  } catch (err) {
    showToast(err.message, "error");
    document.getElementById("categoriesBody").innerHTML =
      `<tr><td colspan="7"><div class="empty-state"><div class="icon">⚠️</div><h3>Failed to load</h3><p>${err.message}</p></div></td></tr>`;
  }
}

function updateStats(cats) {
  document.getElementById("totalCount").textContent = cats.length;
  const active = cats.filter((c) => c.isActive === true || c.isActive === "true");
  document.getElementById("activeCount").textContent = active.length;
  document.getElementById("inactiveCount").textContent = cats.length - active.length;
}

function escapeHtml(text) {
  const d = document.createElement("div");
  d.textContent = text || "";
  return d.innerHTML;
}

function renderTable(cats) {
  const tbody = document.getElementById("categoriesBody");
  let filtered = cats;
  if (currentFilter === "active") filtered = cats.filter((c) => c.isActive === true || c.isActive === "true");
  if (currentFilter === "inactive") filtered = cats.filter((c) => c.isActive === false || c.isActive === "false");

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="icon">🏷️</div><h3>No categories found</h3><p>Create your first category.</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = filtered
    .map(
      (c) => `
    <tr>
      <td><strong>#${c.id}</strong></td>
      <td>${escapeHtml(c.name)}</td>
      <td style="max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(c.description)}</td>
      <td><span class="badge badge-${c.isActive ? "active" : "inactive"}">${c.isActive ? "Active" : "Inactive"}</span></td>
      <td>${c.parentCategoryId || "—"}</td>
      <td>${c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}</td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn btn-secondary btn-sm" onclick="openEditModal(${c.id})">✏️</button>
          <button class="btn btn-danger btn-sm" onclick="deleteCategory(${c.id})">🗑️</button>
        </div>
      </td>
    </tr>`
    )
    .join("");
}

// Search
document.getElementById("searchInput").addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase();
  const filtered = allCategories.filter(
    (c) =>
      (c.name || "").toLowerCase().includes(q) ||
      (c.description || "").toLowerCase().includes(q)
  );
  renderTable(filtered);
});

// Filter buttons
document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    // override active style for filter buttons
    document.querySelectorAll(".filter-btn").forEach((b) => {
      b.style.background = "";
      b.style.color = "";
    });
    btn.style.background = "var(--gradient)";
    btn.style.color = "#fff";
    currentFilter = btn.dataset.filter;
    renderTable(allCategories);
  });
});

// Modal
function openAddModal() {
  document.getElementById("modalTitle").textContent = "Add Category";
  document.getElementById("editId").value = "";
  document.getElementById("cName").value = "";
  document.getElementById("cDesc").value = "";
  document.getElementById("cActive").value = "true";
  document.getElementById("cParent").value = "";
  document.getElementById("categoryModal").classList.add("active");
}

function openEditModal(id) {
  const c = allCategories.find((x) => x.id === id);
  if (!c) return;
  document.getElementById("modalTitle").textContent = "Edit Category";
  document.getElementById("editId").value = c.id;
  document.getElementById("cName").value = c.name;
  document.getElementById("cDesc").value = c.description;
  document.getElementById("cActive").value = String(c.isActive);
  document.getElementById("cParent").value = c.parentCategoryId || "";
  document.getElementById("categoryModal").classList.add("active");
}

function closeModal() {
  document.getElementById("categoryModal").classList.remove("active");
}

async function saveCategory() {
  const id = document.getElementById("editId").value;
  const name = document.getElementById("cName").value.trim();
  const description = document.getElementById("cDesc").value.trim();
  const isActive = document.getElementById("cActive").value === "true";
  const parentCategoryId = document.getElementById("cParent").value
    ? Number(document.getElementById("cParent").value)
    : undefined;

  if (!name || description.length < 10) {
    showToast("Name required, description must be ≥ 10 chars", "error");
    return;
  }

  const body = { name, description, isActive, parentCategoryId };

  try {
    if (id) {
      await apiFetch(`/categories/${id}`, { method: "PUT", body });
      showToast("Category updated!");
    } else {
      await apiFetch("/categories", { method: "POST", body });
      showToast("Category created!");
    }
    closeModal();
    loadCategories();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function deleteCategory(id) {
  if (!confirm("Delete this category?")) return;
  try {
    await apiFetch(`/categories/${id}`, { method: "DELETE" });
    showToast("Category deleted!");
    loadCategories();
  } catch (err) {
    showToast(err.message, "error");
  }
}

loadCategories();

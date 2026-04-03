requireAuth();

let allPayments = [];
let currentFilter = "all";

async function loadPayments() {
  try {
    const data = await apiFetch("/payments/history");
    allPayments = Array.isArray(data) ? data : [];
    renderPayments(allPayments);
    updateStats(allPayments);
  } catch (err) {
    showToast(err.message, "error");
    document.getElementById("paymentsBody").innerHTML =
      `<tr><td colspan="7"><div class="empty-state"><div class="icon">⚠️</div><h3>Failed to load</h3><p>${escapeHtml(err.message)}</p></div></td></tr>`;
  }
}

function escapeHtml(text) {
  const d = document.createElement("div");
  d.textContent = text || "";
  return d.innerHTML;
}

function updateStats(payments) {
  document.getElementById("totalPayments").textContent = payments.length;
  document.getElementById("completedPayments").textContent = payments.filter((p) => p.status === "completed").length;
  document.getElementById("pendingPayments").textContent = payments.filter((p) => p.status === "pending").length;
  const total = payments.filter((p) => p.status === "completed").reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
  document.getElementById("totalAmount").textContent = `$${total.toFixed(2)}`;
}

function renderPayments(payments) {
  const tbody = document.getElementById("paymentsBody");
  let filtered = currentFilter === "all" ? payments : payments.filter((p) => p.status === currentFilter);

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="icon">💳</div><h3>No payments found</h3><p>Create a payment to get started.</p></div></td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map(
      (p) => `
    <tr>
      <td><strong title="${escapeHtml(p.id)}">${p.id.slice(0, 8)}…</strong></td>
      <td>${p.orderId ? p.orderId.slice(0, 8) + "…" : "—"}</td>
      <td><strong>$${parseFloat(p.amount).toFixed(2)}</strong></td>
      <td>
        <span class="status-dot ${p.status}"></span>
        <span class="badge badge-${p.status}">${p.status}</span>
      </td>
      <td>${p.transactionId ? escapeHtml(p.transactionId) : "—"}</td>
      <td>${p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}</td>
      <td>
        ${p.status === "pending" ? `<button class="btn btn-success btn-sm" onclick="openConfirmModal('${p.id}')">✅ Confirm</button>` : ""}
      </td>
    </tr>`
    )
    .join("");
}

// Filter tabs
document.querySelectorAll(".pay-filter").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".pay-filter").forEach((b) => {
      b.classList.remove("active");
      b.style.background = "";
      b.style.color = "";
    });
    btn.classList.add("active");
    btn.style.background = "var(--gradient)";
    btn.style.color = "#fff";
    currentFilter = btn.dataset.filter;
    renderPayments(allPayments);
  });
});

// Create payment modal
async function openPayModal() {
  // Load orders for dropdown
  try {
    const orders = await apiFetch("/orders");
    const select = document.getElementById("payOrderId");
    select.innerHTML = '<option value="">Select an order…</option>';
    (Array.isArray(orders) ? orders : []).forEach((o) => {
      const opt = document.createElement("option");
      opt.value = o.id;
      opt.textContent = `#${o.id.slice(0, 8)}… — $${parseFloat(o.totalAmount).toFixed(2)}`;
      opt.dataset.amount = o.totalAmount;
      select.appendChild(opt);
    });
  } catch { /* ignore */ }

  document.getElementById("payAmount").value = "";
  document.getElementById("payModal").classList.add("active");

  // Auto-fill amount on order select
  document.getElementById("payOrderId").onchange = function () {
    const opt = this.options[this.selectedIndex];
    if (opt.dataset.amount) {
      document.getElementById("payAmount").value = parseFloat(opt.dataset.amount).toFixed(2);
    }
  };
}

function closePayModal() {
  document.getElementById("payModal").classList.remove("active");
}

async function createPayment() {
  const orderId = document.getElementById("payOrderId").value;
  const amount = Number(document.getElementById("payAmount").value);

  if (!orderId) {
    showToast("Please select an order", "error");
    return;
  }
  if (!amount || amount <= 0) {
    showToast("Enter a valid amount", "error");
    return;
  }

  try {
    await apiFetch("/payments/create", {
      method: "POST",
      body: { orderId, amount },
    });
    showToast("Payment created!");
    closePayModal();
    loadPayments();
  } catch (err) {
    showToast(err.message, "error");
  }
}

// Confirm payment modal
function openConfirmModal(paymentId) {
  document.getElementById("confirmPayId").value = paymentId;
  document.getElementById("txnId").value = "";
  document.getElementById("confirmModal").classList.add("active");
}

function closeConfirmModal() {
  document.getElementById("confirmModal").classList.remove("active");
}

async function confirmPayment() {
  const paymentId = document.getElementById("confirmPayId").value;
  const transactionId = document.getElementById("txnId").value.trim();

  if (!transactionId) {
    showToast("Transaction ID is required", "error");
    return;
  }

  try {
    await apiFetch("/payments/confirm", {
      method: "POST",
      body: { paymentId, transactionId },
    });
    showToast("Payment confirmed!");
    closeConfirmModal();
    loadPayments();
  } catch (err) {
    showToast(err.message, "error");
  }
}

loadPayments();

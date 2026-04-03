// ═══════════════════════════════════════════════════════════════
// SHARED UTILITIES — E-Commerce Dashboard
// ═══════════════════════════════════════════════════════════════

const API = "http://localhost:3000/api";

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  return {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };
}

function requireAuth() {
  if (!getToken()) {
    window.location.href = "../login/login.html";
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "../login/login.html";
}

// Toast notifications
function showToast(message, type = "success") {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Generic fetch wrapper
async function apiFetch(endpoint, options = {}) {
  const url = `${API}${endpoint}`;
  const config = {
    headers: authHeaders(),
    ...options,
  };
  if (config.body && typeof config.body === "object" && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }
  if (config.body instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  const res = await fetch(url, config);
  if (res.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "../login/login.html";
    throw new Error("Session expired. Please login again.");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Request failed (${res.status})`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

// Set active nav link
function setActiveNav() {
  const currentPage = window.location.pathname.split("/").pop();
  document.querySelectorAll(".sidebar-nav a").forEach((a) => {
    const href = a.getAttribute("href").split("/").pop();
    if (href === currentPage) {
      a.classList.add("active");
    }
  });
}

document.addEventListener("DOMContentLoaded", setActiveNav);

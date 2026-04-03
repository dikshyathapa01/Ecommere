// ===================== API BASE =====================
const API = "http://localhost:3000/api";

// Clear any stale token so user gets a fresh session
localStorage.removeItem("token");
localStorage.removeItem("role");

// ===================== TAB SWITCH =====================
const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

loginTab.onclick = () => {
  loginForm.classList.add("active");
  registerForm.classList.remove("active");
  loginTab.classList.add("active");
  registerTab.classList.remove("active");
};

registerTab.onclick = () => {
  registerForm.classList.add("active");
  loginForm.classList.remove("active");
  registerTab.classList.add("active");
  loginTab.classList.remove("active");
};

// ===================== PASSWORD TOGGLE =====================
const toggleLogin = document.getElementById("togglePassword");
const loginPassword = document.getElementById("loginPassword");
toggleLogin.onclick = () => {
  if (loginPassword.type === "password") {
    loginPassword.type = "text";
    toggleLogin.textContent = "🙈";
  } else {
    loginPassword.type = "password";
    toggleLogin.textContent = "👁";
  }
};

const toggleRegister = document.getElementById("togglePasswordRegister");
const regPassword = document.getElementById("regPassword");
toggleRegister.onclick = () => {
  if (regPassword.type === "password") {
    regPassword.type = "text";
    toggleRegister.textContent = "🙈";
  } else {
    regPassword.type = "password";
    toggleRegister.textContent = "👁";
  }
};

// ===================== PROFILE PREVIEW =====================
const profileInput = document.getElementById("profilePic");
const preview = document.getElementById("preview");
profileInput.onchange = () => {
  const file = profileInput.files[0];
  if (file) preview.src = URL.createObjectURL(file);
};

// ===================== REGISTER =====================
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const phoneNumber = document.getElementById("regPhone").value.trim();
  const address = document.getElementById("regAddress").value.trim();
  const password = regPassword.value.trim();

  if (!name || !email || !password || !address) {
    Swal.fire({
      icon: "warning",
      title: "Missing fields",
      text: "Name, email, password, and address are required.",
    });
    return;
  }

  const formData = new FormData();
  formData.append("name", name);
  formData.append("email", email);
  formData.append("password", password);
  formData.append("PhoneNumber", phoneNumber); // match backend field
  formData.append("address", address);
  formData.append("role", "user");

  const file = profileInput.files[0];
  if (file) formData.append("profile", file);

  try {
    const res = await fetch(`${API}/users/register`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Registration failed");
    }

    Swal.fire({ icon: "success", title: "Registered!", text: "Account created." });
    registerForm.reset();
    preview.src = "https://via.placeholder.com/90";
    loginTab.click();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong!";
    Swal.fire({
      icon: "error",
      title: "Registration failed",
      text: message === "Failed to fetch"
        ? "Could not reach the backend. Start your NestJS server first."
        : message,
    });
  }
});

// ===================== LOGIN =====================
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = loginPassword.value.trim();

  if (!email || !password) {
    Swal.fire({ icon: "warning", title: "Missing fields", text: "Email and password are required." });
    return;
  }

  try {
    const res = await fetch(`${API}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Invalid credentials");
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);

    Swal.fire({ icon: "success", title: "Login Successful", timer: 1000, showConfirmButton: false });

    setTimeout(() => {
      // redirect to dashboard after login
      window.location.href = "../dashboard/dashboard.html";
    }, 1100);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong!";
    Swal.fire({
      icon: "error",
      title: "Login Failed",
      text: message === "Failed to fetch"
        ? "Could not reach the backend. Start your NestJS server first."
        : message,
    });
  }
});
const AUTH_LOGIN = "login.html";

function requireAuth() {
  if (localStorage.getItem("isLoggedIn") !== "true" || !localStorage.getItem("authToken")) {
    window.location.href = AUTH_LOGIN;
  }
}

function currentLecturerName() {
  return localStorage.getItem("lecturerName") || "Lecturer";
}

function initShell(activePage) {
  requireAuth();

  const lecturerName = document.querySelector("[data-lecturer-name]");
  if (lecturerName) lecturerName.textContent = currentLecturerName();

  document.querySelectorAll("[data-nav]").forEach((link) => {
    link.classList.toggle("active", link.dataset.nav === activePage);
  });

  const logoutButton = document.querySelector("[data-logout]");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("lecturerName");
      localStorage.removeItem("authToken");
      window.location.href = AUTH_LOGIN;
    });
  }
}

async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("authToken");
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      message = data.error || data.message || message;
    } catch (error) {
      const text = await response.text().catch(() => "");
      if (text) message = text;
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json().catch(() => null);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatTime(value) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return escapeHtml(value);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function setMessage(id, text, type = "info") {
  const element = document.getElementById(id);
  if (!element) return;
  element.textContent = text;
  element.className = `message ${type} show`;
}

function clearMessage(id) {
  const element = document.getElementById(id);
  if (!element) return;
  element.textContent = "";
  element.className = "message";
}

function renderEmptyTable(tbody, colspan, icon, message) {
  tbody.innerHTML = `
    <tr>
      <td colspan="${colspan}">
        <div class="empty-state">
          <div>
            <i class="fa-solid ${icon}" aria-hidden="true"></i>
            <div>${escapeHtml(message)}</div>
          </div>
        </div>
      </td>
    </tr>
  `;
}

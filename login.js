const form = document.getElementById("loginForm");
const staffInput = document.getElementById("staffId");
const passwordInput = document.getElementById("password");
const message = document.getElementById("loginMessage");

if (localStorage.getItem("isLoggedIn") === "true" && localStorage.getItem("authToken")) {
  window.location.href = "dashboard.html";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const staffId = staffInput.value.trim();
  const password = passwordInput.value.trim();

  if (!staffId || !password) {
    message.textContent = "Please enter both your Staff ID and Password.";
    message.classList.add("show");
    return;
  }

  try {
    message.classList.remove("show");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ staff_id: staffId, password })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Login failed.");
    }

    localStorage.setItem("lecturerName", data.user?.name || staffId);
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("isLoggedIn", "true");
    window.location.href = "dashboard.html";
  } catch (error) {
    message.textContent = error.message;
    message.classList.add("show");
  }
});

const liveRows = document.getElementById("liveRows");
const refreshStatus = document.getElementById("refreshStatus");
const refreshNow = document.getElementById("refreshNow");
const challengeCard = document.getElementById("challengeCard");
const challengeCode = document.getElementById("challengeCode");
const challengeExpiry = document.getElementById("challengeExpiry");
let liveTimer = null;

initShell("live");

function statusClass(status) {
  return String(status || "pending").toLowerCase().replace(/\s+/g, "_");
}

async function refreshLive() {
  try {
    clearMessage("liveMessage");
    const data = await apiFetch("/api/attendance-live");
    renderActiveChallenge(data);

    if (!Array.isArray(data) || data.length === 0) {
      renderEmptyTable(liveRows, 4, "fa-circle-info", "No active session");
      refreshStatus.textContent = `Last checked ${new Date().toLocaleTimeString()}`;
      return;
    }

    liveRows.innerHTML = data.map((item) => `
      <tr>
        <td>
          <div class="strong-cell">
            <strong>${escapeHtml(item.student_name || "Unknown student")}</strong>
            <span>${escapeHtml(item.reg_number || "No registration number")}</span>
          </div>
        </td>
        <td>${formatTime(item.checkin_time)}</td>
        <td><span class="badge ${statusClass(item.status)}">${escapeHtml(item.status || "Pending")}</span></td>
        <td>
          <button class="btn btn-secondary manual-override" type="button" data-reg="${escapeHtml(item.reg_number)}" data-session="${escapeHtml(item.session_id)}">
            <i class="fa-solid fa-user-check" aria-hidden="true"></i>
            Manual Override
          </button>
        </td>
      </tr>
    `).join("");

    document.querySelectorAll(".manual-override").forEach((button) => {
      button.addEventListener("click", handleManualOverride);
    });

    refreshStatus.textContent = `Last updated ${new Date().toLocaleTimeString()}`;
  } catch (error) {
    setMessage("liveMessage", error.message, "error");
  }
}

function renderActiveChallenge(data) {
  const active = Array.isArray(data)
    ? data.find((item) => item.challenge_active && item.active_challenge_code)
    : null;

  if (!active) {
    challengeCard.hidden = true;
    return;
  }

  challengeCode.textContent = active.active_challenge_code;
  challengeExpiry.textContent = `Expires at: ${formatTime(active.challenge_deadline)}`;
  challengeCard.hidden = false;
}

async function handleManualOverride(event) {
  const button = event.currentTarget;
  const reason = window.prompt("Reason for manual override");
  if (!reason || !reason.trim()) return;

  try {
    button.disabled = true;
    await apiFetch("/api/admin/manual-checkin", {
      method: "POST",
      body: JSON.stringify({
        reg_number: button.dataset.reg,
        session_id: button.dataset.session,
        reason: reason.trim()
      })
    });
    setMessage("liveMessage", "Manual override recorded successfully.", "success");
    await refreshLive();
  } catch (error) {
    setMessage("liveMessage", error.message, "error");
  } finally {
    button.disabled = false;
  }
}

refreshNow.addEventListener("click", refreshLive);
refreshLive();
liveTimer = window.setInterval(refreshLive, 3000);
window.addEventListener("beforeunload", () => window.clearInterval(liveTimer));

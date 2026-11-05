const scheduleRows = document.getElementById("scheduleRows");
const scheduleModal = document.getElementById("scheduleModal");
const scheduleForm = document.getElementById("scheduleForm");
let schedules = [];

initShell("schedules");

function openScheduleModal(schedule = null) {
  scheduleForm.reset();
  document.getElementById("scheduleModalTitle").textContent = schedule ? "Edit Schedule" : "Add Schedule";
  document.getElementById("scheduleId").value = schedule?.id || "";
  document.getElementById("courseCode").value = schedule?.course_code || "";
  document.getElementById("roomId").value = schedule?.room_id || "";
  document.getElementById("dayOfWeek").value = schedule?.day_of_week || "Monday";
  document.getElementById("startTime").value = schedule?.start_time || "09:00";
  document.getElementById("endTime").value = schedule?.end_time || "10:00";
  document.getElementById("scheduleYear").value = String(schedule?.year || "4");
  scheduleModal.classList.add("open");
  document.getElementById("courseCode").focus();
}

function closeScheduleModal() {
  scheduleModal.classList.remove("open");
}

async function loadSchedules() {
  try {
    clearMessage("scheduleMessage");
    schedules = await apiFetch("/api/admin/schedules");
    if (!Array.isArray(schedules) || schedules.length === 0) {
      renderEmptyTable(scheduleRows, 8, "fa-calendar-plus", "No schedules have been added yet.");
      return;
    }

    scheduleRows.innerHTML = schedules.map((schedule) => `
      <tr>
        <td>${escapeHtml(schedule.id)}</td>
        <td>${escapeHtml(schedule.course_code)}</td>
        <td>${escapeHtml(schedule.room_id)}</td>
        <td>${escapeHtml(schedule.day_of_week)}</td>
        <td>${escapeHtml(schedule.start_time)}</td>
        <td>${escapeHtml(schedule.end_time)}</td>
        <td>Year ${escapeHtml(schedule.year)}</td>
        <td>
          <div class="actions">
            <button class="btn-icon edit-schedule" type="button" title="Edit schedule" data-id="${escapeHtml(schedule.id)}"><i class="fa-solid fa-pencil" aria-hidden="true"></i></button>
            <button class="btn-icon danger delete-schedule" type="button" title="Delete schedule" data-id="${escapeHtml(schedule.id)}"><i class="fa-solid fa-trash" aria-hidden="true"></i></button>
          </div>
        </td>
      </tr>
    `).join("");

    document.querySelectorAll(".edit-schedule").forEach((button) => {
      button.addEventListener("click", () => {
        const schedule = schedules.find((item) => String(item.id) === button.dataset.id);
        openScheduleModal(schedule);
      });
    });

    document.querySelectorAll(".delete-schedule").forEach((button) => {
      button.addEventListener("click", () => deleteSchedule(button.dataset.id));
    });
  } catch (error) {
    setMessage("scheduleMessage", error.message, "error");
  }
}

async function deleteSchedule(id) {
  if (!window.confirm("Delete this schedule?")) return;
  try {
    await apiFetch(`/api/admin/schedule/${encodeURIComponent(id)}`, { method: "DELETE" });
    setMessage("scheduleMessage", "Schedule deleted successfully.", "success");
    await loadSchedules();
  } catch (error) {
    setMessage("scheduleMessage", error.message, "error");
  }
}

scheduleForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = document.getElementById("scheduleId").value;
  const payload = {
    course_code: document.getElementById("courseCode").value.trim(),
    room_id: document.getElementById("roomId").value.trim(),
    day_of_week: document.getElementById("dayOfWeek").value,
    start_time: document.getElementById("startTime").value,
    end_time: document.getElementById("endTime").value,
    year: Number(document.getElementById("scheduleYear").value)
  };

  try {
    const url = id ? `/api/admin/schedule/${encodeURIComponent(id)}` : "/api/admin/add-schedule";
    const method = id ? "PUT" : "POST";
    await apiFetch(url, { method, body: JSON.stringify(payload) });
    closeScheduleModal();
    setMessage("scheduleMessage", id ? "Schedule updated successfully." : "Schedule added successfully.", "success");
    await loadSchedules();
  } catch (error) {
    setMessage("scheduleMessage", error.message, "error");
  }
});

document.getElementById("addSchedule").addEventListener("click", () => openScheduleModal());
document.querySelectorAll("[data-close-modal]").forEach((button) => button.addEventListener("click", closeScheduleModal));
scheduleModal.addEventListener("click", (event) => {
  if (event.target === scheduleModal) closeScheduleModal();
});

loadSchedules();

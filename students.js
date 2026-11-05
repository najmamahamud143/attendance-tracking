const studentRows = document.getElementById("studentRows");
const studentModal = document.getElementById("studentModal");
const studentForm = document.getElementById("studentForm");
let students = [];

initShell("students");

function openStudentModal(student = null) {
  studentForm.reset();
  document.getElementById("studentModalTitle").textContent = student ? "Edit Student" : "Add Student";
  document.getElementById("regNumber").value = student?.reg_number || "";
  document.getElementById("regNumber").disabled = Boolean(student);
  document.getElementById("studentName").value = student?.name || "";
  document.getElementById("tagId").value = student?.tag_id || "";
  document.getElementById("studentYear").value = String(student?.year || "4");
  studentModal.dataset.mode = student ? "edit" : "add";
  studentModal.classList.add("open");
  (student ? document.getElementById("studentName") : document.getElementById("regNumber")).focus();
}

function closeStudentModal() {
  studentModal.classList.remove("open");
  document.getElementById("regNumber").disabled = false;
}

async function loadStudents() {
  try {
    clearMessage("studentMessage");
    students = await apiFetch("/api/admin/students");
    if (!Array.isArray(students) || students.length === 0) {
      renderEmptyTable(studentRows, 5, "fa-user-plus", "No students have been added yet.");
      return;
    }

    studentRows.innerHTML = students.map((student) => `
      <tr>
        <td>${escapeHtml(student.reg_number)}</td>
        <td>${escapeHtml(student.name)}</td>
        <td>${escapeHtml(student.tag_id)}</td>
        <td>Year ${escapeHtml(student.year)}</td>
        <td>
          <div class="actions">
            <button class="btn-icon edit-student" type="button" title="Edit student" data-reg="${escapeHtml(student.reg_number)}"><i class="fa-solid fa-pencil" aria-hidden="true"></i></button>
            <button class="btn-icon danger delete-student" type="button" title="Delete student" data-reg="${escapeHtml(student.reg_number)}"><i class="fa-solid fa-trash" aria-hidden="true"></i></button>
          </div>
        </td>
      </tr>
    `).join("");

    document.querySelectorAll(".edit-student").forEach((button) => {
      button.addEventListener("click", () => {
        const student = students.find((item) => item.reg_number === button.dataset.reg);
        openStudentModal(student);
      });
    });

    document.querySelectorAll(".delete-student").forEach((button) => {
      button.addEventListener("click", () => deleteStudent(button.dataset.reg));
    });
  } catch (error) {
    setMessage("studentMessage", error.message, "error");
  }
}

async function deleteStudent(regNumber) {
  if (!window.confirm("Delete this student?")) return;
  try {
    await apiFetch(`/api/admin/students/${encodeURIComponent(regNumber)}`, { method: "DELETE" });
    setMessage("studentMessage", "Student deleted successfully.", "success");
    await loadStudents();
  } catch (error) {
    setMessage("studentMessage", error.message, "error");
  }
}

studentForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const regNumber = document.getElementById("regNumber").value.trim();
  const isEdit = studentModal.dataset.mode === "edit";
  const payload = {
    reg_number: regNumber,
    name: document.getElementById("studentName").value.trim(),
    tag_id: document.getElementById("tagId").value.trim(),
    year: Number(document.getElementById("studentYear").value)
  };

  try {
    if (isEdit) {
      await apiFetch(`/api/admin/students/${encodeURIComponent(regNumber)}`, {
        method: "PUT",
        body: JSON.stringify({ name: payload.name, tag_id: payload.tag_id, year: payload.year })
      });
    } else {
      await apiFetch("/api/admin/students", { method: "POST", body: JSON.stringify(payload) });
    }
    closeStudentModal();
    setMessage("studentMessage", isEdit ? "Student updated successfully." : "Student added successfully.", "success");
    await loadStudents();
  } catch (error) {
    setMessage("studentMessage", error.message, "error");
  }
});

document.getElementById("addStudent").addEventListener("click", () => openStudentModal());
document.querySelectorAll("[data-close-modal]").forEach((button) => button.addEventListener("click", closeStudentModal));
studentModal.addEventListener("click", (event) => {
  if (event.target === studentModal) closeStudentModal();
});

loadStudents();

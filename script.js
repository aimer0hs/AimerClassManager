const app = {
  classes: JSON.parse(localStorage.getItem("classes")) || [],
  currentClass: null,
  defaultSessions: 10,
};

document.addEventListener("DOMContentLoaded", () => {
  const homePage = document.getElementById("home-page");
  const classPage = document.getElementById("class-page");
  const classList = document.getElementById("class-list");
  const classTitle = document.getElementById("class-title");
  const classDescription = document.getElementById("class-description");
  const attendanceTable = document.getElementById("attendance-table").querySelector("tbody");
  const tableHead = document.getElementById("attendance-table").querySelector("thead tr");
  const addClassBtn = document.getElementById("add-class-btn");
  const resetAllBtn = document.createElement("button");
  resetAllBtn.id = "reset-all-btn";
  resetAllBtn.textContent = "Reset All Data";
  resetAllBtn.style.marginTop = "20px";
  resetAllBtn.addEventListener("click", resetAllData);
  homePage.appendChild(resetAllBtn);
  const backBtn = document.getElementById("back-btn");
  const addStudentBtn = document.getElementById("add-student-btn");
  const addSessionBtn = document.getElementById("add-session-btn");
  const removeSessionBtn = document.getElementById("remove-session-btn");

  function saveData() {
    localStorage.setItem("classes", JSON.stringify(app.classes));
  }

  function renderClassList() {
    classList.innerHTML = "";
    app.classes.forEach((cls, index) => {
      const div = document.createElement("div");
      div.className = "class-item";
      div.textContent = cls.name;
      div.addEventListener("click", () => openClass(index));
      classList.appendChild(div);
    });
  }

  function openClass(index) {
    app.currentClass = index;
    const cls = app.classes[index];
    classTitle.textContent = cls.name;
    classDescription.value = cls.description;
    renderAttendanceTable();
    homePage.classList.add("hidden");
    classPage.classList.remove("hidden");
  }

  function renderAttendanceTable() {
    const cls = app.classes[app.currentClass];
    attendanceTable.innerHTML = "";
    tableHead.innerHTML = `<th>Student Name</th><th>Avg Marks</th>`; // Reset table headers

    cls.sessions.forEach((sessionName, j) => {
      const th = document.createElement("th");
      th.textContent = sessionName;
      tableHead.appendChild(th);
    });

    cls.students.forEach((student, i) => {
      const row = document.createElement("tr");

      // Student Name Cell
      const nameCell = document.createElement("td");
      nameCell.textContent = student.name;
      row.appendChild(nameCell);

      // Average Marks Cell
      const marksCell = document.createElement("td");
      const avgMarks = calculateAverageMarks(cls, i);
      marksCell.textContent = avgMarks.toFixed(1);
      row.appendChild(marksCell);

      // Session Cells
      cls.sessions.forEach((_, j) => {
        const cell = document.createElement("td");

        // Mark Input
        const markInput = document.createElement("input");
        markInput.type = "number";
        markInput.min = 0;
        markInput.max = 100;
        markInput.value = cls.marks[j][i] || 0;
        markInput.style.width = "50px";
        markInput.addEventListener("input", (e) => {
          cls.marks[j][i] = parseInt(e.target.value) || 0;
          marksCell.textContent = calculateAverageMarks(cls, i).toFixed(1);
          saveData();
        });
        cell.appendChild(markInput);

        // Attendance Checkbox
        const attendanceCheckbox = document.createElement("input");
        attendanceCheckbox.type = "checkbox";
        attendanceCheckbox.checked = cls.attendance[j][i] || false;
        attendanceCheckbox.style.marginLeft = "10px";
        attendanceCheckbox.addEventListener("change", (e) => {
          cls.attendance[j][i] = e.target.checked;
          renderSummary();
          saveData();
        });
        cell.appendChild(attendanceCheckbox);

        row.appendChild(cell);
      });

      // Add "Remove this row" button
      const removeRowBtn = document.createElement("button");
      removeRowBtn.textContent = "Remove";
      removeRowBtn.className = "remove-row-btn";
      removeRowBtn.addEventListener("click", () => removeStudentRow(i));
      row.appendChild(removeRowBtn);

      attendanceTable.appendChild(row);
    });

    renderSummary();
  }

  function calculateAverageMarks(cls, studentIndex) {
    const marks = cls.marks.map((sessionMarks) => sessionMarks[studentIndex] || 0);
    const total = marks.reduce((sum, mark) => sum + mark, 0);
    return marks.length ? total / marks.length : 0;
  }

  function renderSummary() {
    const cls = app.classes[app.currentClass];
    const summaryRow = document.getElementById("summary-row");
    if (summaryRow) summaryRow.remove();

    const row = document.createElement("tr");
    row.id = "summary-row";

    const summaryCell = document.createElement("td");
    summaryCell.textContent = "Summary";
    summaryCell.colSpan = 2; // Span for name and avg marks columns
    row.appendChild(summaryCell);

    cls.sessions.forEach((_, sessionIndex) => {
      let attended = 0;
      const totalStudents = cls.students.length;
      cls.attendance[sessionIndex].forEach((status) => {
        if (status) attended++;
      });

      const cell = document.createElement("td");
      cell.textContent = totalStudents ? `${((attended / totalStudents) * 100).toFixed(1)}%` : "-";
      row.appendChild(cell);
    });

    attendanceTable.appendChild(row);
  }

  function removeStudentRow(studentIndex) {
    const cls = app.classes[app.currentClass];
    cls.students.splice(studentIndex, 1);
    cls.attendance.forEach((session) => session.splice(studentIndex, 1));
    cls.marks.forEach((session) => session.splice(studentIndex, 1));
    saveData();
    renderAttendanceTable();
  }

  function resetAllData() {
    if (confirm("Are you sure you want to reset all data? This action cannot be undone.")) {
      app.classes = [];
      app.currentClass = null;
      saveData();
      renderClassList();
      alert("All data has been reset.");
    }
  }

  addClassBtn.addEventListener("click", () => {
    const name = prompt("Enter class name:");
    if (name) {
      app.classes.push({
        name,
        description: "",
        students: [],
        sessions: Array.from({ length: app.defaultSessions }, (_, i) => `Session ${i + 1}`),
        attendance: Array.from({ length: app.defaultSessions }, () => []),
        marks: Array.from({ length: app.defaultSessions }, () => []),
      });
      saveData();
      renderClassList();
    }
  });

  backBtn.addEventListener("click", () => {
    classPage.classList.add("hidden");
    homePage.classList.remove("hidden");
  });

  addStudentBtn.addEventListener("click", () => {
    const name = prompt("Enter student name:");
    if (name) {
      const cls = app.classes[app.currentClass];
      cls.students.push({ name });
      cls.attendance.forEach((session) => session.push(false));
      cls.marks.forEach((session) => session.push(0));
      saveData();
      renderAttendanceTable();
    }
  });

  addSessionBtn.addEventListener("click", () => {
    const sessionName = prompt("Enter session name:") || `Session ${app.classes[app.currentClass].sessions.length + 1}`;
    const cls = app.classes[app.currentClass];
    cls.sessions.push(sessionName);
    cls.attendance.push(Array(cls.students.length).fill(false));
    cls.marks.push(Array(cls.students.length).fill(0));
    saveData();
    renderAttendanceTable();
  });

  removeSessionBtn.addEventListener("click", () => {
    const cls = app.classes[app.currentClass];
    if (cls.sessions.length > 0) {
      cls.sessions.pop();
      cls.attendance.pop();
      cls.marks.pop();
      saveData();
      renderAttendanceTable();
    }
  });

  classDescription.addEventListener("input", () => {
    const cls = app.classes[app.currentClass];
    cls.description = classDescription.value;
    saveData();
  });

  renderClassList();
});

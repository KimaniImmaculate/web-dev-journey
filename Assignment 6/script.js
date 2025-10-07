// ====== TEAM TASK TRACKER ======

// Default Members (if no data saved yet)
const defaultMembers = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "Developer" },
  { id: 2, name: "Bob Smith", email: "bob@example.com", role: "Designer" },
  { id: 3, name: "Carol White", email: "carol@example.com", role: "Project Manager" },
  { id: 4, name: "David Lee", email: "david@example.com", role: "QA Engineer" }
];

// Load from localStorage or default
let teamMembers = JSON.parse(localStorage.getItem("teamMembers")) || defaultMembers;
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Elements
const memberForm = document.getElementById("add-member-form");
const memberName = document.getElementById("member-name");
const memberEmail = document.getElementById("member-email");
const memberRole = document.getElementById("member-role");
const teamList = document.getElementById("team-list");

const assigneeSelect = document.getElementById("assignee-select");
const filterMember = document.getElementById("filter-member");

const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");

const showAll = document.getElementById("show-all");
const showCompleted = document.getElementById("show-completed");
const showPending = document.getElementById("show-pending");
const exportBtn = document.getElementById("export-json");
const clearBtn = document.getElementById("clear-data");


// ====== INITIAL RENDER ======
renderMembers();
renderTasks();


// ====== ADD MEMBER ======
memberForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const newMember = {
    id: Date.now(),
    name: memberName.value.trim(),
    email: memberEmail.value.trim(),
    role: memberRole.value.trim(),
  };

  if (!newMember.name || !newMember.email || !newMember.role) {
    alert("Please fill out all fields!");
    return;
  }

  teamMembers.push(newMember);
  saveMembers();
  renderMembers();

  memberForm.reset();
});


// ====== ADD TASK ======
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const newTask = {
    id: Date.now(),
    description: taskInput.value.trim(),
    assignee: assigneeSelect.value,
    completed: false,
  };

  if (!newTask.description || !newTask.assignee) {
    alert("Please enter a description and select a member.");
    return;
  }

  tasks.push(newTask);
  saveTasks();
  renderTasks();

  taskForm.reset();
});


// ====== RENDER MEMBERS ======
function renderMembers() {
  teamList.innerHTML = "";
  assigneeSelect.innerHTML = `<option value="" disabled selected>Assign to...</option>`;
  filterMember.innerHTML = `<option value="all">All Members</option>`;

  teamMembers.forEach((member) => {
    const card = document.createElement("div");
    card.className = "member-card";
    card.innerHTML = `
      <h3>${member.name}</h3>
      <p>${member.role}</p>
      <p>${member.email}</p>
    `;
    teamList.appendChild(card);

    // Update dropdowns
    const option = document.createElement("option");
    option.value = member.name;
    option.textContent = member.name;
    assigneeSelect.appendChild(option);

    const filterOption = document.createElement("option");
    filterOption.value = member.name;
    filterOption.textContent = member.name;
    filterMember.appendChild(filterOption);
  });
}


// ====== RENDER TASKS ======
function renderTasks(filter = "all", status = "all") {
  taskList.innerHTML = "";

  let filteredTasks = tasks;

  if (filter !== "all") {
    filteredTasks = filteredTasks.filter((t) => t.assignee === filter);
  }

  if (status === "completed") {
    filteredTasks = filteredTasks.filter((t) => t.completed);
  } else if (status === "pending") {
    filteredTasks = filteredTasks.filter((t) => !t.completed);
  }

  filteredTasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = `task-item ${task.completed ? "completed" : ""}`;
    li.innerHTML = `
      <span>${task.description} <em>(${task.assignee})</em></span>
      <div>
        <button onclick="toggleComplete(${task.id})">${task.completed ? "Undo" : "Done"}</button>
        <button onclick="deleteTask(${task.id})">🗑️</button>
      </div>
    `;
    taskList.appendChild(li);
  });
}


// ====== FILTER CONTROLS ======
filterMember.addEventListener("change", () => {
  renderTasks(filterMember.value);
});

showAll.addEventListener("click", () => renderTasks(filterMember.value, "all"));
showCompleted.addEventListener("click", () => renderTasks(filterMember.value, "completed"));
showPending.addEventListener("click", () => renderTasks(filterMember.value, "pending"));


// ====== TOGGLE COMPLETE ======
function toggleComplete(id) {
  tasks = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
  saveTasks();
  renderTasks(filterMember.value);
}


// ====== DELETE TASK ======
function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  renderTasks(filterMember.value);
}


// ====== EXPORT JSON ======
exportBtn.addEventListener("click", () => {
  const data = { teamMembers, tasks };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "team_data.json";
  a.click();

  URL.revokeObjectURL(url);
});


// ====== CLEAR DATA ======
clearBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all data?")) {
    localStorage.clear();
    teamMembers = [...defaultMembers]; // reset to default members
    tasks = [];
    renderMembers();
    renderTasks();
  }
});


// ====== SAVE FUNCTIONS ======
function saveMembers() {
  localStorage.setItem("teamMembers", JSON.stringify(teamMembers));
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}


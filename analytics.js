document.addEventListener("DOMContentLoaded", async () => {
  // -----------------------
  // Tabs logic
  // -----------------------
  const tabButtons = document.querySelectorAll(".tabs button");
  const sections = document.querySelectorAll(".section");

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      // Activate button
      tabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      // Show section
      const target = btn.getAttribute("data-tab");
      sections.forEach(s => s.classList.remove("active"));
      document.getElementById(target).classList.add("active");
    });
  });

  // -----------------------
  // Load sessions data
  // -----------------------
  let sessions = [];
  try {
    sessions = await DB.getSessions();
    if (!sessions || sessions.length === 0) {
      document.body.innerHTML += "<p>No sessions found.</p>";
      return;
    }
  } catch (err) {
    console.error(err);
    document.body.innerHTML += "<p>Error loading sessions.</p>";
    return;
  }

  // -----------------------
  // 1️⃣ Summary Charts & Table
  // -----------------------
  const taskTotals = {};
  const typeTotals = { work: 0, break: 0 };
  sessions.forEach(s => {
    const name = s.task_name || "Working";
    taskTotals[name] = (taskTotals[name] || 0) + (s.duration || 0);
    typeTotals[s.session_type] = (typeTotals[s.session_type] || 0) + (s.duration || 0);
  });

  // Task bar chart
  new Chart(document.getElementById("taskChart").getContext("2d"), {
    type: "bar",
    data: {
      labels: Object.keys(taskTotals),
      datasets: [{
        label: "Hours Worked",
        data: Object.values(taskTotals).map(d => d / 3600),
        backgroundColor: "#4bc0c0"
      }]
    },
    options: { scales: { y: { beginAtZero: true, title: { display: true, text: "Hours" } } } }
  });

  // Work vs Break doughnut
  new Chart(document.getElementById("typeChart").getContext("2d"), {
    type: "doughnut",
    data: {
      labels: ["Work", "Break"],
      datasets: [{ data: [typeTotals.work / 3600, typeTotals.break / 3600], backgroundColor: ["#36a2eb","#ff6384"] }]
    },
    options: { plugins: { legend: { position: "bottom" } } }
  });

  // Session table
  const tbody = document.querySelector("#sessionTable tbody");
  sessions.forEach(s => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${s.id}</td>
      <td>${s.task_name}</td>
      <td>${s.start_time}</td>
      <td>${s.end_time}</td>
      <td>${s.duration}</td>
      <td>${s.session_type}</td>
    `;
    tbody.appendChild(tr);
  });

  // -----------------------
  // 2️⃣ Trends (timeline)
  // -----------------------
  sessions.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
  const labelsTimeline = sessions.map(s => new Date(s.start_time).toLocaleTimeString());
  const dataTimeline = sessions.map(s => s.duration / 60); // minutes
  const bgTimeline = sessions.map(s => s.session_type === "work" ? "#36a2eb" : "#ff6384");

  new Chart(document.getElementById("timelineChart").getContext("2d"), {
    type: "bar",
    data: { labels: labelsTimeline, datasets: [{ label: "Duration (min)", data: dataTimeline, backgroundColor: bgTimeline }] },
    options: { scales: { y: { beginAtZero: true, title: { display: true, text: "Minutes" } } } }
  });

  // -----------------------
  // 3️⃣ Task Details (pie + stats table)
  // -----------------------
  const taskStats = {};
  sessions.forEach(s => {
    const name = s.task_name || "Working";
    if (!taskStats[name]) taskStats[name] = { total: 0, count: 0 };
    taskStats[name].total += s.duration || 0;
    taskStats[name].count += 1;
  });

  const taskLabels = Object.keys(taskStats);
  const taskTotalsPie = taskLabels.map(l => taskStats[l].total / 3600);

  // Pie chart
  new Chart(document.getElementById("taskPieChart").getContext("2d"), {
    type: "pie",
    data: { labels: taskLabels, datasets: [{ data: taskTotalsPie, backgroundColor: taskLabels.map((_, i) => `hsl(${i*60 % 360},70%,50%)`) }] }
  });

  // Stats table
  const tbodyTask = document.querySelector("#taskStatsTable tbody");
  taskLabels.forEach(l => {
    const stat = taskStats[l];
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${l}</td>
      <td>${stat.total}</td>
      <td>${Math.round(stat.total / stat.count)}</td>
      <td>${stat.count}</td>
    `;
    tbodyTask.appendChild(tr);
  });

});

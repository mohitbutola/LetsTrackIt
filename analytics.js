async function loadAnalytics() {
  try {
    const sessions = await DB.getSessions(); // same as in popup.js
    
    if (!sessions || sessions.length === 0) {
      document.body.innerHTML += "<p>No sessions recorded yet.</p>";
      return;
    }

    // Fill table
    const tbody = document.querySelector("#dataTable tbody");
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

    // Prepare chart data
    const labels = sessions.map(s => s.task_name + " (" + s.session_type + ")");
    const durations = sessions.map(s => s.duration);
    const backgroundColors = sessions.map(s => s.session_type === "work" 
      ? 'rgba(75, 192, 192, 0.6)' 
      : 'rgba(255, 99, 132, 0.6)');

    const ctx = document.getElementById("durationChart").getContext("2d");
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Duration (seconds)',
          data: durations,
          backgroundColor: backgroundColors
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: 'Duration (s)' } },
          x: { title: { display: true, text: 'Task (Session Type)' } }
        }
      }
    });

  } catch (err) {
    console.error("Error loading analytics:", err);
    alert("Failed to load analytics data");
  }
}

// Load analytics on page load
document.addEventListener("DOMContentLoaded", loadAnalytics);

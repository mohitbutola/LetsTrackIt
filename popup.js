// Popup UI + timer logic
const startBtn = document.getElementById("startBtn");
const breakBtn = document.getElementById("breakBtn");
const pauseBtn = document.getElementById("pauseBtn");
const stopBtn = document.getElementById("stopBtn");
const taskNameInput = document.getElementById("taskName");
const timerDisplay = document.getElementById("timerDisplay");
const messageDiv = document.getElementById("message");
const summaryBtn = document.getElementById("summaryBtn");
const exportBtn = document.getElementById("exportBtn");

let timerInterval = null;

function formatSeconds(sec) {
  const hrs = String(Math.floor(sec / 3600)).padStart(2, "0");
  const mins = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
  const secs = String(sec % 60).padStart(2, "0");
  return `${hrs}:${mins}:${secs}`;
}

function updateTimerDisplay() {
  chrome.storage.local.get(["activeSession"], (data) => {
    const session = data.activeSession;
    if (!session || !session.startTime) {
      timerDisplay.textContent = "00:00:00";
      return;
    }

    if (session.isPaused) {
      const elapsed = Math.floor(session.accumulated || 0);
      timerDisplay.textContent = formatSeconds(elapsed);
    } else {
      const now = Date.now();
      const elapsed = Math.floor((now - new Date(session.startTime).getTime()) / 1000) + (session.accumulated || 0);
      timerDisplay.textContent = formatSeconds(elapsed);
    }
  });
}

function showMessage(msg, duration = 2500) {
  messageDiv.textContent = msg;
  setTimeout(() => {
    messageDiv.textContent = "";
  }, duration);
}

function updateButtonStates() {
  chrome.storage.local.get(["activeSession"], (data) => {
    const session = data.activeSession;
    
    if (!session || !session.startTime) {
      // No active session
      startBtn.disabled = false;
      breakBtn.disabled = false;
      pauseBtn.disabled = true;
      stopBtn.disabled = true;
      pauseBtn.textContent = "Pause";
    } else if (session.isPaused) {
      // Session is paused
      startBtn.disabled = true;
      breakBtn.disabled = true;
      pauseBtn.disabled = false;
      stopBtn.disabled = false;
      pauseBtn.textContent = "Resume";
    } else {
      // Session is running
      startBtn.disabled = true;
      breakBtn.disabled = true;
      pauseBtn.disabled = false;
      stopBtn.disabled = false;
      pauseBtn.textContent = "Pause";
    }
  });
}

startBtn.addEventListener("click", () => {
  console.log("Start button clicked");
  startTimer("work");
});

breakBtn.addEventListener("click", () => {
  console.log("Break button clicked");
  startTimer("break");
});

pauseBtn.addEventListener("click", togglePause);
stopBtn.addEventListener("click", stopTimer);
summaryBtn.addEventListener("click", openSummary);
exportBtn.addEventListener("click", exportCSV);

function startTimer(type) {
  console.log("startTimer called with type:", type);
  
  chrome.storage.local.get(["activeSession"], (data) => {
    console.log("Current activeSession:", data.activeSession);
    
    if (data.activeSession && data.activeSession.startTime) {
      showMessage("A session is already running. Stop it first.");
      return;
    }

    const session = {
      startTime: new Date().toISOString(),
      sessionType: type,
      taskName: taskNameInput.value.trim() || "Working",
      isPaused: false,
      accumulated: 0
    };

    console.log("Creating new session:", session);

    chrome.storage.local.set({ activeSession: session }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error saving session:", chrome.runtime.lastError);
        showMessage("Error starting session");
        return;
      }
      
      console.log("Session saved successfully");
      showMessage(type === "work" ? "Work session started ✓" : "Break started ✓");
      updateButtonStates();
      updateTimerDisplay();
    });
  });
}

function togglePause() {
  chrome.storage.local.get(["activeSession"], (data) => {
    const session = data.activeSession;
    
    if (!session || !session.startTime) {
      showMessage("No running session");
      return;
    }

    if (session.isPaused) {
      // Resume
      const pausedDuration = session.accumulated || 0;
      session.startTime = new Date().toISOString();
      session.accumulated = pausedDuration;
      session.isPaused = false;
      
      chrome.storage.local.set({ activeSession: session }, () => {
        showMessage("Session resumed ▶");
        updateButtonStates();
      });
    } else {
      // Pause
      const now = Date.now();
      const elapsed = Math.floor((now - new Date(session.startTime).getTime()) / 1000);
      session.accumulated = (session.accumulated || 0) + elapsed;
      session.isPaused = true;
      
      chrome.storage.local.set({ activeSession: session }, () => {
        showMessage("Session paused ⏸");
        updateButtonStates();
      });
    }
  });
}

function stopTimer() {
  chrome.storage.local.get(["activeSession"], async (data) => {
    const session = data.activeSession;
    
    if (!session || !session.startTime) {
      showMessage("No session to stop");
      return;
    }

    const endTime = new Date();
    let duration;
    
    if (session.isPaused) {
      duration = session.accumulated || 0;
    } else {
      const elapsed = Math.floor((endTime.getTime() - new Date(session.startTime).getTime()) / 1000);
      duration = (session.accumulated || 0) + elapsed;
    }

    const completedSession = {
      id: "s_" + Date.now(),
      task_name: session.taskName || "Working",
      start_time: session.startTime,
      end_time: endTime.toISOString(),
      duration: duration,
      session_type: session.sessionType || "work"
    };

    try {
      await DB.addSession(completedSession);
      
      chrome.storage.local.remove("activeSession", () => {
        timerDisplay.textContent = "00:00:00";
        showMessage("Session saved ✓");
        updateButtonStates();
      });
    } catch (error) {
      console.error("Error saving session:", error);
      showMessage("Error saving session");
    }
  });
}

async function openSummary() {
  try {
    const sessions = await DB.getSessions();
    
    if (!sessions || sessions.length === 0) {
      showMessage("No sessions recorded yet", 3000);
      return;
    }

    const totalWork = sessions
      .filter((s) => s.session_type === "work")
      .reduce((sum, s) => sum + (s.duration || 0), 0);
    
    const totalBreak = sessions
      .filter((s) => s.session_type === "break")
      .reduce((sum, s) => sum + (s.duration || 0), 0);

    const msg = `📊 Work: ${formatSeconds(totalWork)} | Break: ${formatSeconds(totalBreak)} | Total Sessions: ${sessions.length}`;
    showMessage(msg, 5000);
  } catch (error) {
    console.error("Error loading summary:", error);
    showMessage("Error loading summary");
  }
}

async function exportCSV() {
  try {
    const sessions = await DB.getSessions();
    
    if (!sessions || sessions.length === 0) {
      showMessage("No sessions to export", 2500);
      return;
    }

    const csv = sessionsToCSV(sessions);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `letstrackit_sessions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showMessage("CSV exported ✓");
  } catch (error) {
    console.error("Error exporting CSV:", error);
    showMessage("Error exporting CSV");
  }
}

// Initialize and start timer updates
(function init() {
  console.log("Initializing popup...");
  updateButtonStates();
  updateTimerDisplay();
  
  // Update timer display every second
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  timerInterval = setInterval(updateTimerDisplay, 1000);
  
  console.log("Popup initialized");
})();
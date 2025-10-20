// Injects a floating mini-timer into pages
(function () {
  if (window.__letsTrackItInjected) return;
  window.__letsTrackItInjected = true;

  const el = document.createElement("div");
  el.id = "lti-mini-timer";
  el.style.position = "fixed";
  el.style.right = "16px";
  el.style.bottom = "16px";
  el.style.zIndex = "2147483647";
  el.style.background = "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)";
  el.style.border = "none";
  el.style.padding = "12px 16px";
  el.style.borderRadius = "12px";
  el.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1) inset";
  el.style.fontFamily = "Inter, -apple-system, BlinkMacSystemFont, Arial, sans-serif";
  el.style.fontSize = "13px";
  el.style.cursor = "move";
  el.style.color = "white";
  el.style.backdropFilter = "blur(10px)";
  el.style.transition = "all 0.3s ease";
  el.style.userSelect = "none";
  el.style.minWidth = "140px";
  
  el.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
      <div id="lti-mini-pulse" style="width: 8px; height: 8px; background: #6b7280; border-radius: 50%; transition: all 0.3s ease;"></div>
      <div id="lti-mini-time" style="font-weight: 600; font-size: 16px; letter-spacing: 0.5px;">00:00:00</div>
    </div>
    <div id="lti-mini-text" style="font-size: 11px; opacity: 0.9; font-weight: 500;">Idle</div>
    <div id="lti-task-name" style="font-size: 10px; opacity: 0.7; margin-top: 2px; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"></div>
  `;

  // Add pulse animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes lti-pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(0.9); }
    }
    .lti-pulsing {
      animation: lti-pulse 2s infinite;
    }
    #lti-mini-timer:hover {
      transform: scale(1.05);
      box-shadow: 0 12px 32px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.2) inset !important;
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(el);

  // Drag functionality
  let isDown = false, startX, startY, origX, origY;
  
  el.addEventListener("mousedown", (e) => {
    isDown = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = el.getBoundingClientRect();
    origX = rect.left;
    origY = rect.top;
    e.preventDefault();
    el.style.cursor = "grabbing";
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    el.style.left = origX + dx + "px";
    el.style.top = origY + dy + "px";
    el.style.right = "auto";
    el.style.bottom = "auto";
  });

  document.addEventListener("mouseup", () => {
    isDown = false;
    el.style.cursor = "move";
  });

  // Update timer display
  function updateMiniTimer() {
    chrome.storage.local.get(["activeSession"], (data) => {
      const session = data.activeSession;
      const timeDiv = document.getElementById("lti-mini-time");
      const textDiv = document.getElementById("lti-mini-text");
      const taskDiv = document.getElementById("lti-task-name");
      const pulseDiv = document.getElementById("lti-mini-pulse");
      
      if (!timeDiv || !textDiv || !taskDiv || !pulseDiv) return;

      if (!session || !session.startTime) {
        // Idle state
        timeDiv.textContent = "00:00:00";
        textDiv.textContent = "Idle";
        taskDiv.textContent = "";
        el.style.background = "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)";
        pulseDiv.style.background = "#6b7280";
        pulseDiv.classList.remove("lti-pulsing");
        return;
      }

      // Show task name
      if (session.taskName) {
        taskDiv.textContent = session.taskName;
      }

      let elapsed;
      if (session.isPaused) {
        elapsed = Math.floor(session.accumulated || 0);
        textDiv.textContent = "⏸ Paused";
        el.style.background = "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)";
        pulseDiv.style.background = "#fbbf24";
        pulseDiv.classList.remove("lti-pulsing");
      } else {
        const now = Date.now();
        const startMs = new Date(session.startTime).getTime();
        elapsed = Math.floor((now - startMs) / 1000) + (session.accumulated || 0);
        
        if (session.sessionType === "work") {
          textDiv.textContent = "💼 Working";
          el.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
          pulseDiv.style.background = "#10b981";
        } else {
          textDiv.textContent = "☕ Break";
          el.style.background = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
          pulseDiv.style.background = "#34d399";
        }
        pulseDiv.classList.add("lti-pulsing");
      }

      const hrs = String(Math.floor(elapsed / 3600)).padStart(2, "0");
      const mins = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
      const secs = String(elapsed % 60).padStart(2, "0");
      timeDiv.textContent = `${hrs}:${mins}:${secs}`;
    });
  }

  // Update immediately and then every second
  updateMiniTimer();
  setInterval(updateMiniTimer, 1000);

  // Listen for storage changes to update immediately
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.activeSession) {
      updateMiniTimer();
    }
  });

  console.log("LetsTrackIt floating timer injected");
})();
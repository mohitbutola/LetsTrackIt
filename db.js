// Simple DB wrapper using chrome.storage.local
// Stores sessions as an array under key 'sessions'

const DB = {
  async getSessions() {
    return new Promise((res) => {
      chrome.storage.local.get({ sessions: [] }, (data) =>
        res(data.sessions || [])
      );
    });
  },
  async saveSessions(sessions) {
    return new Promise((res) => {
      chrome.storage.local.set({ sessions }, () => res(true));
    });
  },
  async addSession(session) {
    const sessions = await DB.getSessions();
    sessions.push(session);
    await DB.saveSessions(sessions);
  },
  async clearAll() {
    return new Promise((res) => {
      chrome.storage.local.set({ sessions: [] }, () => res(true));
    });
  },
};
// helper to export CSV
function sessionsToCSV(sessions = []) {
  if (!sessions || !Array.isArray(sessions)) return '';
  
  const header = [
    "id",
    "task_name",
    "start_time",
    "end_time",
    "duration_seconds",
    "session_type",
  ];
  const rows = sessions.map((s) =>
    [
      s.id || "",
      '"' + (s.task_name || "") + '"',
      s.start_time || "",
      s.end_time || "",
      s.duration || "",
      s.session_type || "",
    ].join(",")
  );
  return [header.join(","), ...rows].join("\n");
}

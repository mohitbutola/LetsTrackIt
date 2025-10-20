# LetsTrackIt – Chrome Extension

**LetsTrackIt** is a lightweight Chrome extension for tracking work and break sessions. It provides real-time timers, session logging, CSV export, and analytics—all stored locally in the browser.

---

## Project Structure

```
LetsTrackIt/
├── manifest.json           # Chrome extension manifest
├── popup.html              # Extension popup UI
├── popup.js                # Popup timer and session logic
├── background.js           # Background scripts (if needed)
├── content.js              # Content scripts (for page interaction / floating widget)
├── styles.css              # Common styling
├── db.js                   # Local storage abstraction for sessions
├── README.md               # Project documentation
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## Installation / Loading Locally

1. Clone or download the project folder `LetsTrackIt`.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable **Developer Mode** (toggle switch at top right).
4. Click **Load unpacked** and select the `LetsTrackIt` folder.
5. The **LetsTrackIt icon** will appear in the toolbar. Click it to open the popup.

---

## Features

* **Session Tracking:** Start work/break sessions with a live timer.
* **Pause/Resume:** Control your session with pause and resume options.
* **Session Logging:** All sessions are stored locally in `chrome.storage.local` and persist using sqlLite.
* **Export CSV:** Easily export session data for reporting or analysis.
* **Analytics Dashboard:** View task summaries, work vs break distribution, session trends, and detailed task stats—all in-browser.
* **MVP Local Storage:** No backend required; all data stays on the client browser.

---

## Future Improvements

* **Dashboard Enhancements:** Add weekly/daily views, charts, and trends.
* **Cloud Sync & Authentication (Optional):** Sync sessions across devices.
* **UI Enhancements:** Improve design and add icons for better UX.

---

## Notes

* Current MVP keeps all data **local to the browser**.
* The extension uses **Chrome APIs** only; no external server is required.
* Designed to be **lightweight, fast, and easy to extend**.

---

## Screenshots 

<img width="537" height="553" alt="image" src="https://github.com/user-attachments/assets/6597d803-9f08-4592-8235-7082d95102f8" />
<img width="936" height="572" alt="image" src="https://github.com/user-attachments/assets/594e466d-10bf-4a32-8707-ca6d99f30f49" />
<img width="1730" height="513" alt="image" src="https://github.com/user-attachments/assets/f246dd64-5491-4833-a746-188bd29e5a81" />
<img width="758" height="512" alt="image" src="https://github.com/user-attachments/assets/cb3a0a70-1111-49ce-ba95-2b282613b321" />
<img width="850" height="922" alt="image" src="https://github.com/user-attachments/assets/0bbf91b4-d03b-4778-b8bd-95683814ee82" />


---

## License


# LetsTrackIt - Chrome Extension

## Project structure

LetsTrackIt/
├── manifest.json
├── popup.html
├── popup.js
├── background.js
├── content.js
├── styles.css
├── db.js
├── README.md
└── icons/
├── icon16.png
├── icon48.png
└── icon128.png

## How to load locally

1. Create folder `LetsTrackIt` and add files exactly as provided.
2. Open Chrome -> Extensions -> Toggle Developer Mode -> Load unpacked ->
   select the `LetsTrackIt` folder.
3. The LetsTrackIt icon will appear in the toolbar. Click to open popup.

## Notes

- This MVP uses `chrome.storage.local` to store sessions. It keeps everything
  local to the browser.
- If you prefer SQLite, we can replace the storage layer with `sql.js` to
  persist an actual SQLite file inside extension storage.

## Next improvements

- Persist floating widget state (show/hide) and session start from popup to
  content script via `chrome.storage`.
- Add weekly/daily dashboard page (local web UI) using the stored sessions.
- Add authentication & cloud sync (optional).

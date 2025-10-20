// Background worker: can be used to fire alarms or persist long running tasks if required.
chrome.runtime.onInstalled.addListener(() => {
  console.log("LetsTrackIt installed");
});
// Placeholder to show how alarms could be used in future
chrome.alarms.onAlarm.addListener((alarm) => {
  console.log("Alarm fired", alarm);
});




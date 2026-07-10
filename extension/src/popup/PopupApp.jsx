import React, { useEffect, useState } from "react";
import { storageGet, storageSet } from "../shared/storage";

export default function PopupApp() {
  const [backendUrl, setBackendUrl] = useState("http://localhost:5000");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    storageGet("backendUrl").then((r) => {
      if (r.backendUrl) setBackendUrl(r.backendUrl);
    });
  }, []);

  const openPanel = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) chrome.tabs.sendMessage(tab.id, { type: "JARVIS_TOGGLE_PANEL" });
    window.close();
  };

  const saveBackendUrl = async () => {
    await storageSet({ backendUrl });
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };

  return (
    <div className="popup">
      <header>
        <span className="popup__logo">J</span>
        <h1>Jarvis</h1>
      </header>

      <p className="popup__hint">
        Open the assistant on any page with <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>J</kbd>, or the
        button below.
      </p>

      <button className="popup__primary" onClick={openPanel}>
        Open assistant on this page
      </button>

      <label className="popup__label" htmlFor="backend-url">
        Backend URL
      </label>
      <div className="popup__row">
        <input
          id="backend-url"
          type="text"
          value={backendUrl}
          onChange={(e) => setBackendUrl(e.target.value)}
        />
        <button onClick={saveBackendUrl}>{saved ? "Saved" : "Save"}</button>
      </div>
    </div>
  );
}

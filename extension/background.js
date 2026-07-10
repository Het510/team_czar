// background.js — Manifest V3 service worker
//
// Responsibilities (new):
//   1. Listen for the "toggle-jarvis" keyboard command (Ctrl+Shift+J) and tell the
//      active tab's content script to show/hide the assistant panel.
//   2. Act as a thin relay between the popup / content script and the backend
//      server, so the extension never needs "backend URL" host permissions
//      sprinkled across multiple files, and so future CORS issues on the
//      backend are avoided (a MV3 service worker fetch is not subject to the
//      page's CORS policy the way a content-script fetch would be).
//   3. Keep track of which tabId currently has the panel open, purely for the
//      toolbar icon / popup status display.
//
// Nothing here talks to speech APIs — that logic lives entirely in
// content.js / the panel, exactly like it did in the original app.js.

const DEFAULT_BACKEND_URL = "http://localhost:5000";

// in-memory (per service-worker lifetime) map of tabId -> panel open state
const panelState = new Map();

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "toggle-jarvis") return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) return;
  sendTogglePanel(tab.id);
});

// Toolbar icon click also opens the panel (in addition to showing the popup),
// this listener only fires if there is NO default_popup — kept here for
// robustness in case default_popup is ever removed.
chrome.action.onClicked.addListener((tab) => {
  if (tab && tab.id) sendTogglePanel(tab.id);
});

function sendTogglePanel(tabId) {
  chrome.tabs
    .sendMessage(tabId, { type: "JARVIS_TOGGLE_PANEL" })
    .catch(() => {
      // content script may not be injected yet (e.g. chrome:// pages) — ignore
    });
}

// Relay: popup / content script -> backend server.
// Using a background fetch keeps the Gemini/backend base URL configuration
// in one place and avoids re-implementing retry/error handling everywhere.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "JARVIS_PANEL_STATE") {
    if (sender.tab?.id) panelState.set(sender.tab.id, message.open);
    return false;
  }

  if (message?.type === "JARVIS_API_REQUEST") {
    handleApiRequest(message).then(sendResponse);
    return true; // keep the message channel open for the async response
  }

  if (message?.type === "JARVIS_GET_PANEL_STATE") {
    const tabId = message.tabId ?? sender.tab?.id;
    sendResponse({ open: panelState.get(tabId) ?? false });
    return false;
  }

  return false;
});

async function handleApiRequest({ path, payload }) {
  try {
    const { backendUrl } = await chrome.storage.local.get("backendUrl");
    const base = backendUrl || DEFAULT_BACKEND_URL;

    const res = await fetch(`${base}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, error: `Server responded ${res.status}: ${text}` };
    }

    const data = await res.json();
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err?.message || "Network error reaching Jarvis backend" };
  }
}

chrome.runtime.onInstalled.addListener(async (details) => {
  const { backendUrl } = await chrome.storage.local.get("backendUrl");
  if (!backendUrl) {
    await chrome.storage.local.set({ backendUrl: DEFAULT_BACKEND_URL });
  }
  if (details.reason === "install") {
    console.log("[Jarvis] Installed. Press Ctrl+Shift+J on any page to start.");
  }
});

# Jarvis AI Browser Companion

An upgrade of the original **Jarvis-With-JavaScript** voice assistant into a
production-ready Chrome extension (Manifest V3) that reads and discusses
**whatever page you currently have open** — nothing else. Ask it to
summarize, explain a paragraph, explain code, or just talk to it about the
page. It reads answers back out loud, and remembers where you left off.

Speech recognition, speech synthesis and the assistant's voice-driven
personality are carried over from the original `app.js` (see
`extension/src/content/hooks/useSpeechRecognition.js` and
`useSpeechSynthesis.js` for the direct port). Weather, battery, internet
status, clock, social-media shortcuts and system commands from the original
project have been removed — they didn't fit an on-page reading assistant.

---

## What's inside

```
jarvis-ai-companion/
├── extension/              Chrome extension (Manifest V3)
│   ├── manifest.json
│   ├── background.js       Service worker: keyboard shortcut, backend relay
│   ├── icons/
│   ├── src/
│   │   ├── content/        Content script: floating button, panel, voice logic
│   │   │   ├── index.jsx         entry — Shadow DOM mount, selection toolbar
│   │   │   ├── Panel.jsx         main chat/voice UI
│   │   │   ├── content.css       dark glassmorphism theme
│   │   │   ├── components/       VoiceOrb, ChatHistory, Controls, SelectionToolbar
│   │   │   ├── hooks/             useSpeechRecognition, useSpeechSynthesis
│   │   │   └── lib/               extractContent (Readability), api, voiceCommands
│   │   ├── popup/           Toolbar popup (quick open + backend URL setting)
│   │   └── shared/          chrome.storage.local helpers
│   ├── vite.content.config.js
│   ├── vite.popup.config.js
│   └── package.json
└── backend/                 Node/Express server
    ├── server.js
    ├── routes/assistant.js   /api/assistant, /api/translate, /api/health
    ├── services/gemini.js        Gemini API wrapper
    ├── services/promptBuilder.js page-grounded prompt construction
    ├── .env.example
    └── package.json
```

## How it works

1. **Content extraction** (`lib/extractContent.js`) runs Mozilla's
   **Readability** (the Firefox Reader View library) against a clone of the
   page's DOM, stripping navbars, footers, ads, and cookie banners, and
   splitting the result into paragraphs and code blocks.
2. The extracted content, the user's message, and the running conversation
   are sent to the backend, which builds a prompt that instructs Gemini to
   answer **only** from the page content (`services/promptBuilder.js`).
3. Conversation history and reading progress are saved per-page-URL in
   `chrome.storage.local` (`shared/storage.js`), so re-opening the same
   article resumes the conversation and reading position.
4. Voice commands ("summarize", "read this page", "explain this paragraph",
   "explain this code", "continue reading", "repeat", "stop reading",
   "pause", "resume", "read important points", "what does this mean?") are
   matched in `lib/voiceCommands.js` and handled in `Panel.jsx`.

## Message passing (background ↔ content script)

- `Ctrl+Shift+J` → `chrome.commands` fires in `background.js` →
  `chrome.tabs.sendMessage(tabId, { type: "JARVIS_TOGGLE_PANEL" })` →
  `content/index.jsx` toggles the panel.
- The panel calls the backend via `chrome.runtime.sendMessage({ type:
  "JARVIS_API_REQUEST", path, payload })`, which `background.js` relays with
  `fetch()` — keeping the backend URL in one place and avoiding page-level
  CSP/CORS issues that a direct content-script `fetch()` could hit.

---

## Installation

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env and set GEMINI_API_KEY (get one at https://aistudio.google.com/app/apikey)
npm start
# → Jarvis backend listening on http://localhost:5000
```

### 2. Extension

```bash
cd extension
npm install
npm run build
```

This produces `extension/dist/content.js`, `content.css`, and `popup.html`
next to `manifest.json`.

Then, in Chrome:

1. Go to `chrome://extensions`.
2. Enable **Developer mode** (top right).
3. Click **Load unpacked** and select the `extension/` folder (the one
   containing `manifest.json`).
4. Open any article or docs page and press **Ctrl+Shift+J** (or click the
   toolbar icon → "Open assistant on this page").

If your backend isn't running on `http://localhost:5000`, open the toolbar
popup and update the **Backend URL** field.

### Rebuilding during development

```bash
npm run dev:content   # rebuilds dist/content.js on change
npm run dev:popup     # rebuilds dist/popup.html on change
```

Reload the extension from `chrome://extensions` after each content-script
rebuild (Chrome doesn't hot-reload content scripts).

---

## Environment variables (backend/.env)

| Variable          | Description                                   |
|-------------------|------------------------------------------------|
| `GEMINI_API_KEY`  | Your Gemini API key                             |
| `GEMINI_MODEL`    | Model name, defaults to `gemini-1.5-flash`      |
| `PORT`            | Server port, defaults to `5000`                 |
| `CORS_ORIGIN`     | Allowed origin(s), `*` for local development    |

---

## Notes on what was preserved vs. removed

**Preserved & refactored:**
- Continuous speech recognition with auto-restart-on-end (`stopingR` →
  `stoppingRef`), now React-ified in `useSpeechRecognition.js`.
- `readOut()` / `readOutHindi()` speech synthesis pattern (fresh
  `SpeechSynthesisUtterance`, `volume = 1`, optional `lang`), extended in
  `useSpeechSynthesis.js` with pause/resume/stop/repeat/continue and
  paragraph-by-paragraph reading.
- The en-US/hi-IN language toggle, now persisted via `chrome.storage.local`
  instead of `window.localStorage`.

**Removed** (no longer relevant to an on-page reading assistant): weather,
battery, internet status, clock, social-media shortcuts (Facebook, Google,
YouTube, Instagram, Twitter, GitHub), and system commands (shutdown,
personal profile setup).

## Known limitations / next steps

- All data stays local to `chrome.storage.local`; nothing is sent anywhere
  except the current page's extracted text + your question, to your own
  backend.
- The Gemini API key currently lives server-side only (`backend/.env`) —
  it is never bundled into the extension, by design.
- The floating button and panel render inside a single Shadow DOM root
  (`#jarvis-ai-companion-host`), so the host page's CSS can never leak in or
  be leaked onto — you can safely load this on any site.

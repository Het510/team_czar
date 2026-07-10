import React from "react";

export default function Controls({
  listening,
  speaking,
  paused,
  lang,
  onToggleMic,
  onToggleLang,
  onRead,
  onPause,
  onResume,
  onStop,
}) {
  return (
    <div className="jarvis-controls">
      <button
        className={`jarvis-btn jarvis-btn--mic ${listening ? "is-active" : ""}`}
        onClick={onToggleMic}
        title={listening ? "Stop listening" : "Start listening"}
      >
        {listening ? "🎙️ Listening…" : "🎙️ Mic"}
      </button>

      <button
        className="jarvis-btn jarvis-btn--lang"
        onClick={onToggleLang}
        title={`Switch voice language (Current: ${lang === "en-US" ? "English" : "Hindi"})`}
      >
        {lang === "en-US" ? "🌐 EN" : "🌐 HI"}
      </button>

      <button className="jarvis-btn" onClick={onRead} title="Read this page aloud">
        📖 Read
      </button>

      {!paused ? (
        <button className="jarvis-btn" onClick={onPause} disabled={!speaking} title="Pause reading">
          ⏸ Pause
        </button>
      ) : (
        <button className="jarvis-btn" onClick={onResume} title="Resume reading">
          ▶️ Resume
        </button>
      )}

      <button className="jarvis-btn" onClick={onStop} disabled={!speaking && !paused} title="Stop reading">
        ⏹ Stop
      </button>
    </div>
  );
}

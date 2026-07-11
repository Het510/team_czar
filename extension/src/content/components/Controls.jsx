import React from "react";
import LanguageSelector from "./LanguageSelector";

export default function Controls({
  listening,
  speaking,
  paused,
  lang,
  alwaysOnEnabled,
  wakeListening,
  onToggleMic,
  onSwitchLang,
  onToggleAlwaysOn,
  onRead,
  onPause,
  onResume,
  onStop,
  onSummarize,
  onTranslate,
}) {
  return (
    <div className="jarvis-controls">
      {/* Row 1: Primary actions */}
      <div className="jarvis-controls__row">
        <button
          id="jarvis-mic-btn"
          className={`jarvis-btn jarvis-btn--mic ${listening ? "is-active" : ""}`}
          onClick={onToggleMic}
          title={listening ? "Click to stop listening" : "Click to start voice input"}
        >
          {listening ? "🔴 Listening…" : "🎙️ Mic"}
        </button>

        <button
          id="jarvis-summarize-btn"
          className="jarvis-btn jarvis-btn--action"
          onClick={onSummarize}
          title="Summarize this page"
        >
          🧠 Summarize
        </button>

        <button
          id="jarvis-read-btn"
          className="jarvis-btn jarvis-btn--action"
          onClick={onRead}
          title="Read this page aloud"
        >
          📖 Read
        </button>
      </div>

      {/* Row 2: Playback + translate */}
      <div className="jarvis-controls__row">
        {!paused ? (
          <button
            id="jarvis-pause-btn"
            className="jarvis-btn"
            onClick={onPause}
            disabled={!speaking}
            title="Pause reading"
          >
            ⏸ Pause
          </button>
        ) : (
          <button
            id="jarvis-resume-btn"
            className="jarvis-btn"
            onClick={onResume}
            title="Resume reading"
          >
            ▶️ Resume
          </button>
        )}

        <button
          id="jarvis-stop-btn"
          className="jarvis-btn"
          onClick={onStop}
          disabled={!speaking && !paused}
          title="Stop reading"
        >
          ⏹ Stop
        </button>

        <button
          id="jarvis-translate-btn"
          className="jarvis-btn jarvis-btn--translate"
          onClick={onTranslate}
          title="Translate page content to English"
        >
          🌐 Translate
        </button>
      </div>

      {/* Row 3: Language selector + Always-on toggle */}
      <div className="jarvis-controls__row jarvis-controls__row--settings">
        {/* Always-on wake word toggle */}
        <button
          id="jarvis-alwayson-btn"
          className={`jarvis-btn jarvis-btn--alwayson ${alwaysOnEnabled ? "is-active" : ""}`}
          onClick={onToggleAlwaysOn}
          title={
            alwaysOnEnabled
              ? `Always-on: ON — say "Hey Jarvis" to activate without pressing the mic button`
              : `Always-on: OFF — click to enable "Hey Jarvis" wake word`
          }
        >
          {alwaysOnEnabled ? (
            <>
              <span className={`jarvis-wake-dot ${wakeListening ? "is-listening" : ""}`} />
              👂 Hey Jarvis
            </>
          ) : (
            "🔇 Wake: Off"
          )}
        </button>

        {/* Language dropdown */}
        <LanguageSelector lang={lang} onSwitch={onSwitchLang} />
      </div>
    </div>
  );
}

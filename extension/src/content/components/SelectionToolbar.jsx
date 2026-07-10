import React from "react";

/**
 * Small floating toolbar that appears next to text the user selects on the
 * page. Positioned in page coordinates by the parent (index.jsx), which
 * listens for the `selectionchange`/`mouseup` events — this component is
 * purely presentational.
 */
export default function SelectionToolbar({ position, onExplain, onSummarize, onTranslate, onDismiss }) {
  if (!position) return null;

  return (
    <div
      className="jarvis-selection-toolbar"
      style={{ top: position.top, left: position.left }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button onClick={onExplain}>Explain</button>
      <button onClick={onSummarize}>Summarize</button>
      <button onClick={onTranslate}>Translate</button>
      <button className="jarvis-selection-toolbar__close" onClick={onDismiss} aria-label="Dismiss">
        ✕
      </button>
    </div>
  );
}

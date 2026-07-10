import React from "react";

/**
 * Small animated orb: pulses while the mic is listening, glows while the
 * assistant is speaking, sits still and dim otherwise. Pure CSS animation
 * (classes toggled via props) — see content.css for the keyframes.
 */
export default function VoiceOrb({ listening, speaking }) {
  const state = speaking ? "speaking" : listening ? "listening" : "idle";
  return (
    <div className={`jarvis-orb jarvis-orb--${state}`} aria-hidden="true">
      <div className="jarvis-orb__core" />
      <div className="jarvis-orb__ring" />
      <div className="jarvis-orb__ring jarvis-orb__ring--delay" />
    </div>
  );
}

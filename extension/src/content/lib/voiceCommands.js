// voiceCommands.js
//
// Small, dependency-free command matcher. Kept separate from the recognition
// hook (same separation of concerns as the original app.js, which matched
// `transcript.includes(...)` inline inside recognition.onresult).
//
// Each entry: { test(transcript) => boolean, action: string }
// `action` is handled by Panel.jsx's handleVoiceCommand().

export const VOICE_COMMANDS = [
  { action: "read_page", test: (t) => t.includes("read this page") || t.includes("read the page") },
  { action: "summarize", test: (t) => t.includes("summarize") || t.includes("summary") },
  { action: "explain_paragraph", test: (t) => t.includes("explain this paragraph") || t.includes("explain that paragraph") },
  { action: "explain_article", test: (t) => t.includes("explain this article") || t.includes("explain the article") },
  { action: "explain_code", test: (t) => t.includes("explain this code") || t.includes("explain the code") },
  { action: "continue_reading", test: (t) => t.includes("continue reading") },
  { action: "repeat", test: (t) => t.includes("repeat") },
  { action: "stop_reading", test: (t) => t.includes("stop reading") },
  { action: "pause", test: (t) => t.includes("pause") },
  { action: "resume", test: (t) => t.includes("resume") },
  { action: "skip_section", test: (t) => t.includes("skip this section") || t.includes("skip section") || t.includes("skip") },
  { action: "important_points", test: (t) => t.includes("important points") || t.includes("key points") },
  { action: "what_does_this_mean", test: (t) => t.includes("what does this mean") },
];

/** Returns the first matching action for a transcript, or null. */
export function matchVoiceCommand(transcript) {
  const match = VOICE_COMMANDS.find((c) => c.test(transcript));
  return match ? match.action : null;
}

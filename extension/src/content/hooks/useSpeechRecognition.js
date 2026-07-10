// useSpeechRecognition.js
//
// This is a direct, React-ified port of the recognition logic from the
// original app.js:
//   - same continuous + auto-restart-on-end behaviour
//   - same "stopingR" flag pattern (renamed `stoppingRef`) to distinguish a
//     user-requested stop from the browser ending recognition on its own
//   - same en-US / hi-IN language toggle, now stored via chrome.storage.local
//     instead of window.localStorage
//
// New: onCommand callback receives the recognized transcript so the panel
// can match it against the expanded voice-command list (read this page,
// summarize, explain paragraph, explain code, continue reading, repeat,
// stop reading, pause, resume, read important points, "what does this mean?").

import { useEffect, useRef, useState, useCallback } from "react";
import { storageGet, storageSet } from "../../shared/storage";

const SpeechRecognitionImpl =
  typeof window !== "undefined" &&
  (window.SpeechRecognition || window.webkitSpeechRecognition);

export function useSpeechRecognition({ onTranscript } = {}) {
  const [listening, setListening] = useState(false);
  const [lang, setLang] = useState("en-US");
  const recognitionRef = useRef(null);
  const stoppingRef = useRef(false); // same role as `stopingR` in app.js
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  // load persisted language preference (was localStorage.getItem("lang"))
  useEffect(() => {
    storageGet("jarvisLang").then(({ jarvisLang }) => {
      setLang(jarvisLang || "en-US");
    });
  }, []);

  useEffect(() => {
    if (!SpeechRecognitionImpl) return undefined;

    const recognition = new SpeechRecognitionImpl();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = lang;
    recognitionRef.current = recognition;

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript.trim().toLowerCase();
      onTranscriptRef.current?.(transcript);
    };

    // Same auto-restart pattern as the original: browsers stop the
    // recognizer periodically even in "continuous" mode, so we restart it
    // unless the user explicitly asked us to stop.
    recognition.onend = () => {
      setListening(false);
      if (!stoppingRef.current) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch {
            /* already started — ignore */
          }
        }, 500);
      }
    };

    recognition.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        stoppingRef.current = true;
      }
    };

    return () => {
      stoppingRef.current = true;
      recognition.onend = null;
      recognition.stop();
    };
  }, [lang]);

  const start = useCallback(() => {
    stoppingRef.current = false;
    try {
      recognitionRef.current?.start();
    } catch {
      /* already listening — ignore, matches original try/catch-free but
         safe behaviour of calling recognition.start() from multiple buttons */
    }
  }, []);

  const stop = useCallback(() => {
    stoppingRef.current = true;
    recognitionRef.current?.stop();
  }, []);

  const switchLanguage = useCallback(async (nextLang) => {
    await storageSet({ jarvisLang: nextLang });
    setLang(nextLang);
  }, []);

  return {
    supported: Boolean(SpeechRecognitionImpl),
    listening,
    lang,
    start,
    stop,
    switchLanguage,
  };
}

// useSpeechRecognition.js — clean, simple, button-only mic control.
// No wake word. One recognizer. No conflicts.
//
// KEY FIX: we track a `listeningRef` flag so the onend handler only
// auto-restarts when the user actually wants the mic ON. Calling stop()
// sets this flag to false so onend doesn't restart.

import { useEffect, useRef, useState, useCallback } from "react";
import { storageGet, storageSet } from "../../shared/storage";

const SpeechRecognitionImpl =
  typeof window !== "undefined" &&
  (window.SpeechRecognition || window.webkitSpeechRecognition);

export function useSpeechRecognition({ onTranscript } = {}) {
  const [listening, setListening] = useState(false);
  const [lang, setLang]           = useState("en-US");

  const recognitionRef  = useRef(null);
  const listeningRef    = useRef(false); // true = user wants mic ON
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  // Load persisted language preference
  useEffect(() => {
    storageGet("jarvisLang").then(({ jarvisLang }) => {
      setLang(jarvisLang || "en-US");
    });
  }, []);

  useEffect(() => {
    if (!SpeechRecognitionImpl) return undefined;

    const recognition = new SpeechRecognitionImpl();
    recognition.continuous     = true;
    recognition.interimResults = false;
    recognition.lang           = lang;
    recognitionRef.current     = recognition;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event) => {
      const t = event.results[event.resultIndex][0].transcript.trim();
      if (t) onTranscriptRef.current?.(t);
    };

    // Auto-restart ONLY if the user still wants the mic on.
    // This prevents the recognizer from restarting after the user clicks Stop.
    recognition.onend = () => {
      setListening(false);
      if (listeningRef.current) {
        // Chrome stops recognition after ~60s of silence — restart it.
        setTimeout(() => {
          if (listeningRef.current && recognitionRef.current === recognition) {
            try { recognition.start(); } catch { /* already started */ }
          }
        }, 300);
      }
    };

    recognition.onerror = (e) => {
      console.warn("[Jarvis mic] error:", e.error);
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        // User denied microphone — stop trying
        listeningRef.current = false;
        setListening(false);
      } else if (e.error === "no-speech" || e.error === "audio-capture") {
        // Transient errors — onend will handle restart if listeningRef is true
        setListening(false);
      }
    };

    return () => {
      listeningRef.current = false;
      recognition.onend = null;
      recognition.onerror = null;
      try { recognition.stop(); } catch { /* ignore */ }
      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
      }
    };
  }, [lang]);

  const start = useCallback(() => {
    if (listeningRef.current) return; // already on
    listeningRef.current = true;
    try { recognitionRef.current?.start(); } catch { /* already listening */ }
  }, []);

  const stop = useCallback(() => {
    if (!listeningRef.current) return; // already off
    listeningRef.current = false;
    setListening(false);
    try { recognitionRef.current?.stop(); } catch { /* already stopped */ }
  }, []);

  const switchLanguage = useCallback(async (nextLang) => {
    // Stop mic before switching language (re-creates the recognizer via useEffect)
    listeningRef.current = false;
    try { recognitionRef.current?.stop(); } catch { /* ignore */ }
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

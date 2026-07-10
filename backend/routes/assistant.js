// routes/assistant.js
import { Router } from "express";
import { generateReply } from "../services/ollama.js";
import { buildPrompt, buildTranslationPrompt } from "../services/promptBuilder.js";

const router = Router();

// POST /api/assistant
// body: { command, message, page, history, target }
router.post("/assistant", async (req, res) => {
  const { command, message, page, history, target } = req.body || {};

  if (!page || typeof page.textContent !== "string") {
    return res.status(400).json({ error: "Missing or invalid `page` content in request body" });
  }
  if (!command) {
    return res.status(400).json({ error: "Missing `command` in request body" });
  }

  try {
    const prompt = buildPrompt({ command, message, page, history, target });
    const reply = await generateReply(prompt);
    res.json({ reply });
  } catch (err) {
    console.error("[assistant] error:", err.message);
    res.status(502).json({ error: err.message });
  }
});

// POST /api/translate
// body: { text, targetLanguage }
router.post("/translate", async (req, res) => {
  const { text, targetLanguage } = req.body || {};

  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Missing `text` to translate" });
  }

  try {
    const prompt = buildTranslationPrompt({ text, targetLanguage });
    const reply = await generateReply(prompt);
    res.json({ reply });
  } catch (err) {
    console.error("[translate] error:", err.message);
    res.status(502).json({ error: err.message });
  }
});

// POST /api/health — used by background.js / popup to verify the backend
// is reachable and configured before the user relies on it.
router.post("/health", (_req, res) => {
  res.json({ reply: "ok", geminiConfigured: true });
});

export default router;

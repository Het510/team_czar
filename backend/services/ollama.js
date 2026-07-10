// services/ollama.js
//
// Simple wrapper to make HTTP POST requests to a local Ollama instance.

const modelName = process.env.OLLAMA_MODEL || "llama3";
const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";

/**
 * Sends a single prompt to a local Ollama model and returns the plain-text reply.
 */
export async function generateReply(prompt) {
  try {
    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelName,
        prompt: prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData.error || response.statusText;
      throw new Error(`Ollama error: ${errMsg}`);
    }

    const data = await response.json();
    const text = data.response;

    if (!text || !text.trim()) {
      throw new Error("Ollama returned an empty response");
    }
    return text.trim();
  } catch (err) {
    if (
      err.cause?.code === "ECONNREFUSED" ||
      err.code === "ECONNREFUSED" ||
      err.message?.includes("fetch failed")
    ) {
      throw new Error(
        `Could not connect to Ollama at ${ollamaUrl}. Please make sure Ollama is running (e.g. by running 'ollama run ${modelName}' in your terminal).`
      );
    }
    throw err;
  }
}

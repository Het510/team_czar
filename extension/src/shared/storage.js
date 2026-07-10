// storage.js — thin wrapper around chrome.storage.local.
// The original Jarvis project used window.localStorage everywhere
// (jarvis_setup, lang, etc). Manifest V3 content scripts / panels should not
// rely on localStorage for anything that needs to survive across the
// extension's different contexts (popup, panel, background), so every read
// or write in the new codebase goes through this module instead.

export async function storageGet(keys) {
  return chrome.storage.local.get(keys);
}

export async function storageSet(obj) {
  return chrome.storage.local.set(obj);
}

export async function storageRemove(keys) {
  return chrome.storage.local.remove(keys);
}

// Conversation history + reading progress are namespaced per page URL so
// that re-opening the same article resumes where you left off, while a
// different page starts a clean conversation.
export function pageKey(url) {
  // strip hash/query noise so refreshes & anchor jumps map to the same key
  try {
    const u = new URL(url);
    return `jarvis:${u.origin}${u.pathname}`;
  } catch {
    return `jarvis:${url}`;
  }
}

export async function getPageState(url) {
  const key = pageKey(url);
  const result = await storageGet(key);
  return (
    result[key] || {
      history: [], // [{ role: 'user'|'assistant', content: string }]
      readingProgress: { paragraphIndex: 0 },
      summary: null,
    }
  );
}

export async function savePageState(url, state) {
  const key = pageKey(url);
  await storageSet({ [key]: state });
}

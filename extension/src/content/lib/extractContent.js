// extractContent.js
//
// Uses Mozilla's Readability (the same library behind Firefox Reader View)
// to pull out only the meaningful content of a page — the article body,
// documentation text, blog post, research paper — while discarding navbars,
// footers, sidebars, cookie banners, ads and repeated boilerplate.
//
// Readability mutates the document it's given, so we always hand it a clone
// of the live DOM and never touch the real page.

import { Readability } from "@mozilla/readability";

// A conservative regex for recognizing fenced/code-like blocks that
// Readability sometimes keeps (docs sites, blogs with <pre><code>).
const CODE_TAGS = new Set(["PRE", "CODE"]);

export function extractPageContent() {
  const clone = document.cloneNode(true);

  // Strip obviously non-content nodes before Readability even runs — this
  // also protects against cookie-consent overlays that Readability doesn't
  // always recognize as boilerplate.
  clone
    .querySelectorAll(
      "nav, footer, header, aside, form, iframe, [role='banner'], " +
        "[role='navigation'], [role='complementary'], .cookie, .cookie-banner, " +
        "#cookie-banner, .ads, .advertisement, [class*='cookie-consent']"
    )
    .forEach((el) => el.remove());

  const reader = new Readability(clone, { keepClasses: false });
  const article = reader.parse();

  if (!article || !article.textContent || article.textContent.trim().length < 40) {
    return fallbackExtraction();
  }

  const paragraphs = splitIntoParagraphs(article.content);
  const codeBlocks = extractCodeBlocks(article.content);

  return {
    title: article.title || document.title,
    byline: article.byline || null,
    siteName: article.siteName || location.hostname,
    excerpt: article.excerpt || "",
    textContent: article.textContent.trim(),
    paragraphs,
    codeBlocks,
    url: location.href,
    wordCount: article.textContent.trim().split(/\s+/).length,
  };
}

// Used when Readability can't find a clear "article" (e.g. a web app,
// dashboard, or very short page) — falls back to visible body text.
function fallbackExtraction() {
  const bodyClone = document.body.cloneNode(true);
  bodyClone
    .querySelectorAll("nav, footer, header, aside, script, style, noscript")
    .forEach((el) => el.remove());
  const text = bodyClone.innerText.trim();
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 20);

  return {
    title: document.title,
    byline: null,
    siteName: location.hostname,
    excerpt: paragraphs[0]?.slice(0, 200) || "",
    textContent: text,
    paragraphs,
    codeBlocks: extractCodeBlocks(document.body.innerHTML),
    url: location.href,
    wordCount: text.split(/\s+/).length,
  };
}

function splitIntoParagraphs(articleHtml) {
  const container = document.createElement("div");
  container.innerHTML = articleHtml;

  const blocks = [...container.querySelectorAll("p, li, h1, h2, h3, h4, blockquote")];
  return blocks
    .map((el) => el.textContent.replace(/\s+/g, " ").trim())
    .filter((text) => text.length > 0);
}

// Detects <pre>/<code> blocks so the assistant can treat them differently
// ("explain this code" vs "explain this paragraph").
function extractCodeBlocks(articleHtml) {
  const container = document.createElement("div");
  container.innerHTML = articleHtml;

  const blocks = [...container.querySelectorAll("pre, code")].filter((el) => {
    // skip inline `code` spans that sit inside a <pre> we've already counted
    if (el.tagName === "CODE" && el.closest("pre")) return false;
    return CODE_TAGS.has(el.tagName);
  });

  return blocks.map((el, i) => ({
    id: `code-${i}`,
    language: guessLanguage(el),
    code: el.textContent,
  }));
}

function guessLanguage(el) {
  const cls = el.className || el.querySelector?.("code")?.className || "";
  const match = /language-(\w+)/.exec(cls);
  return match ? match[1] : "text";
}

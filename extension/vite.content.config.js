import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Builds src/content/index.jsx into a single self-contained IIFE:
//   dist/content.js + dist/content.css
// A content script cannot use ES module imports directly from the
// manifest, so everything (React, Readability, our own modules) is bundled
// into one plain script.
export default defineConfig({
  plugins: [react()],
  // Content scripts run in the page's browser context, which has no
  // `process` global — without this define, React's internal
  // `process.env.NODE_ENV` checks throw a ReferenceError at runtime.
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    outDir: "dist",
    emptyOutDir: false,
    cssCodeSplit: false,
    lib: {
      entry: path.resolve(__dirname, "src/content/index.jsx"),
      name: "JarvisContent",
      formats: ["iife"],
      fileName: () => "content.js",
    },
    rollupOptions: {
      output: {
        assetFileNames: (info) => (info.name?.endsWith(".css") ? "content.css" : "[name][extname]"),
        extend: true,
      },
    },
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Builds the toolbar popup as a normal Vite app (ES module script tag is
// fine here — popup.html runs in a regular extension page context, not as
// a content script).
export default defineConfig({
  root: path.resolve(__dirname, "src/popup"),
  base: "./",
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: false,
    rollupOptions: {
      input: path.resolve(__dirname, "src/popup/popup.html"),
    },
  },
});

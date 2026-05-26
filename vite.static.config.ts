import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "node:path";

// Standalone static SPA build. Outputs to /docs (for GitHub Pages).
// Does NOT use TanStack Start — pure client-side routing with the existing route tree.
// Run with: bunx vite build --config vite.static.config.ts
export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  root: path.resolve(__dirname, "static-src"),
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "docs"),
    emptyOutDir: true,
  },
});

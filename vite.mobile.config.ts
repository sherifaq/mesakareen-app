/**
 * Capacitor (native) bundle config.
 *
 * The native apps must ship a fully static bundle, so the mobile build renders
 * the exact same TanStack Router route tree as a client-side SPA into
 * dist/mobile — which is what capacitor.config.ts points `webDir` at.
 *
 *   npm run build:mobile && npx cap sync
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

export default defineConfig({
  root: fileURLToPath(new URL("./mobile", import.meta.url)),
  publicDir: fileURLToPath(new URL("./public", import.meta.url)),
  base: "./",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    outDir: fileURLToPath(new URL("./dist/mobile", import.meta.url)),
    emptyOutDir: true,
    target: "es2020",
    sourcemap: false,
  },
});

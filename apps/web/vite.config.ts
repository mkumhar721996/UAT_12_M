/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.ARC_WEB_PORT) || 3010,
  },
  preview: {
    port: Number(process.env.ARC_WEB_PORT) || 3010,
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    exclude: ["node_modules", "dist", "e2e"],
  },
});

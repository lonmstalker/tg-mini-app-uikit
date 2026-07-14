import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const fromHere = (relativePath: string) =>
  fileURLToPath(new URL(relativePath, import.meta.url));

const sourceAliases = [
  {
    find: "tg-mini-app-uikit/style.css",
    replacement: fromHere("../../packages/uikit/src/tokens/tokens.css"),
  },
  {
    find: "@tg-mini-app/telegram",
    replacement: fromHere("../../packages/telegram/src/index.ts"),
  },
  {
    find: "tg-mini-app-uikit",
    replacement: fromHere("../../packages/uikit/src/index.ts"),
  },
];

export default defineConfig({
  base: "/",
  plugins: [react()],
  resolve: {
    alias: sourceAliases,
  },
  server: {
    host: "127.0.0.1",
    port: 5175,
  },
  preview: {
    host: "127.0.0.1",
    port: 4175,
  },
  build: {
    sourcemap: true,
    outDir: "dist",
  },
});

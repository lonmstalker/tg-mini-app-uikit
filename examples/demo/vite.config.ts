import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Point straight at the kit sources for instant HMR while developing.
      // A published app would simply depend on the built package instead.
      "tg-mini-app-uikit": fileURLToPath(new URL("../../packages/uikit/src/index.ts", import.meta.url)),
    },
  },
});

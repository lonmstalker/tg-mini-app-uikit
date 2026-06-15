import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    sourcemap: true,
    lib: {
      entry: "src/index.ts",
      name: "TgMiniAppUIKit",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "index.js" : "index.cjs"),
      cssFileName: "style",
    },
    rollupOptions: {
      // @tg-mini-app/telegram is a peer — never bundle it (a single physical
      // instance must back the Telegram context + back-button queue).
      external: ["react", "react-dom", "react/jsx-runtime", "@tg-mini-app/telegram", "@tg-mini-app/telegram/testing"],
    },
  },
});

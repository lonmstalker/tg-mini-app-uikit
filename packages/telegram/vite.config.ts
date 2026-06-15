import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Two entries: the platform bridge (`.`) and the dev-only mock (`./testing`).
// react is a peer (externalized); the package has zero runtime dependencies.
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
    lib: {
      entry: {
        index: "src/index.ts",
        testing: "src/testing.ts",
      },
      formats: ["es", "cjs"],
      fileName: (format, name) => `${name}.${format === "es" ? "js" : "cjs"}`,
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
    },
  },
});

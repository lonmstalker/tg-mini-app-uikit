import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
  stories: ["../{atoms,foundation,tokens,composites,templates}/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  staticDirs: [],
  viteFinal(baseConfig) {
    return mergeConfig(baseConfig, {
      plugins: [tailwindcss()],
      resolve: {
        alias: {
          // Resolve the platform peer + its mock to sources (most specific
          // first), so Storybook needs no built telegram dist/.
          "@tg-mini-app/telegram/testing": fileURLToPath(new URL("../../../telegram/src/testing.ts", import.meta.url)),
          "@tg-mini-app/telegram": fileURLToPath(new URL("../../../telegram/src/index.ts", import.meta.url)),
          "tg-mini-app-uikit": fileURLToPath(new URL("../../src/index.ts", import.meta.url)),
        },
      },
      server: {
        host: "127.0.0.1",
        hmr: { host: "127.0.0.1" },
        allowedHosts: ["localhost", "127.0.0.1", "::1"],
        watch: {
          ignored: ["**/storybook-static/**"],
        },
      },
    });
  },
};

export default config;

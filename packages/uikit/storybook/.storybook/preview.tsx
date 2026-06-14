import type { Preview } from "@storybook/react-vite";
import { useEffect, useMemo, type CSSProperties, type ReactNode } from "react";
import {
  enLocale,
  ruLocale,
  TKLocaleProvider,
  TKProvider,
  TKTelegramProvider,
  TKToastProvider,
  type TKTheme,
  type TKThemePreset,
} from "tg-mini-app-uikit";
import { createMockTelegram } from "../../test/support/telegram/mock";
import { PhoneFrame } from "../story-helpers";
import "../../src/tokens/tokens.css";
import "../storybook.css";

const accentOptions = {
  Telegram: "#3390ec",
  Violet: "#7c5cff",
  Green: "#1fab66",
  Orange: "#ff7a45",
  Red: "#e5484d",
};

const preview: Preview = {
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    controls: { expanded: true },
    a11y: {
      test: "todo",
    },
  },
  globalTypes: {
    theme: {
      defaultValue: "light",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
    accent: {
      defaultValue: "#3390ec",
      toolbar: {
        title: "Accent",
        icon: "paintbrush",
        items: Object.entries(accentOptions).map(([title, value]) => ({ value, title })),
        dynamicTitle: true,
      },
    },
    roundness: {
      defaultValue: "1",
      toolbar: {
        title: "Round",
        icon: "circle",
        items: [
          { value: "0.75", title: "Compact" },
          { value: "1", title: "Default" },
          { value: "1.25", title: "Soft" },
        ],
        dynamicTitle: true,
      },
    },
    fontSize: {
      defaultValue: "16",
      toolbar: {
        title: "Font",
        icon: "paragraph",
        items: [
          { value: "15", title: "15px" },
          { value: "16", title: "16px" },
          { value: "18", title: "18px" },
        ],
        dynamicTitle: true,
      },
    },
    locale: {
      defaultValue: "en",
      toolbar: {
        title: "Locale",
        icon: "globe",
        items: [
          { value: "en", title: "English" },
          { value: "ru", title: "Russian" },
        ],
        dynamicTitle: true,
      },
    },
    rtl: {
      defaultValue: "ltr",
      toolbar: {
        title: "Dir",
        icon: "transfer",
        items: [
          { value: "ltr", title: "LTR" },
          { value: "rtl", title: "RTL" },
        ],
        dynamicTitle: true,
      },
    },
    density: {
      defaultValue: "comfortable",
      toolbar: {
        title: "Density",
        icon: "component",
        items: [
          { value: "compact", title: "Compact" },
          { value: "comfortable", title: "Comfortable" },
        ],
        dynamicTitle: true,
      },
    },
    motion: {
      defaultValue: "springy",
      toolbar: {
        title: "Motion",
        icon: "play",
        items: [
          { value: "springy", title: "Springy" },
          { value: "smooth", title: "Smooth" },
        ],
        dynamicTitle: true,
      },
    },
    preset: {
      defaultValue: "ios",
      toolbar: {
        title: "Preset",
        icon: "mobile",
        items: [
          { value: "ios", title: "iOS" },
          { value: "material", title: "Material" },
        ],
        dynamicTitle: true,
      },
    },
    device: {
      defaultValue: "phone",
      toolbar: {
        title: "Device",
        icon: "tablet",
        items: [
          { value: "phone", title: "Phone frame" },
          { value: "off", title: "No frame" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const globals = context.globals as {
        theme?: TKTheme;
        accent?: string;
        roundness?: string;
        fontSize?: string;
        locale?: "en" | "ru";
        rtl?: "ltr" | "rtl";
        density?: "compact" | "comfortable";
        motion?: "springy" | "smooth";
        preset?: TKThemePreset;
        device?: "phone" | "off";
      };
      const theme = globals.theme ?? "light";
      const dir = globals.rtl === "rtl" ? "rtl" : "ltr";
      const locale = globals.locale === "ru" ? ruLocale : enLocale;
      const telegram = useMemo(() => createMockTelegram({ colorScheme: theme }), [theme]);
      // Stories opt out of the phone frame with `parameters: { phone: false }`,
      // and render edge-to-edge (app-shell screens) with `parameters: { fullBleed: true }`.
      const params = context.parameters as { phone?: boolean; fullBleed?: boolean };
      const inPhone = (globals.device ?? "phone") === "phone" && params.phone !== false;
      const fullBleed = params.fullBleed === true;

      useEffect(() => {
        document.documentElement.dir = dir;
        document.documentElement.lang = globals.locale ?? "en";
      }, [dir, globals.locale]);

      const root = fullBleed ? (
        <div className="tk-story-fullbleed" style={{ minHeight: inPhone ? 0 : "100vh", flex: inPhone ? 1 : undefined } as CSSProperties}>
          <Story />
        </div>
      ) : (
        <StoryRoot density={globals.density ?? "comfortable"} inPhone={inPhone}>
          <Story />
        </StoryRoot>
      );

      return (
        <TKTelegramProvider webApp={telegram.webApp}>
          <TKProvider
            theme={theme}
            accent={globals.accent ?? "#3390ec"}
            roundness={Number(globals.roundness ?? 1)}
            fontSize={Number(globals.fontSize ?? 16)}
            motion={globals.motion ?? "springy"}
            preset={globals.preset ?? "ios"}
          >
            <TKLocaleProvider locale={locale}>
              <TKToastProvider>{inPhone ? <PhoneFrame>{root}</PhoneFrame> : root}</TKToastProvider>
            </TKLocaleProvider>
          </TKProvider>
        </TKTelegramProvider>
      );
    },
  ],
};

function StoryRoot({ density, inPhone, children }: { density: "compact" | "comfortable"; inPhone?: boolean; children: ReactNode }) {
  return (
    <div
      className="tk-story-root"
      data-density={density}
      style={
        {
          "--tk-story-gap": density === "compact" ? "10px" : "16px",
          "--tk-story-pad": inPhone ? "18px" : density === "compact" ? "16px" : "28px",
          minHeight: inPhone ? 0 : "100vh",
          flex: inPhone ? 1 : undefined,
          overflowY: inPhone ? "auto" : undefined,
          WebkitOverflowScrolling: inPhone ? "touch" : undefined,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}

export default preview;

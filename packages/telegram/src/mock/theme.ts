import type { TelegramSafeAreaInset, TelegramThemeParams } from "../types";
import type { MockSensorKey, MockSensorValues, MockTelegramState } from "./types";

export const ZERO: TelegramSafeAreaInset = { top: 0, bottom: 0, left: 0, right: 0 };
export const CUTOUTS: TelegramSafeAreaInset = { top: 59, bottom: 34, left: 0, right: 0 };
export const CHROME: TelegramSafeAreaInset = { top: 46, bottom: 0, left: 0, right: 0 };

export const THEMES: Record<"light" | "dark", TelegramThemeParams> = {
  light: {
    bg_color: "#ffffff",
    secondary_bg_color: "#eef1f6",
    section_bg_color: "#ffffff",
    section_separator_color: "#e3e7ee",
    header_bg_color: "#ffffff",
    bottom_bar_bg_color: "#f2f4f8",
    text_color: "#131c26",
    subtitle_text_color: "#57636f",
    section_header_text_color: "#707579",
    hint_color: "#646e79",
    link_color: "#3390ec",
    accent_text_color: "#3390ec",
    button_color: "#3390ec",
    button_text_color: "#ffffff",
    destructive_text_color: "#e5484d",
  },
  dark: {
    bg_color: "#17212b",
    secondary_bg_color: "#0e1621",
    section_bg_color: "#17212b",
    section_separator_color: "#202c39",
    header_bg_color: "#17212b",
    bottom_bar_bg_color: "#202c39",
    text_color: "#f3f6f9",
    subtitle_text_color: "#aebbc9",
    section_header_text_color: "#788797",
    hint_color: "#95a3b2",
    link_color: "#3390ec",
    accent_text_color: "#3390ec",
    button_color: "#3390ec",
    button_text_color: "#ffffff",
    destructive_text_color: "#ff6166",
  },
};

export const CLOUD_PREFIX = "tg-demo-cloud:";
export const DEVICE_PREFIX = "tg-demo-device:";
export const SECURE_PREFIX = "tg-demo-secure:";

/** Deterministic sensor readings - static so e2e assertions never race a ticker. */
export const SENSOR_READINGS: Record<MockSensorKey, MockSensorValues> = {
  accelerometer: { x: 0.12, y: 9.77, z: 0.34 },
  deviceOrientation: { alpha: 0.66, beta: 0.18, gamma: -0.05 },
  gyroscope: { x: 0.01, y: 0.02, z: 0 },
};

/** Resolves the stored `set*Color` values (keyword, #hex or client default) against the theme. */
export function resolveMockColors(
  state: Pick<MockTelegramState, "themeParams" | "headerColor" | "backgroundColor" | "bottomBarColor">,
): { header: string; background: string; bottomBar: string } {
  const tp = state.themeParams;
  const resolve = (raw: string | null, fallback?: string): string => {
    if (raw === null) return fallback ?? "#ffffff";
    if (raw === "bg_color") return tp.bg_color ?? fallback ?? "#ffffff";
    if (raw === "secondary_bg_color") return tp.secondary_bg_color ?? fallback ?? "#ffffff";
    if (raw === "bottom_bar_bg_color") return tp.bottom_bar_bg_color ?? fallback ?? "#ffffff";
    return raw;
  };
  return {
    header: resolve(state.headerColor, tp.header_bg_color),
    background: resolve(state.backgroundColor, tp.bg_color),
    bottomBar: resolve(state.bottomBarColor, tp.bottom_bar_bg_color),
  };
}

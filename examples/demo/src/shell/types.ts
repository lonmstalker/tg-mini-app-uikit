import type { TKMotion } from "tg-mini-app-uikit";

export interface Tweaks {
  dark: boolean;
  accent: string;
  roundness: number;
  motionSpeed: number;
  motion: TKMotion;
  fontSize: number;
}

export const DEFAULT_TWEAKS: Tweaks = {
  dark: false,
  accent: "#3390ec",
  roundness: 1,
  motionSpeed: 1,
  motion: "springy",
  fontSize: 16,
};

export const ACCENTS = ["#3390ec", "#7c5cff", "#1fab66", "#ff7a45", "#e5484d"];

/** Bits of the demo shell that example apps may talk to (e.g. theme switch). */
export interface ShellApi {
  dark: boolean;
  setDark: (dark: boolean) => void;
}

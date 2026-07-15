export const SHOWCASE_TWEAKS_STORAGE_KEY = "showcase-tweaks";

export const SHOWCASE_TWEAK_RANGES = {
  radius: { min: 0.4, max: 1.6 },
  motion: { min: 0.5, max: 2 },
  font: { min: 14, max: 18 },
} as const;

const DEFAULT_VALUES = {
  roundness: 1,
  motionSpeed: 1,
  fontSize: 16,
} as const;

export interface ShowcaseTweaks {
  accent: string | null;
  roundness: number;
  motionSpeed: number;
  fontSize: number;
}

export function createDefaultShowcaseTweaks(accent: string | null = null): ShowcaseTweaks {
  return { accent, ...DEFAULT_VALUES };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[\da-f]{6}$/i.test(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function getInitialShowcaseTweaks(): ShowcaseTweaks {
  if (typeof window === "undefined") return createDefaultShowcaseTweaks();

  try {
    const stored = window.localStorage.getItem(SHOWCASE_TWEAKS_STORAGE_KEY);
    if (stored === null) return createDefaultShowcaseTweaks();
    const value: unknown = JSON.parse(stored);

    if (
      !isRecord(value) ||
      !isHexColor(value.accent) ||
      !isFiniteNumber(value.roundness) ||
      !isFiniteNumber(value.motionSpeed) ||
      !isFiniteNumber(value.fontSize)
    ) {
      clearShowcaseTweaksStorage();
      return createDefaultShowcaseTweaks();
    }

    return {
      accent: value.accent.toLowerCase(),
      roundness: clamp(value.roundness, SHOWCASE_TWEAK_RANGES.radius.min, SHOWCASE_TWEAK_RANGES.radius.max),
      motionSpeed: clamp(value.motionSpeed, SHOWCASE_TWEAK_RANGES.motion.min, SHOWCASE_TWEAK_RANGES.motion.max),
      fontSize: clamp(value.fontSize, SHOWCASE_TWEAK_RANGES.font.min, SHOWCASE_TWEAK_RANGES.font.max),
    };
  } catch {
    clearShowcaseTweaksStorage();
    return createDefaultShowcaseTweaks();
  }
}

export function persistShowcaseTweaks(tweaks: ShowcaseTweaks, defaultAccent: string): void {
  const accent = tweaks.accent ?? defaultAccent;
  const isDefault =
    accent.toLowerCase() === defaultAccent.toLowerCase() &&
    tweaks.roundness === DEFAULT_VALUES.roundness &&
    tweaks.motionSpeed === DEFAULT_VALUES.motionSpeed &&
    tweaks.fontSize === DEFAULT_VALUES.fontSize;

  try {
    if (isDefault) {
      window.localStorage.removeItem(SHOWCASE_TWEAKS_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(
      SHOWCASE_TWEAKS_STORAGE_KEY,
      JSON.stringify({ ...tweaks, accent }),
    );
  } catch {
    // Storage can be unavailable in private or locked-down WebViews.
  }
}

export function clearShowcaseTweaksStorage(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SHOWCASE_TWEAKS_STORAGE_KEY);
  } catch {
    // Reset remains functional even when storage access is denied.
  }
}

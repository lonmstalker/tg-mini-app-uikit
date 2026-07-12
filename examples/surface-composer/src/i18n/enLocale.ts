/*
 * Demo dictionary — English. Only structural/chrome strings live here; the
 * buyer promise + CTA are in scenes/first-launch/firstLaunch.copy.ts and the
 * per-context content in scenes/range-remix/businessContexts.ts so each scene's
 * copy stays self-contained.
 *
 * NOTHING in the pre-touch first viewport may carry token/runtime/recorder/test
 * vocabulary (Principle III, SC-002) — the inspector/proof/runtime strings below
 * surface only after a meaningful touch.
 */
export const en = {
  "stage.aria": "Surface Composer stage",
  "surface.aria": "Live Mini App surface",

  "switcher.aria": "Business type",
  "switcher.shop": "Shop",
  "switcher.booking": "Booking",
  "switcher.wallet": "Wallet",
  "switcher.support": "Support",

  // Revealed only after first meaningful touch (proof layer).
  "inspector.title": "Why it feels premium",
  "inspector.subtitle": "UIKit proof appears after the buyer cares",
  "inspector.close": "Close",
  "proof.strip.aria": "What this surface is made of",
  "runtime.native": "Native",
  "runtime.mock": "Simulated",
  "runtime.fallback": "Browser",
} as const;

export type DictKey = keyof typeof en;
export type Dict = Record<DictKey, string>;

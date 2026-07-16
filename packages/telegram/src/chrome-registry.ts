/*
 * Native-chrome suppression state (count + listeners) parked on a `globalThis`
 * Symbol so a duplicated `@tg-mini-app/telegram` copy — version mismatch, pnpm
 * hoist miss, or the deprecated uikit re-export mixed with a direct dep —
 * shares ONE source of truth (same rationale as back-registry, FND-004).
 *
 * Modal overlays bump the count while open; the Main/Secondary button adapters
 * treat a positive count as "hidden". The native buttons live in the client
 * chrome OUTSIDE the webview, so an in-DOM scrim/focus-trap can never reach
 * them — without this a bottom "Pay" stays tappable under a confirmation
 * sheet, acting on context the user cannot see.
 */

export interface TKChromeState {
  /** How many active overlays want the native Main/Secondary buttons hidden. */
  suppress: number;
  listeners: Set<() => void>;
}

const KEY = Symbol.for("tg-mini-app/telegram/chrome-registry");

export function tkChromeState(): TKChromeState {
  const g = globalThis as Record<symbol, unknown>;
  return (g[KEY] ??= { suppress: 0, listeners: new Set() }) as TKChromeState;
}

/** Test-only: clear the shared suppression state so a suite starts clean. */
export function __tkResetChromeState(): void {
  const s = tkChromeState();
  s.suppress = 0;
  s.listeners.clear();
}

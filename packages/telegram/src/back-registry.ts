/*
 * Back-button intercept state (queue + want-count + listeners) parked on a
 * `globalThis` Symbol so a duplicated `@tg-mini-app/telegram` copy — version
 * mismatch, pnpm hoist miss, or the deprecated uikit re-export mixed with a
 * direct dep — shares ONE source of truth. Otherwise `useBackIntercept` bumps
 * one module's counter while the provider reads another's and the native Back
 * button never shows, so a Back press closes the whole Mini App (FND-004).
 */

type BackHandler = () => void;

export interface TKBackState {
  queue: BackHandler[];
  /** How many active interceptors want the native Back button visible. */
  want: number;
  listeners: Set<() => void>;
}

const KEY = Symbol.for("tg-mini-app/telegram/back-registry");

export function tkBackState(): TKBackState {
  const g = globalThis as Record<symbol, unknown>;
  return (g[KEY] ??= { queue: [], want: 0, listeners: new Set() }) as TKBackState;
}

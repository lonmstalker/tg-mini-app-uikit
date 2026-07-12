/*
 * Cross-bundle shared state for the overlay/scroll-lock/swipe-guard
 * coordinators. Parking the counters on a `globalThis` symbol (instead of
 * module-level `let`s) means duplicate package copies — common when a Mini App
 * and one of its sub-dependencies both pull in the kit — share ONE source of
 * truth, so the scroll lock / swipe guard / z-stack never desync (INT-005).
 */

const KEY = Symbol.for("tg-mini-app-uikit/internal-registry");

type Store = Record<string, unknown>;

function store(): Store {
  const g = globalThis as Record<symbol, unknown>;
  return (g[KEY] ??= {}) as Store;
}

/** Returns the shared mutable slot for `namespace`, creating it once. */
export function tkSharedState<T extends object>(namespace: string, init: () => T): T {
  const s = store();
  return (s[namespace] ??= init()) as T;
}

/** Test-only: drop all shared coordinator state so a suite starts clean. */
export function __tkResetSharedState(): void {
  delete (globalThis as Record<symbol, unknown>)[KEY];
}

/* Shared demo plumbing: deep links and offline-clean network simulation. */

/** Deep-link screen inside an app: `?app=shop&screen=cart` (M8.10). */
export function bootScreen(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return new URLSearchParams(window.location.search).get("screen") ?? undefined;
}

/** Deep-link gallery section: `?app=gallery&section=inputs` (M8.2). */
export function bootSection(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return new URLSearchParams(window.location.search).get("section") ?? undefined;
}

/** Stable "today" for demos and visual tests: `?today=2026-06-13` (M8.6). */
export function bootToday(): Date {
  if (typeof window !== "undefined") {
    const raw = new URLSearchParams(window.location.search).get("today");
    if (raw) {
      const parsed = new Date(`${raw}T12:00:00`);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
  }
  return new Date();
}

/**
 * Network simulation (M8.5): latency without any real requests, so the demo
 * stays offline-clean. `?fast=1` collapses delays (e2e uses it).
 */
export function demoDelay(ms: number): Promise<void> {
  const fast = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("fast") === "1";
  return new Promise((resolve) => setTimeout(resolve, fast ? Math.min(ms, 30) : ms));
}

/** Rejects with probability `p` after the delay — for error/retry flows. */
export async function demoFail(p: number, ms = 600): Promise<void> {
  await demoDelay(ms);
  if (Math.random() < p) throw new Error("demo network error");
}

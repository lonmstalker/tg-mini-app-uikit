/*
 * Numeric mirror of motion/easing.css for the rAF scheduler and FLIP timeline —
 * code paths that need durations as numbers, not CSS strings. Keep the two files
 * in sync; the CSS is the source of truth for what the browser animates, this is
 * the source of truth for what the timeline waits on.
 */
export const SC_EASE = {
  outExpo: "cubic-bezier(0.16, 1, 0.3, 1)",
  outQuint: "cubic-bezier(0.22, 1, 0.36, 1)",
  functional: "var(--tk-ease, cubic-bezier(0.4, 0, 0.2, 1))",
} as const;

/** Full-motion durations (ms). Reduced motion collapses these to ~0 (see below). */
export const SC_DURATION = {
  seed: 180,
  rails: 220,
  assemble: 420,
  sweep: 160,
  settle: 320,
  remix: 460,
} as const;

export const SC_STAGGER = 45;

/** Under reduced motion the timeline advances with ~0ms holds (identical events). */
export function holdFor(ms: number, reducedMotion: boolean): number {
  return reducedMotion ? 0 : ms;
}

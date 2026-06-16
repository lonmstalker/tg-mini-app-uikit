/*
 * Deterministic recorder fixtures (data-model determinism). These are the
 * source of truth for the canonical event sequences: the scene timelines emit
 * exactly these `reaction` strings in order, and the specs assert against them.
 * The reduced-motion path emits the IDENTICAL sequence (FR-010) — only the
 * visible animation collapses, never the events.
 */

/** US1 birth: one event per choreography step (seed → … → idle). */
export const BIRTH_SEQUENCE = [
  "birth-seed",
  "birth-rails",
  "birth-assembling",
  "birth-light-sweep",
  "birth-idle",
] as const;

/** US2 remix: one event per step for a single context advance. */
export const REMIX_STEP_SEQUENCE = [
  "remix-start",
  "remix-separating",
  "remix-rotating",
  "remix-recomposing",
  "remix-locked",
  "remix-continuity",
] as const;

/** The fixed remix order (data-model). Community arrives last, via remix only. */
export const REMIX_ORDER = ["shop", "booking", "wallet", "support", "community"] as const;

/** Under `?mock=1` the honest runtime label must be exactly this (Principle V). */
export const RUNTIME_FIXTURE = { mock: "mock", fallback: "browser-fallback" } as const;

import { useRef } from "react";

/**
 * `useRef` with a lazy initializer: `useRef(new Map())` rebuilds (and discards)
 * the value on every render — this builds it once, via the null-guarded lazy
 * pattern React's purity rules explicitly allow.
 */
export function useLazyRef<T>(init: () => T): { current: T } {
  const ref = useRef<T | null>(null);
  if (ref.current === null) ref.current = init();
  return ref as { current: T };
}

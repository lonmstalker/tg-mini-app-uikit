import { useInsertionEffect, useRef } from "react";

/*
 * Latest-value mirror for props/values read from stable handlers. The write
 * lands in useInsertionEffect — before every layout effect of the same
 * commit — instead of during render, so a discarded or replayed concurrent
 * render can never leak an uncommitted value into a live handler.
 */
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  useInsertionEffect(() => {
    ref.current = value;
  });
  return ref;
}

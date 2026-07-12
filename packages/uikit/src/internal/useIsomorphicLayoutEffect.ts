import { useEffect, useLayoutEffect } from "react";

/**
 * `useLayoutEffect` on the client, `useEffect` on the server — avoids React's
 * "useLayoutEffect does nothing on the server" warning while still running
 * synchronously before paint in the browser (used so layered overlays claim
 * their z-slot before the first frame — INT-006).
 */
export const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

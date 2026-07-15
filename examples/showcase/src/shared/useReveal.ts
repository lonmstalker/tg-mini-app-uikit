import { useLayoutEffect, useRef } from "react";

const REVEAL_PENDING_CLASS = "reveal-pending";
const REVEALED_CLASS = "is-revealed";

export function useReveal<T extends HTMLElement>(enabled = true) {
  const ref = useRef<T>(null);

  useLayoutEffect(() => {
    if (!enabled) return;

    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    let observer: IntersectionObserver | undefined;

    try {
      observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;

          node.classList.add(REVEALED_CLASS);
          observer?.unobserve(node);
        },
        { threshold: 0.2 },
      );
      observer.observe(node);
      node.classList.add(REVEAL_PENDING_CLASS);
    } catch {
      observer?.disconnect();
      node.classList.remove(REVEAL_PENDING_CLASS, REVEALED_CLASS);
    }

    return () => {
      observer?.disconnect();
      if (!node.classList.contains(REVEALED_CLASS)) {
        node.classList.remove(REVEAL_PENDING_CLASS);
      }
    };
  }, [enabled]);

  return ref;
}

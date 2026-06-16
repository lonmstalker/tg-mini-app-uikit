/*
 * Demo-only gravity container (D2). When the surface flips `data-gravity`,
 * its children align toward the CTA using transform/opacity only — no confetti,
 * no layout animation (FR-020). Reduced motion resolves to the same aligned
 * end-state (CSS handles both via the collapsed durations).
 */
import type { ReactNode } from "react";

export function GravityLayer({ children }: { children: ReactNode }) {
  return <div className="sc-gravity">{children}</div>;
}

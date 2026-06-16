/*
 * Demo-only proof pill (D2) — names one reusable element the surface is built
 * from. Part of the second (proof) layer: it exists only after the first
 * meaningful touch reveals proof (Principle III, dom-contract §3).
 */
import type { ReactNode } from "react";

export function ProofPill({ children }: { children: ReactNode }) {
  return (
    <span className="sc-proof-pill" data-proof-pill>
      {children}
    </span>
  );
}

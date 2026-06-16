/*
 * The proof strip — ABSENT before the first meaningful touch, mounted only after
 * `proofRevealed` (Principle III, dom-contract §3). The scene conditionally
 * renders it; this component assumes proof has been revealed.
 */
import { ProofPill } from "../components/ProofPill";
import { useT } from "../i18n";

export interface BuyerProofStripProps {
  items: string[];
}

export function BuyerProofStrip({ items }: BuyerProofStripProps) {
  const t = useT();
  return (
    <div className="sc-proof-strip" data-testid="proof-strip" role="group" aria-label={t("proof.strip.aria")}>
      {items.map((item) => (
        <ProofPill key={item}>{item}</ProofPill>
      ))}
    </div>
  );
}

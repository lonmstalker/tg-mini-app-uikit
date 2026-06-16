/*
 * The proof layer (US1 sc.3): a TKSheet composed from TKListGroup + TKCell that
 * opens at `inspector-open` and names the reusable kit elements the surface is
 * built from (≥1 named UIKit proof element). Kit/component vocabulary is allowed
 * HERE because it is post-touch proof, not the buyer-first viewport (Principle
 * III). TKSheet closes on Escape / Back / scrim before any navigation (FR-011).
 */
import { useBackButton } from "@tg-mini-app/telegram";
import { TKCell, TKListGroup, TKSheet, type TKIconName } from "tg-mini-app-uikit";
import { useComposer, useComposerDispatch } from "../app/composerStore";
import { useT } from "../i18n";

const PROOF_ELEMENTS: ReadonlyArray<{ id: string; name: string; icon: TKIconName; note: string }> = [
  { id: "header", name: "TKHeader", icon: "grid", note: "Title + safe-area bar" },
  { id: "media", name: "TKImage", icon: "image", note: "Blur-up media with fallback" },
  { id: "promo", name: "TKBannerCard", icon: "bolt", note: "Featured offer" },
  { id: "metric", name: "TKStatTile", icon: "fire", note: "Live metric + sparkline" },
  { id: "list", name: "TKListGroup + TKCell", icon: "document", note: "Grouped rows" },
  { id: "trust", name: "TKAvatarStack + TKRating", icon: "verified", note: "Social proof" },
  { id: "action", name: "TKMainButton", icon: "check", note: "Telegram-native action" },
];

export function PremiumInspectorSheet() {
  const { motionState, proofRevealed } = useComposer();
  const dispatch = useComposerDispatch();
  const t = useT();

  const open = proofRevealed && motionState === "inspector-open";

  const close = () => {
    dispatch({
      type: "motion",
      motionState: "idle",
      record: { source: "pointer", target: "surface.inspector", reaction: "inspector-close" },
    });
  };

  // Native Telegram BackButton closes the inspector before any navigation
  // (FR-011). In the browser/mock preview, TKSheet's Escape/scrim covers it.
  useBackButton(open ? close : undefined, open);

  return (
    <TKSheet open={open} onClose={close} title={t("inspector.title")} testId="inspector">
      <p className="sc-inspector__sub">{t("inspector.subtitle")}</p>
      <TKListGroup>
        {PROOF_ELEMENTS.map((el) => (
          <TKCell key={el.id} icon={el.icon} title={el.name} subtitle={el.note} />
        ))}
      </TKListGroup>
    </TKSheet>
  );
}

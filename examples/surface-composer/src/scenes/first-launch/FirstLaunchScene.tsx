/*
 * US1 — first launch. Composes the buyer-first surface and wires the full
 * choreography: birth on mount, contact-highlight → inspector, CTA gravity,
 * empty-space recognition, the four-context switcher, and the single primary
 * action. The buyer-first gate holds until the first meaningful touch
 * (proofRevealed === false → no proof strip, no tech vocabulary).
 *
 * Reduced motion is handled by the shared timeline/CSS (identical events, static
 * frames) — nothing scene-specific needed here.
 */
import { useEffect, useRef } from "react";
import type { BusinessContext } from "../../app/composerReducer";
import { IS_FROZEN } from "../../app/devFreeze";
import { useComposer, useComposerDispatch } from "../../app/composerStore";
import { useAdvanceScene } from "../../app/SceneOrchestrator";
import { useLang } from "../../i18n";
import { triggerGravity } from "../../motion/gravity";
import { useContactHighlight } from "../../motion/useContactHighlight";
import { Seed } from "../../components/Seed";
import { Rails } from "../../components/Rails";
import { TactileRing } from "../../components/TactileRing";
import { GravityLayer } from "../../components/GravityLayer";
import { PremiumInspectorSheet } from "../../proof/PremiumInspectorSheet";
import { BuyerProofStrip } from "../../surface/BuyerProofStrip";
import { PrimaryActionBar } from "../../surface/PrimaryActionBar";
import { SurfaceContextSwitcher } from "../../surface/SurfaceContextSwitcher";
import { SurfaceSlots } from "../../surface/SurfaceSlots";
import { useSurfaceElement } from "../../surface/surfaceContext";
import { runBirth } from "./birthTimeline";
import { firstLaunchContent, firstLaunchCta } from "./firstLaunch.copy";

const PROOF_PILLS = ["TKHeader", "TKBannerCard", "TKStatTile", "TKMainButton"];

export function FirstLaunchScene() {
  const { lang } = useLang();
  const { businessContext, proofRevealed, reducedMotion } = useComposer();
  const dispatch = useComposerDispatch();
  const surface = useSurfaceElement();
  const onContact = useContactHighlight();
  const advance = useAdvanceScene();

  const content = firstLaunchContent(lang);

  // Birth on mount. reducedMotion is read via ref so the effect runs once and a
  // mid-flight preference change never restarts the birth (StrictMode-safe).
  const reducedRef = useRef(reducedMotion);
  reducedRef.current = reducedMotion;
  useEffect(() => {
    if (IS_FROZEN) return; // snapshot mode: hold the frozen frame, no auto-advance
    const controls = runBirth(dispatch, reducedRef.current);
    return controls.cancel;
  }, [dispatch]);

  const onSelect = (context: BusinessContext) => {
    dispatch({
      type: "remix",
      businessContext: context,
      motionState: "idle",
      record: { source: "pointer", target: `switcher.${context}`, reaction: "context-select" },
    });
  };

  const onCommit = () => {
    triggerGravity(surface, dispatch);
    advance();
  };

  return (
    <div className="sc-scene" onPointerDown={onContact}>
      <Seed />
      <Rails />
      <TactileRing />
      <GravityLayer>
        <SurfaceSlots
          content={content}
          switcher={<SurfaceContextSwitcher value={businessContext} onSelect={onSelect} />}
          primaryAction={<PrimaryActionBar label={firstLaunchCta[lang]} onCommit={onCommit} />}
          belowContent={proofRevealed ? <BuyerProofStrip items={PROOF_PILLS} /> : null}
        />
      </GravityLayer>
      <PremiumInspectorSheet />
    </div>
  );
}

/*
 * US2 — one surface speaks many businesses. Composes the remix over the SHARED
 * surface (same slot identity as US1) and wires all three triggers (T040) to a
 * single `remixTo`, so a context chip, the primary action, and a horizontal drag
 * emit the identical recorder sequence (REMIX_STEP_SEQUENCE). The primary action
 * updates in place (the action slot never moves) → no layout shift.
 *
 * Continuity (T041) holds by construction: remix only changes businessContext +
 * content; the frame, theme, safe-area, origin and action-slot position are
 * never touched here.
 */
import { useCallback, useEffect, useRef } from "react";
import { nextContext, type BusinessContext } from "../../app/composerReducer";
import { useComposer, useComposerDispatch } from "../../app/composerStore";
import { useLang } from "../../i18n";
import { useRemixDrag } from "../../motion/useRemixDrag";
import type { RecorderSource } from "../../recorder/recorderTypes";
import { Rails } from "../../components/Rails";
import { Seed } from "../../components/Seed";
import { PrimaryActionBar } from "../../surface/PrimaryActionBar";
import { SurfaceContextSwitcher } from "../../surface/SurfaceContextSwitcher";
import { SurfaceSlots } from "../../surface/SurfaceSlots";
import { useSurfaceElement } from "../../surface/surfaceContext";
import { businessContent, businessCta } from "./businessContexts";
import { runRemix, type RemixControls } from "./remixTimeline";

export function RangeRemixScene() {
  const { lang } = useLang();
  const { businessContext, motionState, reducedMotion } = useComposer();
  const dispatch = useComposerDispatch();
  const surface = useSurfaceElement();

  const content = businessContent(businessContext, lang);
  const settled = motionState === "idle" || motionState === "locked" || motionState === "continuity";

  const reducedRef = useRef(reducedMotion);
  reducedRef.current = reducedMotion;
  const remixRef = useRef<RemixControls | null>(null);

  const remixTo = useCallback(
    (to: BusinessContext, source: RecorderSource) => {
      if (to === businessContext) return; // re-selecting the current context is a no-op
      remixRef.current?.cancel();
      remixRef.current = runRemix(dispatch, { to, reducedMotion: reducedRef.current, source, surface });
    },
    [dispatch, businessContext, surface],
  );

  useEffect(() => () => remixRef.current?.cancel(), []);

  const drag = useRemixDrag({ current: businessContext, settled, remixTo });

  return (
    <div className="sc-scene" onPointerDown={drag.onPointerDown} onPointerUp={drag.onPointerUp}>
      <Seed />
      <Rails />
      <SurfaceSlots
        content={content}
        switcher={<SurfaceContextSwitcher value={businessContext} onSelect={(c) => remixTo(c, "pointer")} />}
        primaryAction={<PrimaryActionBar label={businessCta(businessContext, lang)} onCommit={() => remixTo(nextContext(businessContext), "pointer")} />}
      />
    </div>
  );
}

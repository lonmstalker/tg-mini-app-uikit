/*
 * Full-viewport dark stage + centered Telegram surface + active scene. The
 * surface root <main> is where the whole DOM contract lives (dom-contract §1):
 * data-scene / data-motion-state / data-runtime-mode / data-business-context /
 * data-reduced-motion, plus the contact/origin/intensity CSS vars (FR-019).
 *
 * The scene map is populated as stories land — firstLaunch (US1), rangeRemix
 * (US2); the four deferred scenes are absent (D10), so the orchestrator falls
 * back to firstLaunch.
 */
import { useState, type CSSProperties, type ReactNode } from "react";
import { RecorderPanelDev } from "../recorder/RecorderPanel.dev";
import { TelegramSurfaceFrame } from "../surface/TelegramSurfaceFrame";
import { SurfaceElementContext } from "../surface/surfaceContext";
import { SceneOrchestrator } from "./SceneOrchestrator";
import { useComposer } from "./composerStore";
import type { SceneId } from "./composerReducer";
import { FirstLaunchScene } from "../scenes/first-launch/FirstLaunchScene";
import { RangeRemixScene } from "../scenes/range-remix/RangeRemixScene";
import "../motion/easing.css";
import "../motion/birth.css";
import "../motion/remix.css";
import "../components/demo.css";
import "./surface.css";

const SCENES: Partial<Record<SceneId, ReactNode>> = {
  firstLaunch: <FirstLaunchScene />,
  rangeRemix: <RangeRemixScene />,
};

export function SurfaceComposerApp() {
  const state = useComposer();
  const [surfaceEl, setSurfaceEl] = useState<HTMLElement | null>(null);

  return (
    <div className="sc-stage" data-testid="sc-stage">
      <TelegramSurfaceFrame>
        <main
          ref={setSurfaceEl}
          className="sc-surface"
          // Portal root: the kit's portaled overlays (REU-009) must keep
          // anchoring to the product surface below the simulated Telegram
          // chrome — where the in-place TKSheet used to land — not escape to
          // the frame-wide `.tk` root and dim the header.
          data-tk-portal-root
          data-testid="surface"
          data-scene={state.scene}
          data-motion-state={state.motionState}
          data-runtime-mode={state.runtimeMode}
          data-business-context={state.businessContext}
          data-reduced-motion={state.reducedMotion}
          style={
            {
              "--sc-origin-x": "50%",
              "--sc-origin-y": "46%",
              "--sc-contact-x": "50%",
              "--sc-contact-y": "50%",
            } as CSSProperties
          }
        >
          <SurfaceElementContext.Provider value={surfaceEl}>
            <SceneOrchestrator scenes={SCENES} />
          </SurfaceElementContext.Provider>
        </main>
      </TelegramSurfaceFrame>
      <RecorderPanelDev />
    </div>
  );
}

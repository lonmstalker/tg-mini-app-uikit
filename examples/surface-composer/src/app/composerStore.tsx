/*
 * React glue around the pure composerReducer: provides state + dispatch, and
 * keeps the environment-derived fields (reduced-motion, runtime mode) inside the
 * single tree so the DOM contract has one source of truth. Publishes the
 * recorder log to the deterministic e2e accessor on every change.
 */
import { createContext, use, useEffect, useReducer, type Dispatch, type ReactNode } from "react";
import { useReducedMotion } from "../motion/reducedMotion";
import { installRecorderAccessor, publishRecorder } from "../recorder/recorder";
import { useRuntimeMode } from "../runtime/useRuntimeMode";
import { composerReducer, initialComposerState, type ComposerAction, type ComposerState } from "./composerReducer";
import { FROZEN_CONTEXT, FROZEN_MOTION, FROZEN_PROOF, FROZEN_SCENE } from "./devFreeze";

// When a remix frame is frozen without an explicit motion state, start settled
// (idle) — otherwise the initial "seed" state would hide the slots (birth.css).
const frozenMotion = FROZEN_MOTION ?? (FROZEN_SCENE === "rangeRemix" ? "idle" : null);

const seededState: ComposerState = {
  ...initialComposerState,
  ...(frozenMotion ? { motionState: frozenMotion, proofRevealed: FROZEN_PROOF } : {}),
  ...(FROZEN_SCENE ? { scene: FROZEN_SCENE } : {}),
  ...(FROZEN_CONTEXT ? { businessContext: FROZEN_CONTEXT } : {}),
};

const StateCtx = createContext<ComposerState | null>(null);
const DispatchCtx = createContext<Dispatch<ComposerAction> | null>(null);

installRecorderAccessor();

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(composerReducer, seededState);
  const reducedMotion = useReducedMotion();
  const runtimeMode = useRuntimeMode();

  useEffect(() => {
    dispatch({ type: "reducedMotion", reducedMotion });
  }, [reducedMotion]);
  useEffect(() => {
    dispatch({ type: "runtimeMode", runtimeMode });
  }, [runtimeMode]);
  useEffect(() => {
    publishRecorder(state.recorder);
  }, [state.recorder]);

  return (
    <StateCtx.Provider value={state}>
      <DispatchCtx.Provider value={dispatch}>{children}</DispatchCtx.Provider>
    </StateCtx.Provider>
  );
}

export function useComposer(): ComposerState {
  const s = use(StateCtx);
  if (!s) throw new Error("useComposer must be used within StoreProvider");
  return s;
}

export function useComposerDispatch(): Dispatch<ComposerAction> {
  const d = use(DispatchCtx);
  if (!d) throw new Error("useComposerDispatch must be used within StoreProvider");
  return d;
}

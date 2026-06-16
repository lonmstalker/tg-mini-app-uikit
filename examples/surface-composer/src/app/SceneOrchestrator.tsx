/*
 * Linear scene machine over all six SceneIds (data-model). A single primary
 * action advances scene-by-scene in fixed keynote order (FR-015) — the contract
 * is real even though only firstLaunch/rangeRemix render this increment (D10);
 * the other four are enumerated-not-rendered.
 *
 * Decoupled from the scene components: the app supplies a `scenes` map, so this
 * stays foundational and never imports US1/US2 files.
 */
import { useCallback, type ReactNode } from "react";
import { nextScene, type SceneId } from "./composerReducer";
import { useComposer, useComposerDispatch } from "./composerStore";

/** Advance to the next scene in keynote order; emits one recorder event (FR-015). */
export function useAdvanceScene(): () => void {
  const { scene } = useComposer();
  const dispatch = useComposerDispatch();
  return useCallback(() => {
    const next = nextScene(scene);
    if (next === scene) return;
    dispatch({
      type: "scene",
      scene: next,
      record: { source: "pointer", target: `orchestrator.advance.${next}`, reaction: "scene-advance" },
    });
  }, [scene, dispatch]);
}

export interface SceneOrchestratorProps {
  /** Renderable scenes by id; deferred scenes are simply absent (D10). */
  scenes: Partial<Record<SceneId, ReactNode>>;
}

export function SceneOrchestrator({ scenes }: SceneOrchestratorProps) {
  const { scene } = useComposer();
  return <>{scenes[scene] ?? scenes.firstLaunch ?? null}</>;
}

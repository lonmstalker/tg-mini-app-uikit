/*
 * Dev-only recorder HUD (Principle III). Gated behind `?hud=1` in dev builds so
 * it NEVER appears in the buyer first viewport — and never in the e2e visual
 * snapshots (off by default). It lives on the dark stage, outside the surface
 * frame, and just mirrors the live recorder log for debugging.
 */
import { useComposer } from "../app/composerStore";

const SHOW_HUD =
  import.meta.env.DEV &&
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).get("hud") === "1";

export function RecorderPanelDev() {
  const { recorder, runtimeMode, scene, motionState, businessContext } = useComposer();
  if (!SHOW_HUD) return null;
  return (
    <aside className="sc-hud" aria-hidden="true">
      <div className="sc-hud__head">
        {scene} · {motionState} · {businessContext} · {runtimeMode}
      </div>
      <ol className="sc-hud__log">
        {recorder.slice(-9).map((e) => (
          <li key={e.id}>
            <span className="sc-hud__n">{e.timestamp}</span> {e.reaction}
            <span className="sc-hud__src">{e.source}</span>
          </li>
        ))}
      </ol>
    </aside>
  );
}

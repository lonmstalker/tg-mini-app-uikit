/*
 * Minimal FLIP using transform/opacity ONLY (FR-013) — no width/height/top/left.
 * first → last → invert → play. The remix shared-element morph measures slots
 * before content rebinds, then plays each slot from its old box back to identity
 * so the surface reads as one object reflowing, not a page swap (D6).
 */
import { SC_EASE } from "./easing";

export type RectMap = Map<string, DOMRect>;

/** Capture current bounding rects, keyed by stable slot id (the "first" read). */
export function recordRects(nodes: Iterable<readonly [string, HTMLElement]>): RectMap {
  const map: RectMap = new Map();
  for (const [id, el] of nodes) map.set(id, el.getBoundingClientRect());
  return map;
}

export interface FlipOptions {
  duration: number;
  easing?: string;
  stagger?: number;
}

/*
 * Call AFTER the DOM has settled into its new layout: each node animates from
 * its previous position/scale back to identity. Returns the Animations so the
 * caller can await `Promise.all(anims.map(a => a.finished))`.
 */
export function playFlip(
  nodes: Iterable<readonly [string, HTMLElement]>,
  prev: RectMap,
  opts: FlipOptions,
): Animation[] {
  const anims: Animation[] = [];
  let i = 0;
  for (const [id, el] of nodes) {
    const first = prev.get(id);
    if (!first) {
      i++;
      continue;
    }
    const last = el.getBoundingClientRect();
    const dx = first.left - last.left;
    const dy = first.top - last.top;
    const sx = first.width / Math.max(last.width, 1);
    const sy = first.height / Math.max(last.height, 1);
    const moved = Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5 || Math.abs(sx - 1) > 0.01 || Math.abs(sy - 1) > 0.01;
    if (!moved) {
      i++;
      continue;
    }
    anims.push(
      el.animate(
        [
          { transformOrigin: "top left", transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
          { transformOrigin: "top left", transform: "translate(0, 0) scale(1, 1)" },
        ],
        { duration: opts.duration, easing: opts.easing ?? SC_EASE.outQuint, delay: (opts.stagger ?? 0) * i, fill: "both" },
      ),
    );
    i++;
  }
  return anims;
}

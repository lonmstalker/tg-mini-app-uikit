import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
} from "react";
import { TKIconButton } from "../../atoms/buttons";
import { tkFormat, useTKLocale } from "../../foundation/i18n";
import { mergeRefs } from "../../internal/dom";
import { tkDragVelocity, tkShouldCommit, type TKDragSample } from "../../internal/useDragGesture";
import { useControllable } from "../../internal/useControllable";
import { useIsomorphicLayoutEffect } from "../../internal/useIsomorphicLayoutEffect";
import { useLatest } from "../../internal/useLatest";
import { useModalOverlay, useMountTransition } from "./shared";

export interface TKImageViewerImage {
  src: string;
  /** Required: the viewer is the only content on screen — AT must know what it shows. */
  alt: string;
  /** Low-res placeholder painted under the full image while it loads. */
  thumb?: string;
}

export interface TKImageViewerProps {
  open: boolean;
  onClose?: () => void;
  images: TKImageViewerImage[];
  /** Current image index (controlled). */
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  /** Source element of the tapped preview — the image grows out of its rect (FLIP). */
  originRef?: RefObject<HTMLElement | null>;
  testId?: string;
}

const MIN_SCALE = 1;
const MAX_SCALE = 3;
const DOUBLE_TAP_SCALE = 2.5;

const motionOff = (el: HTMLElement) =>
  !!el.closest('.tk[data-tk-motion="off"]') ||
  (typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches);

type GestureMode = "idle" | "press" | "swipe" | "dismiss" | "pan" | "pinch";

const withTransition = (el: HTMLElement | null, run: () => void) => {
  if (!el) return;
  el.style.transition = "transform var(--tk-t2) var(--tk-spring)";
  const clear = () => {
    el.style.transition = "";
    el.removeEventListener("transitionend", clear);
  };
  el.addEventListener("transitionend", clear);
  // Fallback for engines that skip transitionend on a no-op write.
  window.setTimeout(clear, 700);
  run();
};

const slotStyle = (offset: -1 | 0 | 1): CSSProperties => ({
  position: "absolute",
  inset: 0,
  transform: offset === 0 ? undefined : `translateX(${offset * 100}%)`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const imgStyle: CSSProperties = {
  maxWidth: "100%",
  maxHeight: "100%",
  objectFit: "contain",
  userSelect: "none",
  WebkitUserSelect: "none",
};

/**
 * Full-screen photo viewer (Telegram media viewer / iOS Photos): shared-element
 * open from the tapped preview, pinch-zoom 1–3× with rubber-banding, double-tap
 * zoom, 1:1 finger-tracked swipe-down to close with velocity hand-off, and
 * horizontal swipes between frames at 1×. Every gesture writes transforms
 * imperatively — no React commit and no layout rides a pointer frame.
 * Pinch and pan stay live under reduced motion (they are control, not
 * decoration); entrances/exits collapse via the motion tokens.
 */
export const TKImageViewer = /* @__PURE__ */ forwardRef<HTMLDivElement, TKImageViewerProps>(function TKImageViewer(
  { open, onClose, images, index: indexProp, defaultIndex, onIndexChange, originRef, testId },
  forwardedRef,
) {
  const locale = useTKLocale();
  const stageRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  // Zoomable content node per rendered slot, keyed by ABSOLUTE image index.
  const contentRefs = useRef(new Map<number, HTMLDivElement>());
  const { mounted, closing } = useMountTransition(open, 260, stageRef);
  const [indexRaw, setIndex] = useControllable(indexProp, defaultIndex ?? 0, onIndexChange);
  const index = Math.min(Math.max(indexRaw, 0), Math.max(images.length - 1, 0));
  const indexRef = useLatest(index);
  // Which exit plays: swipe hand-off (image continues under the finger) vs
  // plain zoom-out fade for button/Escape/Back closes.
  const [exitViaSwipe, setExitViaSwipe] = useState(false);
  const closeRef = useLatest(onClose);

  const { scrimZ, panelZ, panelProps, scrimProps } = useModalOverlay({
    mounted,
    active: mounted && !closing,
    ref: stageRef,
    onClose,
  });

  /* ---------------- gesture state (refs only — no per-frame commits) ---------------- */
  const gs = useRef({
    pointers: new Map<number, { x: number; y: number }>(),
    mode: "idle" as GestureMode,
    startX: 0,
    startY: 0,
    startTx: 0,
    startTy: 0,
    startScale: 1,
    pinchDist: 1,
    pinchMid: { x: 0, y: 0 },
    samples: [] as TKDragSample[],
    scale: 1,
    tx: 0,
    ty: 0,
    lastTap: null as { t: number; x: number; y: number } | null,
    downTarget: null as EventTarget | null,
  });

  const content = () => contentRefs.current.get(indexRef.current) ?? null;

  const applyContent = () => {
    const el = content();
    const g = gs.current;
    if (el) el.style.transform = `translate(${g.tx}px, ${g.ty}px) scale(${g.scale})`;
  };

  const clampPan = (g: { scale: number; tx: number; ty: number }) => {
    const stage = stageRef.current;
    if (!stage) return;
    // ponytail: bounds follow the stage box, not the letterboxed image rect —
    // switch to the image rect if edge gaps at high zoom ever matter.
    const maxTx = ((g.scale - 1) * stage.clientWidth) / 2;
    const maxTy = ((g.scale - 1) * stage.clientHeight) / 2;
    g.tx = Math.min(maxTx, Math.max(-maxTx, g.tx));
    g.ty = Math.min(maxTy, Math.max(-maxTy, g.ty));
  };

  const resetZoom = () => {
    const g = gs.current;
    g.scale = 1;
    g.tx = 0;
    g.ty = 0;
  };

  /** Point relative to the stage center — the zoom anchor space. */
  const stagePoint = (clientX: number, clientY: number) => {
    const r = stageRef.current?.getBoundingClientRect();
    return r
      ? { x: clientX - r.left - r.width / 2, y: clientY - r.top - r.height / 2 }
      : { x: 0, y: 0 };
  };

  const setScaleAround = (nextScale: number, anchor: { x: number; y: number }, from: { scale: number; tx: number; ty: number }) => {
    const g = gs.current;
    const k = nextScale / from.scale;
    g.scale = nextScale;
    g.tx = anchor.x - (anchor.x - from.tx) * k;
    g.ty = anchor.y - (anchor.y - from.ty) * k;
  };

  const settleZoom = () => {
    const g = gs.current;
    const target = Math.min(MAX_SCALE, Math.max(MIN_SCALE, g.scale));
    const el = content();
    if (target === 1) {
      g.scale = 1;
      g.tx = 0;
      g.ty = 0;
    } else {
      const k = target / g.scale;
      g.scale = target;
      g.tx *= k;
      g.ty *= k;
      clampPan(g);
    }
    withTransition(el, applyContent);
  };

  const doubleTap = (clientX: number, clientY: number) => {
    const g = gs.current;
    const el = content();
    if (g.scale > 1.01) {
      resetZoom();
    } else {
      const p = stagePoint(clientX, clientY);
      setScaleAround(DOUBLE_TAP_SCALE, p, { scale: 1, tx: 0, ty: 0 });
      clampPan(g);
    }
    withTransition(el, applyContent);
  };

  const setDismissProgress = (y: number) => {
    const el = content();
    const scrim = scrimRef.current;
    const h = stageRef.current?.clientHeight || 1;
    if (el) el.style.transform = `translateY(${y}px)`;
    if (scrim) {
      scrim.style.animation = "none";
      scrim.style.opacity = String(Math.max(0.2, 1 - (Math.max(0, y) / h) * 1.2));
    }
    const chrome = chromeRef.current;
    if (chrome) chrome.style.opacity = String(Math.max(0, 1 - (Math.max(0, y) / h) * 2.4));
  };

  const chromeRef = useRef<HTMLDivElement>(null);

  const step = (dir: 1 | -1) => {
    const next = indexRef.current + dir;
    if (next < 0 || next > images.length - 1) return;
    // Programmatic jump (keyboard / swipe commit): the old frame keeps its node
    // via key, so wipe its zoom before it parks as a neighbour.
    const prev = contentRefs.current.get(indexRef.current);
    if (prev) prev.style.transform = "";
    resetZoom();
    setIndex(next);
  };

  // The track glides to ±100% during a swipe commit; once the new frame set
  // renders (identical arrangement), snap it back to 0 before paint.
  useIsomorphicLayoutEffect(() => {
    const track = trackRef.current;
    if (track) {
      track.style.transition = "";
      track.style.transform = "";
    }
  }, [index]);

  const commitSwipe = (dir: 1 | -1, canAnimate: boolean) => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage || motionOff(stage) || !canAnimate) {
      step(dir);
      return;
    }
    // Glide the track one viewport over, then swap the frame and snap back to 0
    // in the same commit — the new arrangement paints identically. The timeout
    // backstops a lost transitionend (hidden tab, interrupted transition) so a
    // committed swipe can never strand the track mid-way.
    const w = stage.clientWidth;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      track.removeEventListener("transitionend", finish);
      window.clearTimeout(timer);
      step(dir);
    };
    const timer = window.setTimeout(finish, 500);
    track.addEventListener("transitionend", finish);
    track.style.transition = "transform var(--tk-t2) var(--tk-ease)";
    track.style.transform = `translateX(${-dir * w}px)`;
  };

  /* ---------------- pointer handlers ---------------- */

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    const g = gs.current;
    // Chrome (counter/close) owns its own pointers — capturing here would
    // steal the button's click.
    if (e.target instanceof Node && chromeRef.current?.contains(e.target)) return;
    g.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    // Keeps the gesture when the finger leaves the stage; throws for synthetic
    // pointer ids (tests), where losing capture is fine.
    try {
      stageRef.current?.setPointerCapture?.(e.pointerId);
    } catch {
      /* no live pointer behind this id */
    }
    g.downTarget = e.target;
    const el = content();
    if (el) el.style.transition = "";
    if (g.pointers.size === 2) {
      const [a, b] = [...g.pointers.values()];
      g.mode = "pinch";
      g.pinchDist = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      g.pinchMid = stagePoint((a.x + b.x) / 2, (a.y + b.y) / 2);
      g.startScale = g.scale;
      g.startTx = g.tx;
      g.startTy = g.ty;
    } else if (g.pointers.size === 1) {
      g.mode = "press";
      g.startX = e.clientX;
      g.startY = e.clientY;
      g.startTx = g.tx;
      g.startTy = g.ty;
      g.startScale = g.scale;
      g.samples = [];
      const track = trackRef.current;
      if (track) track.style.transition = "";
    }
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const g = gs.current;
    if (!g.pointers.has(e.pointerId)) return;
    g.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (g.mode === "pinch") {
      if (g.pointers.size < 2) return;
      const [a, b] = [...g.pointers.values()];
      const dist = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      let next = g.startScale * (dist / g.pinchDist);
      // rubber-band past 1× and 3×
      if (next > MAX_SCALE) next = MAX_SCALE + (next - MAX_SCALE) * 0.25;
      if (next < MIN_SCALE) next = MIN_SCALE - (MIN_SCALE - next) * 0.5;
      setScaleAround(next, g.pinchMid, { scale: g.startScale, tx: g.startTx, ty: g.startTy });
      applyContent();
      return;
    }

    const dx = e.clientX - g.startX;
    const dy = e.clientY - g.startY;
    if (g.mode === "press") {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      if (g.scale > 1.01) g.mode = "pan";
      else if (Math.abs(dx) > Math.abs(dy)) g.mode = "swipe";
      else g.mode = "dismiss";
    }
    if (g.mode === "pan") {
      g.tx = g.startTx + dx;
      g.ty = g.startTy + dy;
      // soft rubber outside the bounds
      const before = { scale: g.scale, tx: g.tx, ty: g.ty };
      clampPan(g);
      g.tx += (before.tx - g.tx) * 0.3;
      g.ty += (before.ty - g.ty) * 0.3;
      applyContent();
    } else if (g.mode === "swipe") {
      g.samples.push({ pos: e.clientX, t: e.timeStamp });
      if (g.samples.length > 24) g.samples.shift();
      const atStart = indexRef.current === 0 && dx > 0;
      const atEnd = indexRef.current === images.length - 1 && dx < 0;
      const x = atStart || atEnd ? dx * 0.3 : dx;
      const track = trackRef.current;
      if (track) track.style.transform = `translateX(${x}px)`;
    } else if (g.mode === "dismiss") {
      g.samples.push({ pos: e.clientY, t: e.timeStamp });
      if (g.samples.length > 24) g.samples.shift();
      // 1:1 downward behind the finger; upward is rubbered and never commits
      setDismissProgress(dy > 0 ? dy : dy * 0.3);
    }
  };

  const restoreRest = () => {
    const g = gs.current;
    withTransition(content(), () => {
      g.tx = 0;
      g.ty = 0;
      applyContent();
    });
    const scrim = scrimRef.current;
    if (scrim) {
      scrim.style.transition = "opacity var(--tk-t2) var(--tk-ease)";
      scrim.style.opacity = "1";
      window.setTimeout(() => {
        scrim.style.transition = "";
      }, 700);
    }
    const chrome = chromeRef.current;
    if (chrome) chrome.style.opacity = "";
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const g = gs.current;
    if (!g.pointers.delete(e.pointerId)) return;
    const mode = g.mode;
    if (mode === "pinch") {
      if (g.pointers.size >= 1) {
        // One finger lifted: hand over to a pan from the remaining finger.
        const [rest] = [...g.pointers.values()];
        g.mode = g.scale > 1.01 ? "pan" : "press";
        g.startX = rest.x;
        g.startY = rest.y;
        g.startTx = g.tx;
        g.startTy = g.ty;
        if (g.scale < MIN_SCALE || g.scale > MAX_SCALE) settleZoom();
        return;
      }
      g.mode = "idle";
      settleZoom();
      return;
    }
    if (g.pointers.size > 0) return;
    g.mode = "idle";

    if (mode === "press") {
      const tap = { t: e.timeStamp, x: e.clientX, y: e.clientY };
      const last = g.lastTap;
      if (last && tap.t - last.t < 300 && Math.hypot(tap.x - last.x, tap.y - last.y) < 32) {
        g.lastTap = null;
        doubleTap(tap.x, tap.y);
      } else {
        g.lastTap = tap;
        // Tap on the empty stage around the image (the "scrim") closes.
        if (g.downTarget instanceof HTMLElement && g.downTarget.tagName !== "IMG") closeRef.current?.();
      }
      return;
    }
    if (mode === "pan") {
      const before = { ...g };
      clampPan(g);
      if (before.tx !== g.tx || before.ty !== g.ty) withTransition(content(), applyContent);
      return;
    }
    if (mode === "swipe") {
      const dx = e.clientX - g.startX;
      const v = tkDragVelocity(g.samples);
      const w = stageRef.current?.clientWidth || 1;
      const dir: 1 | -1 = dx < 0 ? 1 : -1;
      const target = indexRef.current + dir;
      const inRange = target >= 0 && target <= images.length - 1;
      // Velocity counts only when it points the same way as the travel.
      const vTowards = dx < 0 === v < 0 ? Math.abs(v) : 0;
      if (inRange && tkShouldCommit(Math.abs(dx), vTowards, w, { distanceRatio: 0.35 })) {
        commitSwipe(dir, true);
      } else {
        withTransition(trackRef.current, () => {
          const track = trackRef.current;
          if (track) track.style.transform = "translateX(0px)";
        });
      }
      return;
    }
    if (mode === "dismiss") {
      const dyEnd = e.clientY - g.startY;
      const v = tkDragVelocity(g.samples);
      const h = stageRef.current?.clientHeight || 1;
      if (dyEnd > 0 && tkShouldCommit(dyEnd, v, h * 0.7)) {
        setExitViaSwipe(true);
        closeRef.current?.();
      } else {
        restoreRest();
      }
    }
  };

  const onPointerCancel = (e: PointerEvent<HTMLDivElement>) => {
    const g = gs.current;
    g.pointers.delete(e.pointerId);
    if (g.pointers.size > 0) return;
    const mode = g.mode;
    g.mode = "idle";
    if (mode === "pinch") settleZoom();
    else if (mode === "dismiss") restoreRest();
    else if (mode === "swipe") {
      const track = trackRef.current;
      if (track) withTransition(track, () => (track.style.transform = "translateX(0px)"));
    }
  };

  /* ---------------- open/close lifecycle ---------------- */

  // Fresh open: reset zoom/exit state; FLIP the image out of the origin rect.
  useIsomorphicLayoutEffect(() => {
    if (!open || !mounted) return;
    setExitViaSwipe(false);
    resetZoom();
    const el = content();
    if (el) el.style.transform = "";
    const stage = stageRef.current;
    const origin = originRef?.current;
    if (!stage || !el || motionOff(stage) || typeof el.animate !== "function") return;
    if (origin) {
      const from = origin.getBoundingClientRect();
      const to = stage.getBoundingClientRect();
      if (from.width > 0 && to.width > 0) {
        const scale = Math.max(from.width / to.width, from.height / to.height);
        const dx = from.left + from.width / 2 - (to.left + to.width / 2);
        const dy = from.top + from.height / 2 - (to.top + to.height / 2);
        el.animate(
          [
            { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, opacity: 0.4 },
            { transform: "none", opacity: 1 },
          ],
          { duration: 260, easing: "cubic-bezier(.22,.61,.36,1)" },
        );
        return;
      }
    }
    // No origin: a tk-modal-in-like zoom+fade.
    el.animate(
      [
        { transform: "scale(.86)", opacity: 0 },
        { transform: "none", opacity: 1 },
      ],
      { duration: 260, easing: "cubic-bezier(.22,.61,.36,1)" },
    );
  }, [open, mounted]);

  // Preserve gesture-map hygiene across unmounts.
  useEffect(() => {
    if (!mounted) {
      gs.current.pointers.clear();
      gs.current.mode = "idle";
    }
  }, [mounted]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
    }
  };

  if (!mounted || images.length === 0) return null;

  const current = images[index];
  const slots = ([-1, 0, 1] as const)
    .map((offset) => ({ offset, i: index + offset }))
    .filter(({ i }) => i >= 0 && i < images.length);

  return (
    <>
      <div
        ref={scrimRef}
        {...scrimProps}
        style={{
          position: "absolute",
          inset: 0,
          background: "var(--tk-scrim)",
          zIndex: scrimZ,
          animation: `${closing ? "tk-viewer-fade" : "tk-fade-in"} var(--tk-t2) var(--tk-ease) both`,
        }}
      />
      <div
        ref={mergeRefs(stageRef, forwardedRef)}
        {...panelProps}
        data-testid={testId}
        aria-label={current.alt}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: panelZ,
          // Deliberate: the stage is tabIndex={-1} (never Tab-reachable) and only
          // takes programmatic focus when the trap has nothing else; Tab-reachable
          // chrome (close button) keeps the `.tk :focus-visible` outline, and the
          // arrow-key handler works from any focus inside via bubbling.
          outline: "none",
          overflow: "hidden",
          // Claims every touch: iOS Telegram must not page-zoom or scroll under
          // the pinch, and vertical drags must reach the dismiss gesture.
          touchAction: "none",
          // The stage always fades on close; the swipe path runs at t3 so
          // useMountTransition keeps the node alive for the full tk-viewer-down
          // ride of the image inside it.
          animation: closing
            ? `tk-viewer-fade ${exitViaSwipe ? "var(--tk-t3)" : "var(--tk-t2)"} var(--tk-ease) both`
            : undefined,
        }}
      >
        <div ref={trackRef} style={{ position: "absolute", inset: 0 }}>
          {slots.map(({ offset, i }) => {
            const image = images[i];
            return (
              <div key={i} style={slotStyle(offset)}>
                <div
                  ref={(node) => {
                    if (node) contentRefs.current.set(i, node);
                    else contentRefs.current.delete(i);
                  }}
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    animation:
                      closing && exitViaSwipe && offset === 0
                        ? "tk-viewer-down var(--tk-t3) var(--tk-ease) both"
                        : undefined,
                  }}
                >
                  {image.thumb ? (
                    // Painted under the full-res image while it streams in.
                    <img src={image.thumb} alt="" aria-hidden="true" draggable={false} style={{ ...imgStyle, position: "absolute" }} />
                  ) : null}
                  <img src={image.src} alt={image.alt} draggable={false} style={{ ...imgStyle, position: "relative" }} />
                </div>
              </div>
            );
          })}
        </div>
        <div
          ref={chromeRef}
          style={{
            position: "absolute",
            top: "calc(var(--tk-safe-top) + 10px)",
            left: 12,
            right: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "var(--tk-sp-2)",
          }}
        >
          <span
            aria-live="polite"
            style={{
              padding: "5px 12px",
              borderRadius: "var(--tk-r-pill)",
              background: "var(--tk-glass)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              color: "var(--tk-text)",
              fontSize: "var(--tk-fz-footnote)",
              fontWeight: 600,
              visibility: images.length > 1 ? undefined : "hidden",
            }}
          >
            {tkFormat(locale.imageCounter, { current: index + 1, total: images.length })}
          </span>
          <TKIconButton
            icon="close"
            size={34}
            variant="surface"
            label={locale.close}
            onClick={onClose}
            style={{ background: "var(--tk-glass)", backdropFilter: "blur(10px)", boxShadow: "none" }}
          />
        </div>
      </div>
    </>
  );
});

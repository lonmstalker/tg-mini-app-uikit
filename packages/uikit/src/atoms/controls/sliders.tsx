import { useRef, useState, type KeyboardEvent } from "react";
import { useControllable } from "../../internal/useControllable";
import { useOptionalHaptics } from "../../foundation/telegram";
import { useTKLocale, tkFormat } from "../../foundation/i18n";

// Dev-only nudge: a slider with no `label` has no accessible name (CTL-005).
function tkWarnSliderName(label?: string) {
  if (process.env.NODE_ENV !== "production" && !label) {
    // eslint-disable-next-line no-console
    console.warn("TKSlider: pass `label` so the slider has an accessible name (CTL-005).");
  }
}

/* ---------------- Slider ---------------- */

export interface TKSliderProps {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  suffix?: string;
  disabled?: boolean;
  /** Accessible name of the slider. */
  label?: string;
  /** Two-thumb range mode. */
  range?: boolean;
  rangeValue?: [number, number];
  defaultRange?: [number, number];
  onRangeChange?: (range: [number, number]) => void;
  /** Tick marks rendered on the track. */
  marks?: number[];
  testId?: string;
}

export function TKSlider(props: TKSliderProps) {
  if (props.range) return <TKRangeSliderImpl {...props} />;
  return <TKSingleSliderImpl {...props} />;
}

/*
 * Positioning contract (perf): thumbs and bubbles ride full-width "rails"
 * (absolute, inset 0) moved with percentage translateX — a percent of the rail
 * IS a percent of the track, so no measurements are needed to position, and a
 * value change never animates `left`/`width`. Fills slide/scale inside an
 * overflow-hidden trough. During a drag every visual updates imperatively from
 * ONE getBoundingClientRect cached at pointerdown (rAF-deduplicated, no
 * setState per move for uncontrolled sliders) — the finger costs zero layouts
 * and zero React commits per frame.
 */

/** Mutate React-rendered text in place: the single text node's value is
 * swapped so React's reconciler still owns the same node (never textContent,
 * which would replace nodes behind React's back). */
function tkSetText(el: HTMLElement | null, text: string) {
  const node = el?.firstChild;
  if (node && node.nodeType === Node.TEXT_NODE) node.nodeValue = text;
}

function TKSingleSliderImpl({ min = 0, max = 100, step: stepProp = 1, value, defaultValue, onChange, suffix = "", disabled, label, marks, testId }: TKSliderProps) {
  tkWarnSliderName(label);
  // Guard non-positive step against divide-by-zero/NaN in the snap math (CTL-009).
  const step = stepProp > 0 ? stepProp : 1;
  const [val, setVal] = useControllable(value, defaultValue ?? min, onChange);
  const isControlled = value !== undefined;
  const [drag, setDrag] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const thumbRailRef = useRef<HTMLDivElement>(null);
  const bubbleRailRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const haptics = useOptionalHaptics();
  const lastTick = useRef(0);
  // Per-gesture session: the track rect is read ONCE at pointerdown; moves
  // compute the value from the cache and paint imperatively.
  const session = useRef<{ rect: DOMRect; val: number; raf: number; pendingX: number | null } | null>(null);
  const pctOf = (v: number) => (max === min ? 0 : ((v - min) / (max - min)) * 100);
  const pct = pctOf(val);

  const snapValue = (raw: number) =>
    Number(Math.min(max, Math.max(min, min + Math.round((raw - min) / step) * step)).toFixed(4));

  const tickHaptic = () => {
    // step tick haptic, throttled so fast drags do not buzz continuously
    const now = typeof performance !== "undefined" ? performance.now() : 0;
    if (now - lastTick.current > 80) {
      haptics.selection();
      lastTick.current = now;
    }
  };

  const paint = (v: number) => {
    const p = pctOf(v);
    if (thumbRailRef.current) thumbRailRef.current.style.transform = `translateX(${p}%)`;
    if (bubbleRailRef.current) bubbleRailRef.current.style.transform = `translateX(${p}%)`;
    if (fillRef.current) fillRef.current.style.transform = `translateX(${p - 100}%)`;
    tkSetText(bubbleRef.current, `${v}${suffix}`);
    ref.current?.setAttribute("aria-valuenow", String(v));
    ref.current?.setAttribute("aria-valuetext", `${v}${suffix}`);
  };

  const applyFromClientX = (clientX: number) => {
    const s = session.current;
    if (!s) return;
    const width = s.rect.width || 1;
    const x = Math.min(Math.max(clientX - s.rect.left, 0), width);
    const next = snapValue(min + (x / width) * (max - min));
    if (next === s.val) return;
    s.val = next;
    tickHaptic();
    paint(next);
    // The per-move onChange contract stays for BOTH modes (live consumers);
    // only the INTERNAL state commit waits for pointerup, so an uncontrolled
    // drag costs zero React commits per frame.
    onChange?.(next);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const big = Math.max(step, (max - min) / 10);
    let next = val;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = snapValue(val + step);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = snapValue(val - step);
    else if (e.key === "PageUp") next = snapValue(val + big);
    else if (e.key === "PageDown") next = snapValue(val - big);
    else if (e.key === "Home") next = min;
    else if (e.key === "End") next = max;
    else return;
    e.preventDefault();
    if (next !== val) {
      tickHaptic();
      setVal(next);
    }
  };

  return (
    <div data-testid={testId} style={{ padding: "6px 0", opacity: disabled ? 0.45 : 1 }}>
      <div
        ref={ref}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={val}
        aria-valuetext={`${val}${suffix}`}
        aria-disabled={disabled || undefined}
        onKeyDown={disabled ? undefined : onKeyDown}
        onPointerDown={(e) => {
          if (disabled) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          session.current = { rect: e.currentTarget.getBoundingClientRect(), val, raf: 0, pendingX: null };
          setDrag(true);
          applyFromClientX(e.clientX);
        }}
        onPointerMove={(e) => {
          const s = session.current;
          if (!s) return;
          // First move of a frame paints synchronously; extra same-frame moves
          // collapse into one trailing rAF flush (useDragGesture's dedup).
          if (typeof requestAnimationFrame !== "function") {
            applyFromClientX(e.clientX);
          } else if (!s.raf) {
            s.raf = requestAnimationFrame(() => {
              s.raf = 0;
              if (s.pendingX != null) {
                applyFromClientX(s.pendingX);
                s.pendingX = null;
              }
            });
            applyFromClientX(e.clientX);
          } else {
            s.pendingX = e.clientX;
          }
        }}
        onPointerUp={() => {
          const s = session.current;
          session.current = null;
          if (s?.raf) cancelAnimationFrame(s.raf);
          setDrag(false);
          // One state commit per gesture (uncontrolled). setVal re-fires
          // onChange with the already-reported final value — harmless.
          if (s && !isControlled && s.val !== val) setVal(s.val);
        }}
        style={{
          position: "relative",
          height: 28,
          cursor: disabled ? "default" : "pointer",
          touchAction: "pan-y",
          borderRadius: "var(--tk-r-pill)",
          pointerEvents: disabled ? "none" : undefined,
        }}
      >
        <div style={{ position: "absolute", top: 12, left: 0, right: 0, height: 4, borderRadius: 2, background: "var(--tk-surface-3)" }} />
        {/* Fill trough: a full-width bar slides in from the left inside an
            overflow-hidden rounded container — transform-only, radius intact. */}
        <div style={{ position: "absolute", top: 12, left: 0, right: 0, height: 4, borderRadius: 2, overflow: "hidden" }}>
          <div
            ref={fillRef}
            style={{ position: "absolute", inset: 0, background: "var(--tk-accent)", transform: `translateX(${pct - 100}%)` }}
          />
        </div>
        {marks?.map((m) => {
          const mp = max === min ? 0 : ((m - min) / (max - min)) * 100;
          return (
            <span
              key={m}
              style={{
                position: "absolute",
                top: 11,
                left: `calc(${mp}% - 3px)`,
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: mp <= pct ? "var(--tk-on-accent)" : "var(--tk-text-3)",
                boxShadow: "0 0 0 1px var(--tk-surface)",
              }}
            />
          );
        })}
        <div ref={thumbRailRef} style={{ position: "absolute", inset: 0, pointerEvents: "none", transform: `translateX(${pct}%)` }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: -14,
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "var(--tk-knob, #fff)",
              boxShadow: "0 2px 8px rgba(0,0,0,.25)",
              transform: drag ? "scale(1.15)" : "scale(1)",
              transition: "transform var(--tk-t1) var(--tk-ease)",
            }}
          />
        </div>
        <div ref={bubbleRailRef} style={{ position: "absolute", inset: 0, pointerEvents: "none", transform: `translateX(${pct}%)` }}>
          <div
            ref={bubbleRef}
            style={{
              position: "absolute",
              bottom: 32,
              left: -18,
              width: 36,
              // The live value text is the ONE thing a drag must relayout —
              // containment pins that layout to this 36px box, so the page
              // and the track never reflow with it.
              contain: "layout style",
              textAlign: "center",
              fontSize: "var(--tk-fz-caption)",
              fontWeight: 700,
              background: "var(--tk-text)",
              color: "var(--tk-bg)",
              borderRadius: "var(--tk-r-xs)",
              padding: "3px 0",
              opacity: drag ? 1 : 0,
              transform: drag ? "translateY(0) scale(1)" : "translateY(6px) scale(.8)",
              transition: "opacity var(--tk-t2) var(--tk-ease), transform var(--tk-t2) var(--tk-spring)",
            }}
          >
            {`${val}${suffix}`}
          </div>
        </div>
      </div>
    </div>
  );
}

function TKRangeSliderImpl({
  min = 0,
  max = 100,
  step: stepProp = 1,
  rangeValue,
  defaultRange,
  onRangeChange,
  suffix = "",
  disabled,
  label,
  marks,
  testId,
}: TKSliderProps) {
  const locale = useTKLocale();
  tkWarnSliderName(label);
  // A non-positive step would divide-by-zero in the snap math → NaN (CTL-009).
  const step = stepProp > 0 ? stepProp : 1;
  const [val, setVal] = useControllable<[number, number]>(rangeValue, defaultRange ?? [min, max], onRangeChange);
  const isControlled = rangeValue !== undefined;
  const [drag, setDrag] = useState<-1 | 0 | 1>(-1);
  const ref = useRef<HTMLDivElement>(null);
  const railRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)] as const;
  const thumbRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)] as const;
  const fillRef = useRef<HTMLDivElement>(null);
  const session = useRef<{
    rect: DOMRect;
    thumb: 0 | 1;
    vals: [number, number];
    raf: number;
    pendingX: number | null;
  } | null>(null);
  const pctOf = (n: number) => (max === min ? 0 : ((n - min) / (max - min)) * 100);

  const snapValue = (raw: number) =>
    Number(Math.min(max, Math.max(min, min + Math.round((raw - min) / step) * step)).toFixed(4));

  const clampThumb = (vals: [number, number], thumb: 0 | 1, raw: number): [number, number] => {
    const snapped = snapValue(raw);
    const next: [number, number] = [...vals] as [number, number];
    next[thumb] = thumb === 0 ? Math.min(snapped, vals[1]) : Math.max(snapped, vals[0]);
    return next;
  };

  const paint = (vals: [number, number]) => {
    const p0 = pctOf(vals[0]);
    const p1 = pctOf(vals[1]);
    if (railRefs[0].current) railRefs[0].current.style.transform = `translateX(${p0}%)`;
    if (railRefs[1].current) railRefs[1].current.style.transform = `translateX(${p1}%)`;
    if (fillRef.current) fillRef.current.style.transform = `translateX(${p0}%) scaleX(${(p1 - p0) / 100})`;
    for (const i of [0, 1] as const) {
      thumbRefs[i].current?.setAttribute("aria-valuenow", String(vals[i]));
      thumbRefs[i].current?.setAttribute("aria-valuetext", `${vals[i]}${suffix}`);
    }
  };

  const applyFromClientX = (clientX: number) => {
    const s = session.current;
    if (!s) return;
    const width = s.rect.width || 1;
    const x = Math.min(Math.max(clientX - s.rect.left, 0), width);
    const next = clampThumb(s.vals, s.thumb, min + (x / width) * (max - min));
    if (next[0] === s.vals[0] && next[1] === s.vals[1]) return;
    s.vals = next;
    paint(next);
    // Per-move onRange contract stays for both modes; the internal state
    // commit waits for pointerup (zero commits per frame when uncontrolled).
    onRangeChange?.(next);
  };

  const keyFor = (thumb: 0 | 1) => (e: KeyboardEvent<HTMLDivElement>) => {
    const big = Math.max(step, (max - min) / 10);
    const cur = val[thumb];
    let raw = cur;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") raw = cur + step;
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") raw = cur - step;
    else if (e.key === "PageUp") raw = cur + big;
    else if (e.key === "PageDown") raw = cur - big;
    else if (e.key === "Home") raw = min;
    else if (e.key === "End") raw = max;
    else return;
    e.preventDefault();
    setVal(clampThumb(val, thumb, raw));
  };

  const thumb = (i: 0 | 1) => (
    <div key={i} ref={railRefs[i]} style={{ position: "absolute", inset: 0, pointerEvents: "none", transform: `translateX(${pctOf(val[i])}%)` }}>
      <div
        ref={thumbRefs[i]}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        // Per-thumb names so the two range thumbs aren't both announced identically (CTL-005).
        aria-label={label ? tkFormat(i === 0 ? locale.sliderMin : locale.sliderMax, { label }) : undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={val[i]}
        aria-valuetext={`${val[i]}${suffix}`}
        aria-disabled={disabled || undefined}
        onKeyDown={disabled ? undefined : keyFor(i)}
        style={{
          position: "absolute",
          top: 0,
          left: -14,
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "var(--tk-knob, #fff)",
          boxShadow: "0 2px 8px rgba(0,0,0,.25)",
          pointerEvents: "auto",
          transform: drag === i ? "scale(1.15)" : "scale(1)",
          transition: "transform var(--tk-t1) var(--tk-ease)",
        }}
      />
    </div>
  );

  return (
    <div data-testid={testId} style={{ padding: "6px 0", opacity: disabled ? 0.45 : 1 }}>
      <div
        ref={ref}
        onPointerDown={(e) => {
          if (disabled) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          const rect = e.currentTarget.getBoundingClientRect();
          const width = rect.width || 1;
          const x = Math.min(Math.max(e.clientX - rect.left, 0), width);
          const raw = min + (x / width) * (max - min);
          const nearest: 0 | 1 = Math.abs(raw - val[0]) <= Math.abs(raw - val[1]) ? 0 : 1;
          session.current = { rect, thumb: nearest, vals: val, raf: 0, pendingX: null };
          setDrag(nearest);
          applyFromClientX(e.clientX);
        }}
        onPointerMove={(e) => {
          const s = session.current;
          if (!s) return;
          if (typeof requestAnimationFrame !== "function") {
            applyFromClientX(e.clientX);
          } else if (!s.raf) {
            s.raf = requestAnimationFrame(() => {
              s.raf = 0;
              if (s.pendingX != null) {
                applyFromClientX(s.pendingX);
                s.pendingX = null;
              }
            });
            applyFromClientX(e.clientX);
          } else {
            s.pendingX = e.clientX;
          }
        }}
        onPointerUp={() => {
          const s = session.current;
          session.current = null;
          if (s?.raf) cancelAnimationFrame(s.raf);
          setDrag(-1);
          if (s && !isControlled && (s.vals[0] !== val[0] || s.vals[1] !== val[1])) setVal(s.vals);
        }}
        style={{ position: "relative", height: 28, cursor: disabled ? "default" : "pointer", touchAction: "pan-y", pointerEvents: disabled ? "none" : undefined }}
      >
        <div style={{ position: "absolute", top: 12, left: 0, right: 0, height: 4, borderRadius: 2, background: "var(--tk-surface-3)" }} />
        <div style={{ position: "absolute", top: 12, left: 0, right: 0, height: 4, borderRadius: 2, overflow: "hidden" }}>
          <div
            ref={fillRef}
            style={{
              position: "absolute",
              inset: 0,
              background: "var(--tk-accent)",
              transform: `translateX(${pctOf(val[0])}%) scaleX(${(pctOf(val[1]) - pctOf(val[0])) / 100})`,
              transformOrigin: "0 50%",
            }}
          />
        </div>
        {marks?.map((m) => (
          <span
            key={m}
            style={{
              position: "absolute",
              top: 11,
              left: `calc(${pctOf(m)}% - 3px)`,
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: m >= val[0] && m <= val[1] ? "var(--tk-on-accent)" : "var(--tk-text-3)",
              boxShadow: "0 0 0 1px var(--tk-surface)",
            }}
          />
        ))}
        {thumb(0)}
        {thumb(1)}
      </div>
    </div>
  );
}

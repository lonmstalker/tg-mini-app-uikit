import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { useControllable } from "../../internal/useControllable";
import { useOptionalHaptics } from "../../foundation/telegram";

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

function TKRangeSliderImpl({
  min = 0,
  max = 100,
  step = 1,
  rangeValue,
  defaultRange,
  onRangeChange,
  suffix = "",
  disabled,
  label,
  marks,
  testId,
}: TKSliderProps) {
  const [val, setVal] = useControllable<[number, number]>(rangeValue, defaultRange ?? [min, max], onRangeChange);
  const [drag, setDrag] = useState<-1 | 0 | 1>(-1);
  const ref = useRef<HTMLDivElement>(null);
  const pct = (n: number) => (max === min ? 0 : ((n - min) / (max - min)) * 100);

  const clampThumb = (thumb: 0 | 1, raw: number): [number, number] => {
    const snapped = Number(Math.min(max, Math.max(min, min + Math.round((raw - min) / step) * step)).toFixed(4));
    const next: [number, number] = [...val] as [number, number];
    next[thumb] = thumb === 0 ? Math.min(snapped, val[1]) : Math.max(snapped, val[0]);
    return next;
  };

  const fromEvent = (e: PointerEvent<HTMLDivElement>): number => {
    const r = ref.current!.getBoundingClientRect();
    const x = Math.min(Math.max(e.clientX - r.left, 0), r.width || 1);
    return min + (x / (r.width || 1)) * (max - min);
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
    setVal(clampThumb(thumb, raw));
  };

  const thumb = (i: 0 | 1) => (
    <div
      key={i}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={val[i]}
      aria-valuetext={`${val[i]}${suffix}`}
      aria-disabled={disabled || undefined}
      onKeyDown={disabled ? undefined : keyFor(i)}
      style={{
        position: "absolute",
        top: 0,
        left: `calc(${pct(val[i])}% - 14px)`,
        width: 28,
        height: 28,
        borderRadius: "50%",
        background: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,.25)",
        transform: drag === i ? "scale(1.15)" : "scale(1)",
        transition: drag === i ? "transform var(--tk-t1) var(--tk-ease)" : "left var(--tk-t2) var(--tk-ease), transform var(--tk-t2) var(--tk-spring)",
      }}
    />
  );

  return (
    <div data-testid={testId} style={{ padding: "6px 0", opacity: disabled ? 0.45 : 1 }}>
      <div
        ref={ref}
        onPointerDown={(e) => {
          if (disabled) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          const raw = fromEvent(e);
          const nearest: 0 | 1 = Math.abs(raw - val[0]) <= Math.abs(raw - val[1]) ? 0 : 1;
          setDrag(nearest);
          setVal(clampThumb(nearest, raw));
        }}
        onPointerMove={(e) => {
          if (drag === -1) return;
          setVal(clampThumb(drag as 0 | 1, fromEvent(e)));
        }}
        onPointerUp={() => setDrag(-1)}
        style={{ position: "relative", height: 28, cursor: disabled ? "default" : "pointer", touchAction: "none", pointerEvents: disabled ? "none" : undefined }}
      >
        <div style={{ position: "absolute", top: 12, left: 0, right: 0, height: 4, borderRadius: 2, background: "var(--tk-surface-3)" }} />
        <div
          style={{
            position: "absolute",
            top: 12,
            left: `${pct(val[0])}%`,
            width: `${pct(val[1]) - pct(val[0])}%`,
            height: 4,
            borderRadius: 2,
            background: "var(--tk-accent)",
          }}
        />
        {marks?.map((m) => (
          <span
            key={m}
            style={{
              position: "absolute",
              top: 11,
              left: `calc(${pct(m)}% - 3px)`,
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

function TKSingleSliderImpl({ min = 0, max = 100, step = 1, value, defaultValue, onChange, suffix = "", disabled, label, marks, testId }: TKSliderProps) {
  const [val, setVal] = useControllable(value, defaultValue ?? min, onChange);
  const [drag, setDrag] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const haptics = useOptionalHaptics();
  const lastTick = useRef(0);
  const pct = max === min ? 0 : ((val - min) / (max - min)) * 100;

  const snap = (raw: number) => {
    const snapped = min + Math.round((raw - min) / step) * step;
    const next = Number(Math.min(max, Math.max(min, snapped)).toFixed(4));
    if (next !== val) {
      // step tick haptic, throttled so fast drags do not buzz continuously
      const now = typeof performance !== "undefined" ? performance.now() : 0;
      if (now - lastTick.current > 80) {
        haptics.selection();
        lastTick.current = now;
      }
    }
    setVal(next);
  };

  const setFromEvent = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = Math.min(Math.max(e.clientX - r.left, 0), r.width);
    snap(min + (x / r.width) * (max - min));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const big = Math.max(step, (max - min) / 10);
    if (e.key === "ArrowRight" || e.key === "ArrowUp") snap(val + step);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") snap(val - step);
    else if (e.key === "PageUp") snap(val + big);
    else if (e.key === "PageDown") snap(val - big);
    else if (e.key === "Home") snap(min);
    else if (e.key === "End") snap(max);
    else return;
    e.preventDefault();
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
          setDrag(true);
          setFromEvent(e);
        }}
        onPointerMove={(e) => drag && setFromEvent(e)}
        onPointerUp={() => setDrag(false)}
        style={{
          position: "relative",
          height: 28,
          cursor: disabled ? "default" : "pointer",
          touchAction: "none",
          borderRadius: "var(--tk-r-pill)",
          pointerEvents: disabled ? "none" : undefined,
        }}
      >
        <div style={{ position: "absolute", top: 12, left: 0, right: 0, height: 4, borderRadius: 2, background: "var(--tk-surface-3)" }} />
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 0,
            width: `${pct}%`,
            height: 4,
            borderRadius: 2,
            background: "var(--tk-accent)",
            transition: drag ? "none" : "width var(--tk-t2) var(--tk-ease)",
          }}
        />
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
        <div
          style={{
            position: "absolute",
            top: 0,
            left: `calc(${pct}% - 14px)`,
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,.25)",
            transform: drag ? "scale(1.15)" : "scale(1)",
            transition: drag
              ? "transform var(--tk-t1) var(--tk-ease)"
              : "left var(--tk-t2) var(--tk-ease), transform var(--tk-t2) var(--tk-spring)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 32,
            left: `calc(${pct}% - 18px)`,
            width: 36,
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
            pointerEvents: "none",
          }}
        >
          {val}
          {suffix}
        </div>
      </div>
    </div>
  );
}

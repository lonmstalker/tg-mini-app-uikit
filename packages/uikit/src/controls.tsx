import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { TKIcon, type TKIconName } from "./icons";
import { tkOptionItem, type TKOption } from "./options";
import { useControllable } from "./internal/useControllable";
import { tkFormat, useTKLocale } from "./i18n";
import { tkDomProps, type TKDomProps } from "./internal/dom";
import { tkRovingNext, tkTabbableIndex } from "./internal/roving";
import { useOptionalHaptics } from "./telegram";

/* ---------------- Chips ---------------- */

export interface TKChipProps extends TKDomProps<HTMLButtonElement> {
  children?: ReactNode;
  selected?: boolean;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLButtonElement>) => void;
  tabIndex?: number;
  icon?: TKIconName;
  removable?: boolean;
  onRemove?: () => void;
  disabled?: boolean;
  style?: CSSProperties;
}

export const TKChip = /* @__PURE__ */ forwardRef<HTMLButtonElement, TKChipProps>(function TKChip(
  { children, selected, onClick, onKeyDown, tabIndex, icon, removable, onRemove, disabled, style, ...dom },
  ref,
) {
  return (
    <button
      type="button"
      ref={ref}
      className="tk-press"
      onClick={onClick}
      onKeyDown={onKeyDown}
      tabIndex={tabIndex}
      disabled={disabled}
      {...tkDomProps(dom)}
      style={{
        opacity: disabled ? 0.45 : 1,
        pointerEvents: disabled ? "none" : undefined,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: 34,
        padding: "0 14px",
        border: "none",
        borderRadius: "var(--tk-r-pill)",
        fontSize: "var(--tk-fz-sub)",
        fontWeight: 500,
        fontFamily: "inherit",
        background: selected ? "var(--tk-accent)" : "var(--tk-surface)",
        color: selected ? "var(--tk-on-accent)" : "var(--tk-text)",
        boxShadow: selected ? "0 4px 12px -4px var(--tk-accent-35)" : "var(--tk-shadow-sm)",
        transition:
          "background var(--tk-t2) var(--tk-ease), color var(--tk-t2) var(--tk-ease), box-shadow var(--tk-t2) var(--tk-ease)",
        ...style,
      }}
    >
      {selected ? (
        <span className="tk-pop" style={{ display: "inline-flex" }}>
          <TKIcon name="check" size={15} strokeWidth={2.6} />
        </span>
      ) : icon ? (
        <TKIcon name={icon} size={15} />
      ) : null}
      {children}
      {removable ? (
        <span
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          style={{ display: "inline-flex", opacity: 0.6, marginRight: -4 }}
        >
          <TKIcon name="close" size={14} />
        </span>
      ) : null}
    </button>
  );
});

export interface TKChipGroupProps {
  items: TKOption[];
  /** Allow several selected items; `value` becomes `string[]`. */
  multi?: boolean;
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  testId?: string;
}

export function TKChipGroup({ items, multi, value, defaultValue, onChange, testId }: TKChipGroupProps) {
  const [sel, setSel] = useControllable<string | string[]>(
    value,
    defaultValue ?? (multi ? [] : ""),
    onChange,
  );
  const normalized = items.map(tkOptionItem);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const disabledAt = (i: number) => !!normalized[i]?.disabled;
  // toolbar pattern: focus roves with the arrows, selection stays put
  const [focusIdx, setFocusIdx] = useState(() => tkTabbableIndex(0, normalized.length, disabledAt));
  const isSel = (item: string) => (multi ? (sel as string[]).includes(item) : sel === item);
  const toggle = (item: string) => {
    if (!multi) return setSel(item);
    const list = sel as string[];
    setSel(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  };
  return (
    <div data-testid={testId} style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {normalized.map((item, i) => (
        <TKChip
          key={item.value}
          ref={(el) => {
            refs.current[i] = el;
          }}
          tabIndex={i === focusIdx ? 0 : -1}
          selected={isSel(item.value)}
          icon={item.icon}
          disabled={item.disabled}
          onClick={() => toggle(item.value)}
          onFocus={() => setFocusIdx(i)}
          onKeyDown={(e) => {
            const next = tkRovingNext(e.key, i, normalized.length, disabledAt, "horizontal");
            if (next == null) return;
            e.preventDefault();
            setFocusIdx(next);
            refs.current[next]?.focus();
          }}
        >
          {item.label}
        </TKChip>
      ))}
    </div>
  );
}

/* ---------------- Checkbox / Radio / Switch ---------------- */

export interface TKCheckboxProps extends TKDomProps<HTMLButtonElement> {
  label?: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  /** Mixed state (e.g. a parent of partially checked children). */
  indeterminate?: boolean;
  disabled?: boolean;
}

export const TKCheckbox = /* @__PURE__ */ forwardRef<HTMLButtonElement, TKCheckboxProps>(function TKCheckbox(
  { label, checked, defaultChecked, onChange, indeterminate, disabled, ...dom },
  ref,
) {
  const [on, setOn] = useControllable(checked, !!defaultChecked, onChange);
  const haptics = useOptionalHaptics();
  const boxOn = on || indeterminate;
  return (
    <button
      type="button"
      ref={ref}
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : on}
      disabled={disabled}
      onClick={() => {
        haptics.selection();
        setOn(!on);
      }}
      {...tkDomProps(dom)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        border: "none",
        background: "transparent",
        padding: 0,
        fontFamily: "inherit",
        fontSize: "var(--tk-fz-body)",
        color: "var(--tk-text)",
        cursor: "pointer",
        opacity: disabled ? 0.45 : 1,
        pointerEvents: disabled ? "none" : undefined,
      }}
    >
      <span
        className="tk-press"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 24,
          height: 24,
          borderRadius: "var(--tk-r-xs)",
          background: boxOn ? "var(--tk-accent)" : "transparent",
          boxShadow: boxOn ? "0 3px 8px -2px var(--tk-accent-35)" : "inset 0 0 0 2px var(--tk-text-3)",
          color: "var(--tk-on-accent)",
          transition: "background var(--tk-t2) var(--tk-ease), box-shadow var(--tk-t2) var(--tk-ease)",
        }}
      >
        {indeterminate ? (
          <span className="tk-pop" style={{ display: "inline-flex" }}>
            <TKIcon name="minus" size={15} strokeWidth={3} />
          </span>
        ) : on ? (
          <span className="tk-pop" style={{ display: "inline-flex" }}>
            <TKIcon name="check" size={15} strokeWidth={3} />
          </span>
        ) : null}
      </span>
      {label}
    </button>
  );
});

export interface TKRadioGroupProps {
  options: TKOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  testId?: string;
}

export function TKRadioGroup({ options, value, defaultValue, onChange, disabled, testId }: TKRadioGroupProps) {
  const items = options.map(tkOptionItem);
  const firstEnabled = items.find((item) => !item.disabled);
  const [val, setVal] = useControllable(value, defaultValue ?? firstEnabled?.value ?? "", onChange);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const haptics = useOptionalHaptics();
  const disabledAt = (i: number) => disabled || !!items[i]?.disabled;
  const tabbable = tkTabbableIndex(items.findIndex((item) => item.value === val), items.length, disabledAt);
  return (
    <div role="radiogroup" data-testid={testId} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {items.map((item, i) => {
        const on = item.value === val;
        const off = disabled || item.disabled;
        return (
          <button
            type="button"
            role="radio"
            aria-checked={on}
            key={item.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            tabIndex={i === tabbable ? 0 : -1}
            disabled={off}
            onClick={() => {
              haptics.selection();
              setVal(item.value);
            }}
            onKeyDown={(e) => {
              // WAI-ARIA radio: arrows move both focus and selection
              const next = tkRovingNext(e.key, i, items.length, disabledAt);
              if (next == null) return;
              e.preventDefault();
              setVal(items[next].value);
              refs.current[next]?.focus();
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              border: "none",
              background: "transparent",
              padding: 0,
              fontFamily: "inherit",
              fontSize: "var(--tk-fz-body)",
              color: "var(--tk-text)",
              cursor: "pointer",
              opacity: off ? 0.45 : 1,
              pointerEvents: off ? "none" : undefined,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 24,
                height: 24,
                borderRadius: "50%",
                boxShadow: on ? "inset 0 0 0 2px var(--tk-accent)" : "inset 0 0 0 2px var(--tk-text-3)",
                transition: "box-shadow var(--tk-t2) var(--tk-ease)",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: "var(--tk-accent)",
                  transform: on ? "scale(1)" : "scale(0)",
                  transition: "transform var(--tk-t2) var(--tk-spring)",
                }}
              />
            </span>
            <span style={{ textAlign: "left" }}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export interface TKSwitchProps extends TKDomProps<HTMLButtonElement> {
  label?: ReactNode;
  /** Accessible name for the label-less (standalone) variant. */
  ariaLabel?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  small?: boolean;
  disabled?: boolean;
}

export const TKSwitch = /* @__PURE__ */ forwardRef<HTMLButtonElement, TKSwitchProps>(function TKSwitch(
  { label, ariaLabel, checked, defaultChecked, onChange, small, disabled, ...dom },
  ref,
) {
  const [on, setOn] = useControllable(checked, !!defaultChecked, onChange);
  const haptics = useOptionalHaptics();
  const toggle = () => {
    haptics.selection();
    setOn(!on);
  };
  const W = small ? 42 : 51;
  const H = small ? 26 : 31;
  const K = H - 4;
  const node = (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        width: W,
        height: H,
        padding: 2,
        borderRadius: "var(--tk-r-pill)",
        background: on ? "var(--tk-green)" : "var(--tk-surface-3)",
        transition: "background var(--tk-t2) var(--tk-ease)",
        cursor: "pointer",
        flexShrink: 0,
        opacity: disabled ? 0.45 : 1,
      }}
    >
      <span
        style={{
          width: K,
          height: K,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 2px 6px rgba(0,0,0,.22)",
          transform: on ? `translateX(${W - K - 4}px)` : "translateX(0)",
          transition: "transform var(--tk-t2) var(--tk-spring)",
        }}
      />
    </span>
  );
  if (!label)
    return (
      <button
        type="button"
        ref={ref}
        role="switch"
        aria-checked={on}
        disabled={disabled}
        onClick={() => setOn(!on)}
        {...tkDomProps(dom)}
        aria-label={dom["aria-label"] ?? ariaLabel}
        style={{
          display: "inline-flex",
          padding: 0,
          border: "none",
          background: "transparent",
          cursor: disabled ? "default" : "pointer",
        }}
      >
        {node}
      </button>
    );
  return (
    <button
      type="button"
      ref={ref}
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={toggle}
      {...tkDomProps(dom)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        width: "100%",
        border: "none",
        background: "transparent",
        padding: 0,
        fontFamily: "inherit",
        fontSize: "var(--tk-fz-body)",
        color: "var(--tk-text)",
        cursor: "pointer",
        opacity: disabled ? 0.45 : 1,
        pointerEvents: disabled ? "none" : undefined,
      }}
    >
      {label}
      {node}
    </button>
  );
});

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

/* ---------------- Quantity stepper ---------------- */

export interface TKStepperProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
  /** Allows typing the value directly. */
  editable?: boolean;
  testId?: string;
}

export function TKStepper({ value, defaultValue = 1, min = 0, max = 99, onChange, editable, testId }: TKStepperProps) {
  const locale = useTKLocale();
  const [v, setV] = useControllable(value, defaultValue, onChange);
  const [draft, setDraft] = useState<string | null>(null);
  const vRef = useRef(v);
  vRef.current = v;
  const repeat = useRef<{ t?: number; i?: number }>({});

  const stopRepeat = () => {
    window.clearTimeout(repeat.current.t);
    window.clearInterval(repeat.current.i);
    repeat.current = {};
  };
  useEffect(() => stopRepeat, []);

  const stepBy = (dir: 1 | -1) => setV(Math.min(max, Math.max(min, vRef.current + dir)));

  const btn = (icon: TKIconName, name: string, dir: 1 | -1, disabled: boolean) => (
    <button
      type="button"
      className="tk-press"
      aria-label={name}
      disabled={disabled}
      // pointer presses step immediately and autorepeat while held;
      // keyboard activation arrives as click with detail === 0
      onPointerDown={() => {
        stepBy(dir);
        repeat.current.t = window.setTimeout(() => {
          repeat.current.i = window.setInterval(() => stepBy(dir), 120);
        }, 400);
      }}
      onPointerUp={stopRepeat}
      onPointerLeave={stopRepeat}
      onPointerCancel={stopRepeat}
      onClick={(e) => {
        if (e.detail === 0) stepBy(dir);
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 34,
        height: 34,
        border: "none",
        borderRadius: "var(--tk-r-sm)",
        background: "var(--tk-surface)",
        color: disabled ? "var(--tk-text-3)" : "var(--tk-accent)",
        boxShadow: "var(--tk-shadow-sm)",
      }}
    >
      <TKIcon name={icon} size={16} strokeWidth={2.5} />
    </button>
  );
  return (
    <div
      data-testid={testId}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: 4,
        borderRadius: "var(--tk-r-md)",
        background: "var(--tk-surface-2)",
      }}
    >
      {btn("minus", locale.decrease, -1, v <= min)}
      {editable ? (
        <input
          type="number"
          role="spinbutton"
          aria-label={locale.quantity}
          value={draft ?? String(v)}
          min={min}
          max={max}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            if (draft != null) {
              const parsed = Number(draft);
              if (Number.isFinite(parsed)) setV(Math.min(max, Math.max(min, Math.round(parsed))));
            }
            setDraft(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          style={{
            width: 48,
            textAlign: "center",
            fontWeight: 700,
            fontSize: "var(--tk-fz-body)",
            fontFamily: "inherit",
            border: "none",
            outline: "none",
            background: "transparent",
            color: "var(--tk-text)",
            boxShadow: "none",
            MozAppearance: "textfield",
          }}
        />
      ) : (
        <span
          key={v}
          className="tk-pop"
          style={{ minWidth: 36, textAlign: "center", fontWeight: 700, fontSize: "var(--tk-fz-body)" }}
        >
          {v}
        </span>
      )}
      {btn("plus", locale.increase, 1, v >= max)}
    </div>
  );
}

/* ---------------- Rating ---------------- */

export interface TKRatingProps {
  max?: number;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  /** Display-only: no hover, clicks do nothing. */
  readonly?: boolean;
  /** Render and accept half-star values (e.g. 3.5). */
  allowHalf?: boolean;
  testId?: string;
}

export function TKRating({ max = 5, value, defaultValue = 0, onChange, readonly, allowHalf, testId }: TKRatingProps) {
  const locale = useTKLocale();
  const [v, setV] = useControllable(value, defaultValue, onChange);
  const [hov, setHov] = useState(0);
  const shown = hov || v;
  return (
    <div role="group" aria-label={locale.rating} data-testid={testId} style={{ display: "flex", gap: 4 }}>
      {Array.from({ length: max }).map((_, i) => {
        const fill = Math.min(Math.max(shown - i, 0), 1); // 0 | 0.5 | 1 per star
        const on = fill > 0;
        const half = allowHalf && fill > 0 && fill < 1;
        return (
          <button
            type="button"
            key={i}
            aria-label={tkFormat(locale.ratingValue, { value: i + 1, max })}
            aria-pressed={!readonly && v >= i + 1}
            aria-disabled={readonly || undefined}
            tabIndex={readonly ? -1 : 0}
            onClick={
              readonly
                ? undefined
                : (e) => {
                    if (!allowHalf) return setV(i + 1);
                    const r = e.currentTarget.getBoundingClientRect();
                    setV(e.clientX - r.left < r.width / 2 && e.clientX > 0 ? i + 0.5 : i + 1);
                  }
            }
            onMouseEnter={readonly ? undefined : () => setHov(i + 1)}
            onMouseLeave={readonly ? undefined : () => setHov(0)}
            className={readonly ? undefined : "tk-press"}
            style={{
              border: "none",
              background: "transparent",
              padding: 2,
              color: on ? "var(--tk-orange)" : "var(--tk-text-3)",
              transition: "color var(--tk-t1) var(--tk-ease)",
              display: "inline-flex",
              position: "relative",
              cursor: readonly ? "default" : "pointer",
            }}
          >
            <span key={`${i}-${on}`} className={on && !readonly ? "tk-pop" : undefined} style={{ display: "inline-flex" }}>
              {half ? (
                <span style={{ position: "relative", display: "inline-flex" }}>
                  <TKIcon name="star" size={26} />
                  <span style={{ position: "absolute", inset: 0, width: "50%", overflow: "hidden", display: "inline-flex" }} data-tk-half-star>
                    <TKIcon name="star" size={26} filled />
                  </span>
                </span>
              ) : (
                <TKIcon name="star" size={26} filled={fill === 1} />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

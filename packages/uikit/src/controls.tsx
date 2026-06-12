import {
  forwardRef,
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

/* ---------------- Chips ---------------- */

export interface TKChipProps extends TKDomProps<HTMLButtonElement> {
  children?: ReactNode;
  selected?: boolean;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  icon?: TKIconName;
  removable?: boolean;
  onRemove?: () => void;
  disabled?: boolean;
  style?: CSSProperties;
}

export const TKChip = /* @__PURE__ */ forwardRef<HTMLButtonElement, TKChipProps>(function TKChip(
  { children, selected, onClick, icon, removable, onRemove, disabled, style, ...dom },
  ref,
) {
  return (
    <button
      type="button"
      ref={ref}
      className="tk-press"
      onClick={onClick}
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
  const isSel = (item: string) => (multi ? (sel as string[]).includes(item) : sel === item);
  const toggle = (item: string) => {
    if (!multi) return setSel(item);
    const list = sel as string[];
    setSel(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  };
  return (
    <div data-testid={testId} style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {items.map(tkOptionItem).map((item) => (
        <TKChip
          key={item.value}
          selected={isSel(item.value)}
          icon={item.icon}
          disabled={item.disabled}
          onClick={() => toggle(item.value)}
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
  disabled?: boolean;
}

export const TKCheckbox = /* @__PURE__ */ forwardRef<HTMLButtonElement, TKCheckboxProps>(function TKCheckbox(
  { label, checked, defaultChecked, onChange, disabled, ...dom },
  ref,
) {
  const [on, setOn] = useControllable(checked, !!defaultChecked, onChange);
  return (
    <button
      type="button"
      ref={ref}
      role="checkbox"
      aria-checked={on}
      disabled={disabled}
      onClick={() => setOn(!on)}
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
          background: on ? "var(--tk-accent)" : "transparent",
          boxShadow: on ? "0 3px 8px -2px var(--tk-accent-35)" : "inset 0 0 0 2px var(--tk-text-3)",
          color: "var(--tk-on-accent)",
          transition: "background var(--tk-t2) var(--tk-ease), box-shadow var(--tk-t2) var(--tk-ease)",
        }}
      >
        {on ? (
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
  return (
    <div role="radiogroup" data-testid={testId} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {items.map((item) => {
        const on = item.value === val;
        const off = disabled || item.disabled;
        return (
          <button
            type="button"
            role="radio"
            aria-checked={on}
            key={item.value}
            disabled={off}
            onClick={() => setVal(item.value)}
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
      onClick={() => setOn(!on)}
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
  testId?: string;
}

export function TKSlider({ min = 0, max = 100, step = 1, value, defaultValue, onChange, suffix = "", disabled, label, testId }: TKSliderProps) {
  const [val, setVal] = useControllable(value, defaultValue ?? min, onChange);
  const [drag, setDrag] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pct = max === min ? 0 : ((val - min) / (max - min)) * 100;

  const snap = (raw: number) => {
    const snapped = min + Math.round((raw - min) / step) * step;
    setVal(Number(Math.min(max, Math.max(min, snapped)).toFixed(4)));
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
  testId?: string;
}

export function TKStepper({ value, defaultValue = 1, min = 0, max = 99, onChange, testId }: TKStepperProps) {
  const locale = useTKLocale();
  const [v, setV] = useControllable(value, defaultValue, onChange);
  const btn = (icon: TKIconName, name: string, fn: () => void, disabled: boolean) => (
    <button
      type="button"
      className="tk-press"
      aria-label={name}
      disabled={disabled}
      onClick={fn}
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
      {btn("minus", locale.decrease, () => setV(Math.max(min, v - 1)), v <= min)}
      <span
        key={v}
        className="tk-pop"
        style={{ minWidth: 36, textAlign: "center", fontWeight: 700, fontSize: "var(--tk-fz-body)" }}
      >
        {v}
      </span>
      {btn("plus", locale.increase, () => setV(Math.min(max, v + 1)), v >= max)}
    </div>
  );
}

/* ---------------- Rating ---------------- */

export interface TKRatingProps {
  max?: number;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  testId?: string;
}

export function TKRating({ max = 5, value, defaultValue = 0, onChange, testId }: TKRatingProps) {
  const locale = useTKLocale();
  const [v, setV] = useControllable(value, defaultValue, onChange);
  const [hov, setHov] = useState(0);
  return (
    <div role="group" aria-label={locale.rating} data-testid={testId} style={{ display: "flex", gap: 4 }}>
      {Array.from({ length: max }).map((_, i) => {
        const on = i < (hov || v);
        return (
          <button
            type="button"
            key={i}
            aria-label={tkFormat(locale.ratingValue, { value: i + 1, max })}
            aria-pressed={v === i + 1}
            onClick={() => setV(i + 1)}
            onMouseEnter={() => setHov(i + 1)}
            onMouseLeave={() => setHov(0)}
            className="tk-press"
            style={{
              border: "none",
              background: "transparent",
              padding: 2,
              color: on ? "var(--tk-orange)" : "var(--tk-text-3)",
              transition: "color var(--tk-t1) var(--tk-ease)",
              display: "inline-flex",
            }}
          >
            <span key={`${i}-${on}`} className={on ? "tk-pop" : undefined} style={{ display: "inline-flex" }}>
              <TKIcon name="star" size={26} filled={on} />
            </span>
          </button>
        );
      })}
    </div>
  );
}

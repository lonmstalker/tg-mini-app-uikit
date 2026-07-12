import { useRef, useState, type KeyboardEvent } from "react";
import { TKIcon } from "../icons";
import { useControllable } from "../../internal/useControllable";
import { tkFormat, useTKLocale } from "../../foundation/i18n";

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
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  // Single tab stop on the currently-selected star (roving), else the first.
  const selectedStar = v > 0 ? Math.min(max, Math.ceil(v)) - 1 : 0;
  const focusStar = (val: number) => refs.current[Math.max(0, Math.min(max - 1, Math.ceil(val) - 1))]?.focus();
  // Keyboard sets the VALUE (never clientX): Arrow ±1, Shift+Arrow ±0.5 when
  // allowHalf, Home/End to the bounds — so half values are reachable (CTL-001).
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (readonly) return;
    const step = allowHalf && e.shiftKey ? 0.5 : 1;
    let nv = v;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") nv = Math.min(max, v + step);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") nv = Math.max(0, v - step);
    else if (e.key === "Home") nv = allowHalf ? 0.5 : 1;
    else if (e.key === "End") nv = max;
    else return;
    e.preventDefault();
    setV(nv);
    focusStar(nv);
  };
  return (
    <div role="radiogroup" aria-label={locale.rating} data-testid={testId} style={{ display: "flex", gap: 4 }}>
      {Array.from({ length: max }).map((_, i) => {
        const fill = Math.min(Math.max(shown - i, 0), 1); // 0 | 0.5 | 1 per star
        const on = fill > 0;
        const half = allowHalf && fill > 0 && fill < 1;
        return (
          <button
            type="button"
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="radio"
            aria-label={tkFormat(locale.ratingValue, { value: i + 1, max })}
            aria-checked={!readonly && Math.ceil(v) === i + 1}
            aria-disabled={readonly || undefined}
            tabIndex={readonly ? -1 : i === selectedStar ? 0 : -1}
            onKeyDown={readonly ? undefined : onKeyDown}
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
              // Interactive stars get a 44px touch target with a vertical hit-slop
              // so an inline rating in a list row keeps its compact height (CTL-004);
              // a readonly rating is a display-only indicator and needs no target.
              ...(readonly ? null : { minWidth: 44, minHeight: 44, marginTop: -7, marginBottom: -7 }),
              color: on ? "var(--tk-orange)" : "var(--tk-text-3)",
              transition: "color var(--tk-t1) var(--tk-ease)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
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

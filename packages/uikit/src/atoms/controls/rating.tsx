import { useState } from "react";
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

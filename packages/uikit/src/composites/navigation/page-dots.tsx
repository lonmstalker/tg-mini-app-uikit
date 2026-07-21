import { useRef, type CSSProperties, type KeyboardEvent } from "react";
import { tkFormat, useTKLocale } from "../../foundation/i18n";
import { useControllable } from "../../internal/useControllable";
import { tkRovingNext, tkTabbableIndex } from "../../internal/roving";

export interface TKPageDotsProps {
  count: number;
  page?: number;
  defaultPage?: number;
  onChange?: (page: number) => void;
  /** Merged onto the root, consumer values win (REU-007). */
  style?: CSSProperties;
  className?: string;
  testId?: string;
}

export function TKPageDots({ count, page, defaultPage = 0, onChange, style, className, testId }: TKPageDotsProps) {
  const locale = useTKLocale();
  const [cur, setCur] = useControllable(page, defaultPage, onChange);
  // Roving tabindex: one tab stop, arrows move focus + page (selection follows focus).
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabbable = tkTabbableIndex(cur, count);
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = tkRovingNext(e.key, index, count, undefined, "horizontal");
    if (next == null) return;
    e.preventDefault();
    setCur(next);
    btnRefs.current[next]?.focus();
  };

  return (
    <div
      data-testid={testId}
      // Named group with the positional total so AT announces "Slide 3 of 5" (NAV-003).
      role="group"
      aria-label={tkFormat(locale.slidePosition, { page: cur + 1, total: count })}
      className={className}
      style={{ display: "flex", gap: 7, ...style }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <button
          type="button"
          key={index}
          ref={(el) => {
            btnRefs.current[index] = el;
          }}
          aria-current={index === cur ? "true" : undefined}
          tabIndex={index === tabbable ? 0 : -1}
          onKeyDown={(e) => onKeyDown(e, index)}
          onClick={() => setCur(index)}
          aria-label={tkFormat(locale.page, { page: index + 1 })}
          style={{
            width: index === cur ? 24 : 8,
            height: 8,
            flexShrink: 0,
            borderRadius: 4,
            border: "none",
            padding: 0,
            cursor: "pointer",
            background: index === cur ? "var(--tk-accent)" : "var(--tk-text-3)",
            transition: "width var(--tk-t2) var(--tk-spring), background var(--tk-t2) var(--tk-ease)",
          }}
        />
      ))}
    </div>
  );
}

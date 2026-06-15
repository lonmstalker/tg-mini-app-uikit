import { useRef, type KeyboardEvent } from "react";
import { tkFormat, useTKLocale } from "../../foundation/i18n";
import { useControllable } from "../../internal/useControllable";
import { tkRovingNext, tkTabbableIndex } from "../../internal/roving";

export interface TKPageDotsProps {
  count: number;
  page?: number;
  defaultPage?: number;
  onChange?: (page: number) => void;
  testId?: string;
}

export function TKPageDots({ count, page, defaultPage = 0, onChange, testId }: TKPageDotsProps) {
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
    <div data-testid={testId} style={{ display: "flex", gap: 7 }}>
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

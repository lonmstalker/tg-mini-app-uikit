import { useRef, type KeyboardEvent } from "react";
import { TKCounter } from "../../atoms/display";
import { TKIcon, type TKIconName } from "../../atoms/icons";
import { useSafeArea, useOptionalHaptics } from "../../foundation/telegram";
import { useControllable } from "../../internal/useControllable";
import { tkRovingNext, tkTabbableIndex } from "../../internal/roving";

export interface TKTabItem {
  icon: TKIconName;
  label: string;
  count?: number;
}

export interface TKTabbarProps {
  tabs: TKTabItem[];
  value?: number;
  defaultValue?: number;
  onChange?: (index: number) => void;
  /** Extend the bar below the home indicator (`env(safe-area-inset-bottom)`). */
  safeArea?: boolean;
  testId?: string;
}

export function TKTabbar({ tabs, value, defaultValue = 0, onChange, safeArea, testId }: TKTabbarProps) {
  const [active, setActive] = useControllable(value, defaultValue, onChange);
  const haptics = useOptionalHaptics();
  const { inset, contentInset } = useSafeArea();
  const safeBottom = inset.bottom + contentInset.bottom;
  // Roving tabindex: only the active tab is in the tab order; arrows move focus
  // between tabs and switch (selection follows focus, matching a tap).
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabbable = tkTabbableIndex(active, tabs.length);
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = tkRovingNext(e.key, index, tabs.length, undefined, "horizontal");
    if (next == null) return;
    e.preventDefault();
    haptics.selection();
    setActive(next);
    btnRefs.current[next]?.focus();
  };

  return (
    <div
      data-testid={testId}
      role="navigation"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${tabs.length}, 1fr)`,
        background: "var(--tk-glass)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderTop: "0.5px solid var(--tk-sep)",
        minHeight: "var(--tk-tabbar-h, auto)",
        padding: "8px 0 10px",
        paddingBottom: safeArea ? `calc(max(var(--tk-safe-bottom), ${safeBottom}px) + 10px)` : 10,
      }}
    >
      {tabs.map((tab, index) => {
        const on = index === active;
        return (
          <button
            type="button"
            key={tab.label}
            ref={(el) => {
              btnRefs.current[index] = el;
            }}
            aria-current={on ? "page" : undefined}
            tabIndex={index === tabbable ? 0 : -1}
            onKeyDown={(e) => onKeyDown(e, index)}
            onClick={() => {
              haptics.selection();
              setActive(index);
            }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              border: "none",
              background: "transparent",
              fontFamily: "inherit",
              cursor: "pointer",
              color: on ? "var(--tk-accent)" : "var(--tk-text-2)",
              transition: "color var(--tk-t2) var(--tk-ease)",
              padding: 0,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 46,
                height: 30,
                borderRadius: "var(--tk-r-pill)",
                background: on ? "var(--tk-accent-12)" : "transparent",
                transform: on ? "translateY(-1px)" : "none",
                transition: "background var(--tk-t2) var(--tk-ease), transform var(--tk-t2) var(--tk-spring)",
                position: "relative",
              }}
            >
              <TKIcon name={tab.icon} size={22} strokeWidth={on ? 2.2 : 2} />
              {tab.count != null ? (
                <span style={{ position: "absolute", top: -3, right: 2 }}>
                  <TKCounter value={tab.count} />
                </span>
              ) : null}
            </span>
            <span style={{ fontSize: "var(--tk-fz-caption2)", fontWeight: on ? 600 : 500 }}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

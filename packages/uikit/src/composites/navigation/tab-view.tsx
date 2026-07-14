import { useDeferredValue, type CSSProperties, type ReactNode, type RefObject } from "react";
import { useKeyboard } from "../../foundation/telegram";
import { useControllable } from "../../internal/useControllable";
import { TKTabbar, type TKTabItem } from "./tabbar";

export interface TKTabViewProps {
  tabs: TKTabItem[];
  /** One panel per tab, kept mounted (inactive panels hidden, not unmounted, so their scroll + state survive a tab switch). */
  panels: ReactNode[];
  /** Active tab index (controlled). Omit for an uncontrolled shell (NAV-005). */
  value?: number;
  /** Initial tab index when uncontrolled (default 0). */
  defaultValue?: number;
  onChange?: (index: number) => void;
  /** Hide the tabbar (e.g. on a deep nav screen). It is also auto-hidden while the keyboard is up. */
  hideTabbar?: boolean;
  /** Extend the bar below the home indicator. */
  safeArea?: boolean;
  /** Accessible name for the tabbar's navigation landmark (NAV-001); defaults to `locale.tabs`. */
  ariaLabel?: string;
  /** testId for the tabbar. */
  testId?: string;
  /** Derive a testId for each keep-mounted panel wrapper. */
  panelTestId?: (index: number) => string;
  /** Forwarded to the content / tabbar wrappers (e.g. for coach-mark anchoring). */
  contentRef?: RefObject<HTMLDivElement | null>;
  tabbarRef?: RefObject<HTMLDivElement | null>;
}

/**
 * A bottom-tab shell: keep-mounted tab panels above a `TKTabbar`. Inactive
 * panels stay mounted (hidden with `display:none`) so switching tabs preserves
 * each tab's scroll and in-progress state. The tabbar hides on a deep screen
 * (`hideTabbar`) and whenever the keyboard is open, so it never overlaps an
 * input or a pushed detail.
 */
export function TKTabView({
  tabs,
  panels,
  value,
  defaultValue = 0,
  onChange,
  hideTabbar,
  safeArea,
  ariaLabel,
  testId,
  panelTestId,
  contentRef,
  tabbarRef,
}: TKTabViewProps) {
  const keyboard = useKeyboard();
  // Self-manage the active index when uncontrolled, like every sibling (NAV-005).
  // TabView owns the source of truth; the tabbar below is driven from it.
  const [active, setActive] = useControllable(value, defaultValue, onChange);
  // The tabbar highlight moves IMMEDIATELY; the (potentially heavy) panel flip
  // rides a deferred render, so the pill never freezes waiting for it.
  const shownPanel = useDeferredValue(active);
  const tabbarVisible = !hideTabbar && !keyboard.visible;
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div ref={contentRef} style={{ position: "relative", flex: 1, minHeight: 0 }}>
        {panels.map((panel, index) => (
          <div
            key={index}
            data-testid={panelTestId?.(index)}
            aria-hidden={index === shownPanel ? undefined : true}
            {...(index === shownPanel ? null : { inert: true })}
            style={
              {
                position: "absolute",
                inset: 0,
                // Hidden panels keep their layout (visibility, not display:none,
                // so inner scroll positions survive a tab switch) while
                // content-visibility skips their paint/layout work entirely.
                visibility: index === shownPanel ? "visible" : "hidden",
                contentVisibility: index === shownPanel ? undefined : "hidden",
                // The incoming panel fades in briefly — a display-flip used to
                // teleport it. (Restarts because the property flips none→value.)
                animation: index === shownPanel ? "tk-fade-in var(--tk-t1) var(--tk-ease)" : "none",
              } as CSSProperties
            }
          >
            {panel}
          </div>
        ))}
      </div>
      <div ref={tabbarRef} style={{ display: tabbarVisible ? "block" : "none" }} aria-hidden={tabbarVisible ? undefined : true}>
        <TKTabbar testId={testId} tabs={tabs} value={active} onChange={setActive} safeArea={safeArea} ariaLabel={ariaLabel} />
      </div>
    </div>
  );
}

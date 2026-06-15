import { type ReactNode, type RefObject } from "react";
import { useKeyboard } from "../../foundation/telegram";
import { TKTabbar, type TKTabItem } from "./tabbar";

export interface TKTabViewProps {
  tabs: TKTabItem[];
  /** One panel per tab, kept mounted (inactive panels hidden, not unmounted, so their scroll + state survive a tab switch). */
  panels: ReactNode[];
  value: number;
  onChange: (index: number) => void;
  /** Hide the tabbar (e.g. on a deep nav screen). It is also auto-hidden while the keyboard is up. */
  hideTabbar?: boolean;
  /** Extend the bar below the home indicator. */
  safeArea?: boolean;
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
  onChange,
  hideTabbar,
  safeArea,
  testId,
  panelTestId,
  contentRef,
  tabbarRef,
}: TKTabViewProps) {
  const keyboard = useKeyboard();
  const tabbarVisible = !hideTabbar && !keyboard.visible;
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div ref={contentRef} style={{ position: "relative", flex: 1, minHeight: 0 }}>
        {panels.map((panel, index) => (
          <div
            key={index}
            data-testid={panelTestId?.(index)}
            aria-hidden={index === value ? undefined : true}
            style={{ position: "absolute", inset: 0, display: index === value ? "block" : "none" }}
          >
            {panel}
          </div>
        ))}
      </div>
      <div ref={tabbarRef} style={{ display: tabbarVisible ? "block" : "none" }} aria-hidden={tabbarVisible ? undefined : true}>
        <TKTabbar testId={testId} tabs={tabs} value={value} onChange={onChange} safeArea={safeArea} />
      </div>
    </div>
  );
}

import { useRef, type KeyboardEvent } from "react";

/**
 * Roving-tabindex keyboard helper (WAI-ARIA radio/toolbar/tabs patterns).
 * Returns the index the arrow/Home/End key should move to, or null when the
 * key is not a navigation key. Wraps around and skips disabled items.
 */
export function tkRovingNext(
  key: string,
  current: number,
  count: number,
  isDisabled: (index: number) => boolean = () => false,
  orientation: "horizontal" | "vertical" | "both" = "both",
): number | null {
  const horizontal = orientation !== "vertical";
  const vertical = orientation !== "horizontal";
  let dir: 1 | -1 | 0 = 0;
  let edge: "home" | "end" | null = null;

  if ((key === "ArrowRight" && horizontal) || (key === "ArrowDown" && vertical)) dir = 1;
  else if ((key === "ArrowLeft" && horizontal) || (key === "ArrowUp" && vertical)) dir = -1;
  else if (key === "Home") edge = "home";
  else if (key === "End") edge = "end";
  else return null;

  if (count <= 0) return null;

  if (edge) {
    const range = edge === "home" ? [...Array(count).keys()] : [...Array(count).keys()].reverse();
    for (const i of range) if (!isDisabled(i)) return i;
    return null;
  }

  let i = current;
  for (let step = 0; step < count; step++) {
    i = (i + dir + count) % count;
    if (!isDisabled(i)) return i;
  }
  return null;
}

/** Index that owns tabIndex=0: the selected enabled item, else the first enabled. */
export function tkTabbableIndex(selectedIndex: number, count: number, isDisabled: (index: number) => boolean = () => false): number {
  if (selectedIndex >= 0 && selectedIndex < count && !isDisabled(selectedIndex)) return selectedIndex;
  for (let i = 0; i < count; i++) if (!isDisabled(i)) return i;
  return 0;
}

export interface TKRovingFocusOptions {
  count: number;
  /** Index that owns the single tab stop (usually the selected one). */
  selectedIndex?: number;
  orientation?: "horizontal" | "vertical" | "both";
  isDisabled?: (index: number) => boolean;
  /** Called with the new index when an arrow/Home/End moves focus. Wire it to
   *  selection for an auto-select group, or ignore it for focus-only roving. */
  onNavigate?: (index: number) => void;
}

export interface TKRovingItemProps {
  ref: (el: HTMLElement | null) => void;
  tabIndex: number;
  onKeyDown: (e: KeyboardEvent) => void;
}

/**
 * Stateful roving-tabindex wrapper over {@link tkRovingNext}/{@link tkTabbableIndex}
 * (INT-DX-003). Owns the item ref list and returns `getItemProps(i)` so the
 * keyboard contract (arrow/Home/End, wrap, skip-disabled, preventDefault, move
 * focus) is handled once and identically across every roving group (CC-04).
 */
export function useRovingFocus(options: TKRovingFocusOptions): {
  getItemProps: (index: number) => TKRovingItemProps;
  focusIndex: (index: number) => void;
} {
  const { count, selectedIndex = 0, orientation = "both", isDisabled, onNavigate } = options;
  const refs = useRef<Array<HTMLElement | null>>([]);
  const disabled = (i: number) => isDisabled?.(i) ?? false;
  const tabbable = tkTabbableIndex(selectedIndex, count, disabled);
  const focusIndex = (i: number) => refs.current[i]?.focus();
  return {
    focusIndex,
    getItemProps: (index) => ({
      ref: (el) => {
        refs.current[index] = el;
      },
      tabIndex: index === tabbable ? 0 : -1,
      onKeyDown: (e) => {
        const next = tkRovingNext(e.key, index, count, disabled, orientation);
        if (next == null) return;
        e.preventDefault();
        refs.current[next]?.focus();
        onNavigate?.(next);
      },
    }),
  };
}

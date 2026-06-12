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

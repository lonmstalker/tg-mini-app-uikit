import { type ReactNode } from "react";
import { TKHeader, useHasNativeChrome, useNav } from "tg-mini-app-uikit";

/**
 * In-DOM back header for nested screens when there is no native Telegram Back
 * button (browser / mock). On a real client `useHasNativeChrome()` is true and
 * the native Back button (driven by the nav stack) handles it, so we render
 * nothing. `back="auto"` derives the control + pop from the enclosing stack.
 */
export function useMockBackHeader(title?: ReactNode): ReactNode | undefined {
  const native = useHasNativeChrome();
  const nav = useNav();
  if (native || nav.depth <= 1) return undefined;
  return <TKHeader title={title} back="auto" testId="mock-back" />;
}

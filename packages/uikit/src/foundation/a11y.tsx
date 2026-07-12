import type { CSSProperties, ReactElement } from "react";
import { useTKLocale } from "./i18n";

/*
 * Shared a11y live-region primitive (BTN-DX-008 / CC-05). One owned, visually
 * hidden region announces loading / done / error to assistive tech, so each
 * consumer (AsyncBoundary, InfiniteList, PullToRefresh, PIN, busy buttons) stops
 * being silent without re-rolling its own region.
 */

export type TKBusyState = "idle" | "loading" | "done" | "error";

export interface TKBusyAnnounceOptions {
  /** Override the announced loading text (default `locale.loading`). */
  loadingText?: string;
  /** Override the announced done text (default `locale.done`). */
  doneText?: string;
  /** Override the announced error text (default `locale.error`). */
  errorText?: string;
}

const SR_ONLY: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

/**
 * Returns a visually hidden live region reflecting `state`. Render it anywhere
 * inside the busy component: loading/done go to a `polite` `role="status"`,
 * errors to an assertive `role="alert"`. An empty override string suppresses
 * that announcement.
 */
export function useTKBusyAnnounce(state: TKBusyState, options: TKBusyAnnounceOptions = {}): ReactElement {
  const locale = useTKLocale();
  const polite =
    state === "loading"
      ? (options.loadingText ?? locale.loading)
      : state === "done"
        ? (options.doneText ?? locale.done)
        : "";
  const assertive = state === "error" ? (options.errorText ?? locale.error) : "";
  return (
    <>
      <span role="status" aria-live="polite" style={SR_ONLY}>
        {polite}
      </span>
      {assertive ? (
        <span role="alert" style={SR_ONLY}>
          {assertive}
        </span>
      ) : null}
    </>
  );
}

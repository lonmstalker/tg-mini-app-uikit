import { type ReactNode } from "react";
import { type TKIconName } from "../../atoms/icons";
import { TKEmptyState } from "./empty-state";
import { TKSkeletonList } from "./skeletons";

/* ---------------- Async boundary ---------------- */

/*
 * Presentational rendering of the non-ready states of an async read. Purely
 * UI — it takes plain flags, NOT a state object — so it stays decoupled from
 * any data layer (e.g. @tg-mini-app/async). Wire `useAsync`/`useTKInfiniteData`
 * results into the flags at the call site. Default copy is English; pass the
 * `*Title`/`*Text`/`*Label` props to localize.
 */

export type TKAsyncStatus = "loading" | "error" | "empty";

export interface TKAsyncStateProps {
  status: TKAsyncStatus;
  /** Shown while loading (default: a skeleton list). */
  loader?: ReactNode;
  onRetry?: () => void;
  errorTitle?: ReactNode;
  errorText?: ReactNode;
  retryLabel?: ReactNode;
  emptyIcon?: TKIconName;
  emptyTitle?: ReactNode;
  emptyText?: ReactNode;
  emptyCta?: ReactNode;
  onEmptyCta?: () => void;
  testId?: string;
}

/** Renders exactly one of the loading / error / empty states. */
export function TKAsyncState({
  status,
  loader,
  onRetry,
  errorTitle = "Something went wrong",
  errorText = "Please try again.",
  retryLabel = "Retry",
  emptyIcon = "search",
  emptyTitle = "Nothing here yet",
  emptyText,
  emptyCta,
  onEmptyCta,
  testId,
}: TKAsyncStateProps) {
  if (status === "loading") return <>{loader ?? <TKSkeletonList rows={4} testId={testId} />}</>;
  if (status === "error") {
    return (
      <TKEmptyState
        testId={testId}
        icon="warning"
        tone="red"
        title={errorTitle}
        text={errorText}
        cta={onRetry ? retryLabel : undefined}
        onCta={onRetry}
      />
    );
  }
  return (
    <TKEmptyState testId={testId} icon={emptyIcon} title={emptyTitle} text={emptyText} cta={emptyCta} onCta={onEmptyCta} />
  );
}

export interface AsyncBoundaryProps extends Omit<TKAsyncStateProps, "status"> {
  loading?: boolean;
  error?: boolean;
  /** Render the empty state instead of children (e.g. a loaded-but-empty list). */
  empty?: boolean;
  children?: ReactNode;
}

/**
 * Picks the loading / error / empty state (in that order) or renders `children`
 * when the data is ready. One place for the per-screen "loading → skeleton,
 * error → retry, empty → message" branch the demo screens repeated by hand.
 */
export function AsyncBoundary({ loading, error, empty, children, ...state }: AsyncBoundaryProps) {
  if (loading) return <TKAsyncState status="loading" {...state} />;
  if (error) return <TKAsyncState status="error" {...state} />;
  if (empty) return <TKAsyncState status="empty" {...state} />;
  return <>{children}</>;
}

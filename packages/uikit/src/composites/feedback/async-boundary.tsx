import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { type TKIconProp } from "../../atoms/icons";
import { TKVisuallyHidden } from "../../atoms/service";
import { useTKLocale } from "../../foundation/i18n";
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
  /** SR announcement while loading (default `locale.loading`). */
  loadingLabel?: ReactNode;
  onRetry?: () => void;
  errorTitle?: ReactNode;
  errorText?: ReactNode;
  retryLabel?: ReactNode;
  /** Built-in icon name, or a custom element for the empty illustration (REU-004). */
  emptyIcon?: TKIconProp;
  emptyTitle?: ReactNode;
  emptyText?: ReactNode;
  emptyCta?: ReactNode;
  onEmptyCta?: () => void;
  testId?: string;
  className?: string;
  /** Merged onto the rendered state root LAST — consumer values win (REU-007). */
  style?: CSSProperties;
}

/** Renders exactly one of the loading / error / empty states. */
export function TKAsyncState({
  status,
  loader,
  loadingLabel,
  onRetry,
  errorTitle,
  errorText,
  retryLabel,
  emptyIcon = "search",
  emptyTitle,
  emptyText,
  emptyCta,
  onEmptyCta,
  testId,
  className,
  style,
}: TKAsyncStateProps) {
  const locale = useTKLocale();
  // Default copy follows the app locale (FBK-005) — props still override per call.
  const resolvedErrorTitle = errorTitle ?? locale.asyncErrorTitle;
  const resolvedErrorText = errorText ?? locale.asyncErrorText;
  const resolvedRetry = retryLabel ?? locale.asyncRetry;
  const resolvedEmptyTitle = emptyTitle ?? locale.asyncEmptyTitle;
  if (status === "loading") {
    // Announce loading to AT and hide the decorative skeleton (FBK-001 / CC-05).
    return (
      <div role="status" aria-live="polite" aria-busy="true" data-testid={testId} className={className} style={style}>
        <TKVisuallyHidden>{loadingLabel ?? locale.loading}</TKVisuallyHidden>
        <div aria-hidden="true">{loader ?? <TKSkeletonList rows={4} />}</div>
      </div>
    );
  }
  if (status === "error") {
    return (
      <div role="alert" data-testid={testId} className={className} style={style}>
        <TKEmptyState
          icon="warning"
          tone="red"
          title={resolvedErrorTitle}
          text={resolvedErrorText}
          cta={onRetry ? resolvedRetry : undefined}
          onCta={onRetry}
        />
      </div>
    );
  }
  return (
    <TKEmptyState testId={testId} className={className} style={style} icon={emptyIcon} title={resolvedEmptyTitle} text={emptyText} cta={emptyCta} onCta={onEmptyCta} />
  );
}

export interface TKAsyncBoundaryProps extends Omit<TKAsyncStateProps, "status"> {
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
 *
 * The skeleton → content swap fades the ready children in (transform-free
 * WAAPI opacity, reduced-motion aware) instead of teleporting them. The ready
 * wrapper is `display: contents`, so children stay direct flex items of the
 * host column (gap intact) — the fade runs on each child element.
 */
export function TKAsyncBoundary({ loading, error, empty, children, className, style, ...state }: TKAsyncBoundaryProps) {
  const ready = !loading && !error && !empty;
  const readyRef = useRef<HTMLDivElement>(null);
  const wasBlockedRef = useRef(false);
  useEffect(() => {
    if (!ready) {
      wasBlockedRef.current = true;
      return;
    }
    if (!wasBlockedRef.current) return; // ready from the first render — nothing to reveal
    wasBlockedRef.current = false;
    const host = readyRef.current;
    if (!host) return;
    if (typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (host.closest('.tk[data-tk-motion="off"]')) return;
    for (const child of Array.from(host.children)) {
      if (typeof (child as HTMLElement).animate === "function") {
        (child as HTMLElement).animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, easing: "ease-out" });
      }
    }
  }, [ready]);
  if (loading) return <TKAsyncState status="loading" className={className} style={style} {...state} />;
  if (error) return <TKAsyncState status="error" className={className} style={style} {...state} />;
  if (empty) return <TKAsyncState status="empty" className={className} style={style} {...state} />;
  return (
    <div ref={readyRef} data-testid={state.testId} className={className} style={{ display: "contents", ...style }}>
      {children}
    </div>
  );
}

/**
 * @deprecated Use {@link TKAsyncBoundary}. The un-prefixed name was the one
 * export that broke the `TK*` convention (A8); it stays as an alias so existing
 * imports keep working and will be dropped in the next major.
 */
export const AsyncBoundary = TKAsyncBoundary;
/** @deprecated Use {@link TKAsyncBoundaryProps}. */
export type AsyncBoundaryProps = TKAsyncBoundaryProps;

import { useEffect, useReducer, useState, type ReactNode, type RefObject } from "react";
import { TKButton } from "../atoms/buttons";
import { TKPopper } from "../composites/overlays";
import { useTKLocale } from "../foundation/i18n";
import { tkZ } from "../internal/dom";

export interface TKOnboardingStep {
  target: RefObject<HTMLElement | null>;
  title?: ReactNode;
  text?: ReactNode;
  placement?: "top" | "bottom";
}

/** Persistence adapter: plug `useCloudStorage()` here for cross-device "seen". */
export interface TKOnboardingStorage {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string) => Promise<unknown>;
}

export interface TKOnboardingTooltipProps {
  steps: TKOnboardingStep[];
  /** Marks the tour as seen under this key (requires `storage`). */
  storageKey?: string;
  storage?: TKOnboardingStorage;
  onFinish?: () => void;
  /** Fired when the tour is dismissed early (Skip button, scrim tap, Escape). Falls back to `onFinish` if unset (ONB-001). */
  onSkip?: () => void;
  /** Allow dismissing by tapping the scrim / pressing Escape (default true). Set false to force a deliberate Skip/Done (ONB-001). */
  dismissable?: boolean;
  /**
   * Trap focus inside the coach-mark (default true) — a modal walkthrough. Set
   * false when the step points at a control the user should interact with during
   * the tour: focus stays put, the bubble is still Escape/scrim-dismissable and
   * announced, but Tab can reach the highlighted target (ONB-002).
   */
  trapFocus?: boolean;
  nextLabel?: ReactNode;
  doneLabel?: ReactNode;
  skipLabel?: ReactNode;
  testId?: string;
}

/**
 * Coach-mark tour: spotlights the target through a scrim cutout and walks
 * the user across the steps. "Seen" persists through the storage adapter
 * so the tour shows once.
 */
export function TKOnboardingTooltip({
  steps,
  storageKey,
  storage,
  onFinish,
  onSkip,
  dismissable = true,
  trapFocus = true,
  nextLabel,
  doneLabel,
  skipLabel,
  testId,
}: TKOnboardingTooltipProps) {
  const locale = useTKLocale();
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<"checking" | "open" | "done">(storage && storageKey ? "checking" : "open");

  useEffect(() => {
    if (!storage || !storageKey) return;
    let alive = true;
    storage
      .get(storageKey)
      .then((seen) => {
        if (alive) setStatus(seen ? "done" : "open");
      })
      .catch(() => alive && setStatus("open"));
    return () => {
      alive = false;
    };
  }, [storage, storageKey]);

  // Scroll the target into view when the STEP changes only. `steps` is left out
  // of the deps on purpose: consumers pass it as an inline array, so keying on
  // its identity would re-run this on every parent render and yank the page back
  // to center, fighting the user's own scroll.
  useEffect(() => {
    if (status !== "open") return;
    steps[index]?.target.current?.scrollIntoView?.({ block: "center", behavior: "instant" as ScrollBehavior });
    // Refs are null during the first render; bump once after commit so the
    // anchored popper path is chosen over the no-target fallback when the target
    // actually resolves (and the fallback only shows for a genuinely null target).
    bumpRect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, status]);

  // The scrim cutout is measured from the target's viewport rect at render time,
  // so re-render on scroll/resize to keep the spotlight glued to the target —
  // otherwise the hole freezes while the TKPopper bubble (which has its own
  // reflow listeners) follows, and the two visibly desync.
  const [, bumpRect] = useReducer((n: number) => n + 1, 0);
  useEffect(() => {
    if (status !== "open") return;
    let pending = false;
    const onReflow = () => {
      if (pending) return;
      pending = true;
      const raf = typeof requestAnimationFrame === "function" ? requestAnimationFrame : (cb: FrameRequestCallback) => cb(0);
      raf(() => {
        pending = false;
        bumpRect();
      });
    };
    window.addEventListener("resize", onReflow, { passive: true });
    window.addEventListener("scroll", onReflow, { passive: true, capture: true });
    return () => {
      window.removeEventListener("resize", onReflow);
      window.removeEventListener("scroll", onReflow, true);
    };
  }, [status]);

  const persistSeen = () => {
    if (storage && storageKey) void storage.set(storageKey, "1").catch(() => {});
  };
  const finish = () => {
    setStatus("done");
    persistSeen();
    onFinish?.();
  };
  // Early dismiss (Skip button, scrim tap, Escape): persist seen and notify via
  // onSkip, falling back to onFinish so a gating flag still advances (ONB-001).
  const skip = () => {
    setStatus("done");
    persistSeen();
    (onSkip ?? onFinish)?.();
  };

  // Finish cleanly on an empty step set so a consumer's seen-flag still flips
  // (ONB-003). An out-of-range `index` needs NO state write: rendering clamps
  // through `safeIndex` and the Next button advances from it, so chaining a
  // corrective setIndex here only bought an extra render.
  useEffect(() => {
    if (status !== "open") return;
    if (steps.length === 0) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, steps.length]);

  const safeIndex = steps.length ? Math.min(index, steps.length - 1) : 0;
  const step = steps[safeIndex];
  if (status !== "open" || !step) return null;

  const rect = step.target.current?.getBoundingClientRect();
  const last = safeIndex === steps.length - 1;
  const ariaLabel = typeof step.title === "string" ? step.title : undefined;

  const bubble = (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 4, minWidth: 200 }}>
      {/* Step content as a polite live region so advancing a step is announced (ONB-002). */}
      <div role="status" aria-live="polite" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {step.title ? <div style={{ fontWeight: 700, fontSize: "var(--tk-fz-body)" }}>{step.title}</div> : null}
        {step.text ? (
          <div style={{ fontSize: "var(--tk-fz-sub)", color: "var(--tk-text-2)", lineHeight: 1.35 }}>{step.text}</div>
        ) : null}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 2 }}>
        <span style={{ fontSize: "var(--tk-fz-caption)", color: "var(--tk-text-3)" }}>
          {safeIndex + 1} / {steps.length}
        </span>
        <span style={{ display: "inline-flex", gap: 6 }}>
          {!last ? (
            <TKButton size="sm" variant="plain" onClick={skip}>
              {skipLabel ?? locale.skip}
            </TKButton>
          ) : null}
          <TKButton size="sm" onClick={() => (last ? finish() : setIndex(safeIndex + 1))}>
            {last ? (doneLabel ?? locale.done) : (nextLabel ?? locale.next)}
          </TKButton>
        </span>
      </div>
    </div>
  );

  return (
    <div>
      {rect ? (
        <>
          {/* Spotlight cutout only when the target is actually measured. */}
          <div
            style={{
              position: "fixed",
              zIndex: tkZ.popper,
              pointerEvents: "auto",
              boxShadow: "0 0 0 100vmax var(--tk-scrim)",
              left: rect.left - 6,
              top: rect.top - 6,
              width: rect.width + 12,
              height: rect.height + 12,
              borderRadius: "var(--tk-r-md)",
            }}
          />
          {/* trapFocus → role="dialog" (focus moves in, Tab trapped, focus restored
              on close). Otherwise role="tooltip": no focus steal so the highlighted
              target stays reachable; Escape/outside-tap still dismiss via onClose,
              and the bubble still announces via its live region (ONB-001/002). */}
          <TKPopper
            open
            anchorRef={step.target}
            placement={step.placement ?? "bottom"}
            arrow
            autoFlip
            role={trapFocus ? "dialog" : "tooltip"}
            ariaLabel={ariaLabel}
            onClose={dismissable ? skip : undefined}
            testId={testId}
          >
            {bubble}
          </TKPopper>
        </>
      ) : (
        // No measurable target: TKPopper needs an anchor, so it would render NOTHING
        // and strand the user with no Skip/Next. Fall back to a centered dialog card
        // over a transparent interceptor — no opaque blackout (ONB-004); a tap outside
        // the card dismisses it when dismissable (ONB-001). The interceptor is a
        // presentational scrim-like click-catcher: keyboard users dismiss via the
        // Skip/Done buttons inside the dialog, which run the same action.
        <div
          role="presentation"
          data-testid={testId}
          onClick={dismissable ? skip : undefined}
          style={{ position: "fixed", inset: 0, zIndex: tkZ.popper, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, pointerEvents: "auto" }}
        >
          <div
            role="dialog"
            aria-label={ariaLabel}
            onClick={(e) => e.stopPropagation()}
            style={{ background: "var(--tk-surface)", color: "var(--tk-text)", borderRadius: "var(--tk-r-lg)", boxShadow: "var(--tk-shadow-lg)", padding: 16, maxWidth: 320 }}
          >
            {bubble}
          </div>
        </div>
      )}
    </div>
  );
}

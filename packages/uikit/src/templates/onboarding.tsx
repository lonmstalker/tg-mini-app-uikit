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

  const finish = () => {
    setStatus("done");
    if (storage && storageKey) void storage.set(storageKey, "1").catch(() => {});
    onFinish?.();
  };

  const step = steps[index];
  if (status !== "open" || !step) return null;

  const rect = step.target.current?.getBoundingClientRect();
  const last = index === steps.length - 1;

  return (
    <div>
      <div
        style={
          rect
            ? {
                position: "fixed",
                zIndex: tkZ.popper,
                pointerEvents: "auto",
                boxShadow: "0 0 0 100vmax var(--tk-scrim)",
                left: rect.left - 6,
                top: rect.top - 6,
                width: rect.width + 12,
                height: rect.height + 12,
                borderRadius: "var(--tk-r-md)",
              }
            : { position: "fixed", inset: 0, zIndex: tkZ.popper, pointerEvents: "auto", background: "var(--tk-scrim)" }
        }
      />
      <TKPopper open anchorRef={step.target} placement={step.placement ?? "bottom"} arrow autoFlip testId={testId}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 4, minWidth: 200 }}>
          {step.title ? <div style={{ fontWeight: 700, fontSize: "var(--tk-fz-body)" }}>{step.title}</div> : null}
          {step.text ? (
            <div style={{ fontSize: "var(--tk-fz-sub)", color: "var(--tk-text-2)", lineHeight: 1.35 }}>{step.text}</div>
          ) : null}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 2 }}>
            <span style={{ fontSize: "var(--tk-fz-caption)", color: "var(--tk-text-3)" }}>
              {index + 1} / {steps.length}
            </span>
            <span style={{ display: "inline-flex", gap: 6 }}>
              {!last ? (
                <TKButton size="sm" variant="plain" onClick={finish}>
                  {skipLabel ?? locale.skip}
                </TKButton>
              ) : null}
              <TKButton size="sm" onClick={() => (last ? finish() : setIndex(index + 1))}>
                {last ? (doneLabel ?? locale.done) : (nextLabel ?? locale.next)}
              </TKButton>
            </span>
          </div>
        </div>
      </TKPopper>
    </div>
  );
}

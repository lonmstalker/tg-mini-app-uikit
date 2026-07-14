import { forwardRef, useState, type HTMLAttributes } from "react";
import { useControllable } from "../../internal/useControllable";
import { useTKLocale } from "../../foundation/i18n";
import { useReducedMotion } from "../../foundation/theme";

export interface TKSpoilerProps extends Omit<HTMLAttributes<HTMLSpanElement>, "onChange"> {
  revealed?: boolean;
  defaultRevealed?: boolean;
  onRevealChange?: (revealed: boolean) => void;
  /** Make reveal reversible: the spoiler stays a focusable toggle button and a
   *  second activation re-blurs it (emits both `true` and `false`) (DSP-004). */
  toggle?: boolean;
  /**
   * Withhold the children from the DOM until revealed (for PII/secrets). By
   * default `TKSpoiler` only blurs visually — the text still ships in the DOM and
   * is readable by screen readers, copy tools and scrapers before reveal (DSP-003).
   */
  secure?: boolean;
  testId?: string;
}

/**
 * Visual blur over content the reader taps to reveal. **Presentational only by
 * default — do NOT use it to hide secrets/PII**, as the blurred text is still
 * present in the DOM. For real concealment pass `secure`, which renders a masked
 * placeholder and keeps the children out of the DOM until revealed (DSP-003).
 */
export const TKSpoiler = /* @__PURE__ */ forwardRef<HTMLSpanElement, TKSpoilerProps>(function TKSpoiler(
  { children, revealed, defaultRevealed = false, onRevealChange, toggle, secure, className, style, testId, ...rest },
  ref,
) {
  const [open, setOpen] = useControllable(revealed, defaultRevealed, onRevealChange);
  const locale = useTKLocale();
  const reduced = useReducedMotion();
  const [focused, setFocused] = useState(false);
  // Interactive while collapsed (the reveal affordance) and, in `toggle` mode, while
  // open too (so it can re-blur). A consumer-supplied name wins.
  const interactive = !open || !!toggle;
  const restLabel = rest["aria-label"];
  const flip = () => setOpen(toggle ? !open : true);
  return (
    <span
      ref={ref}
      className={className}
      data-testid={testId}
      {...rest}
      role={interactive ? "button" : undefined}
      aria-label={interactive ? (restLabel ?? locale.revealSpoiler) : restLabel}
      aria-pressed={toggle ? open : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={() => interactive && flip()}
      onKeyDown={(e) => {
        if (interactive && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          flip();
        }
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        display: "inline",
        cursor: interactive ? "pointer" : "inherit",
        borderRadius: "var(--tk-r-xs)",
        // Self-sufficient focus ring + reduced-motion: works even outside the `.tk`
        // scope (no dependency on the layer's :focus-visible rule or motion tokens) (DSP-005).
        outline: focused && interactive ? "3.5px solid var(--tk-accent-20, rgba(10,132,255,.28))" : undefined,
        ...style,
      }}
    >
      <span
        aria-hidden={open ? undefined : "true"}
        style={{
          // The blur is STATIC per state and the reveal flips it in one jump —
          // interpolating `filter` re-rendered the blur at every step of the
          // transition (the most expensive possible reveal). An absolute
          // blurred overlay can't work here: inline content fragments across
          // line boxes. The paint is the crossfading `opacity` below.
          filter: open ? "none" : "blur(6px)",
          background: open ? "transparent" : "var(--tk-surface-3)",
          borderRadius: "var(--tk-r-xs)",
          opacity: open ? 1 : 0.92,
          transition: reduced ? "none" : "opacity var(--tk-t2) var(--tk-ease)",
          userSelect: open ? undefined : "none",
          WebkitUserSelect: open ? undefined : "none",
        }}
      >
        {secure && !open ? "••••••••" : children}
      </span>
    </span>
  );
});

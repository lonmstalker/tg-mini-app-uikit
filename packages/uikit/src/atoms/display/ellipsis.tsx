import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { useTKLocale } from "../../foundation/i18n";
import { tkAnimateHeight } from "../../internal/useCollapse";
import { useIsomorphicLayoutEffect } from "../../internal/useIsomorphicLayoutEffect";
import { useControllable } from "../../internal/useControllable";

export interface TKEllipsisProps extends Omit<HTMLAttributes<HTMLDivElement>, "onToggle"> {
  /** Visible line count while collapsed. */
  lines?: number;
  /** Expand action label (default: locale `showMore`). */
  expandLabel?: ReactNode;
  /** Collapse action label (default: locale `showLess`). */
  collapseLabel?: ReactNode;
  /** Controlled expanded state; omit it to let the component own the flag. */
  expanded?: boolean;
  defaultExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  /** Allow collapsing back after expanding. Default one-way, like Telegram's "more". */
  collapsible?: boolean;
  testId?: string;
}

/**
 * Multi-line text clamp with a "show more" affordance, like "Read more" under
 * long Telegram channel posts. The clamp is pure CSS (`-webkit-line-clamp`), so
 * the first render is already collapsed — SSR-safe, no layout shift. The toggle
 * button appears only when the text actually overflows the clamp. The clamp is
 * visual only: AT reads the full text in the collapsed state.
 */
export const TKEllipsis = /* @__PURE__ */ forwardRef<HTMLDivElement, TKEllipsisProps>(function TKEllipsis(
  {
    lines = 3,
    children,
    expandLabel,
    collapseLabel,
    expanded: expandedProp,
    defaultExpanded = false,
    onToggle,
    collapsible,
    className,
    style,
    testId,
    ...rest
  },
  ref,
) {
  const locale = useTKLocale();
  const textRef = useRef<HTMLDivElement>(null);
  // Controlled/uncontrolled through the shared helper so a mid-life authority
  // switch dev-warns instead of silently dropping the flag (A6 / INT-004).
  const [expanded, setExpanded] = useControllable({
    value: expandedProp,
    defaultValue: defaultExpanded,
    onChange: onToggle,
    name: "TKEllipsis.expanded",
  });
  // Rendered clamp lags `expanded` on collapse: the clamp re-applies only after
  // the shrink animation, so the text folds up instead of snapping to "…" first.
  // Seeded from the CONTROLLED prop too: `expanded={true}` on the first render
  // must paint (and SSR) unclamped, not clamp until an effect catches up.
  const [clamped, setClamped] = useState(!(expandedProp ?? defaultExpanded));
  const [overflowing, setOverflowing] = useState(false);
  const pendingFrom = useRef<number | null>(null);
  const animRef = useRef<Animation | null>(null);

  // Overflow is measurable only while clamped; while expanded the button keeps
  // its last known state (collapsing later re-measures).
  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    const check = () => {
      if (el.scrollHeight > el.clientHeight) setOverflowing(true);
      else if (clamped) setOverflowing(false);
    };
    check();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [lines, clamped, children]);

  // Expand path: the clamp is already off in this render — tween from the
  // captured clamped height to the new natural height.
  useIsomorphicLayoutEffect(() => {
    const el = textRef.current;
    const from = pendingFrom.current;
    pendingFrom.current = null;
    if (from == null || !el || !expanded) return;
    animRef.current?.cancel();
    animRef.current = tkAnimateHeight(el, from, el.clientHeight);
  }, [expanded]);

  // Release the collapse pin (set in the finish handler below) only after the
  // clamp is back in the DOM — the layout effect runs pre-paint, so no frame
  // ever shows the unclamped text.
  useIsomorphicLayoutEffect(() => {
    const el = textRef.current;
    if (clamped && el) el.style.height = "";
  }, [clamped]);

  // A WAAPI tween outlives its detached element: cancel any in-flight one on
  // unmount so its "finish" handler (below) never pins styles or setClamped
  // against a dead component. Cancel never fires "finish", so this is enough.
  useEffect(() => () => animRef.current?.cancel(), []);

  const flip = () => {
    const el = textRef.current;
    const next = !expanded;
    animRef.current?.cancel();
    if (next) {
      // FLIP "first": the clamped height, read before the clamp comes off.
      pendingFrom.current = el?.clientHeight ?? null;
      setExpanded(true);
      setClamped(false);
    } else {
      setExpanded(false);
      // Measure the clamp target by applying the clamp inline for one read —
      // one forced layout on a tap, off the hot path.
      let anim: Animation | null = null;
      if (el) {
        const from = el.clientHeight;
        const s = el.style;
        s.display = "-webkit-box";
        s.webkitBoxOrient = "vertical";
        s.webkitLineClamp = String(lines);
        s.overflow = "hidden";
        const to = el.clientHeight;
        s.display = "";
        s.webkitBoxOrient = "";
        s.webkitLineClamp = "";
        s.overflow = "";
        anim = tkAnimateHeight(el, from, to);
        animRef.current = anim;
        if (anim) {
          anim.addEventListener(
            "finish",
            () => {
              // The tween has no fill: on finish the box would snap back to the
              // full text height for one painted frame before React commits the
              // clamp. Pin the collapsed geometry inline; the [clamped] layout
              // effect below releases it in the same commit that re-clamps.
              s.height = `${to}px`;
              s.overflow = "hidden";
              setClamped(true);
            },
            // Fires at most once; a superseded or unmounted tween is cancelled
            // (flip/effect/unmount above), and cancel never fires "finish".
            { once: true },
          );
        }
      }
      if (!anim) setClamped(true);
    }
  };

  // Controlled mode: the parent can flip `expanded` without going through the
  // button, so keep the rendered clamp in step with it (the animated collapse
  // path above owns the transition when the flip starts here).
  useEffect(() => {
    if (expandedProp === undefined) return;
    setClamped(!expandedProp);
  }, [expandedProp]);

  const clampStyle: CSSProperties = clamped
    ? {
        display: "-webkit-box",
        WebkitBoxOrient: "vertical",
        WebkitLineClamp: lines,
        overflow: "hidden",
      }
    : {};

  const showButton = overflowing && (collapsible || !expanded);
  return (
    <div ref={ref} className={className} data-testid={testId} {...rest} style={style}>
      <div ref={textRef} style={clampStyle}>
        {children}
      </div>
      {showButton ? (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={flip}
          style={{
            appearance: "none",
            border: "none",
            background: "none",
            padding: 0,
            marginTop: "var(--tk-sp-1)",
            font: "inherit",
            fontSize: "var(--tk-fz-sub)",
            fontWeight: 600,
            color: "var(--tk-accent-ink)",
            cursor: "pointer",
            borderRadius: "var(--tk-r-xs)",
          }}
        >
          {expanded ? (collapseLabel ?? locale.showLess) : (expandLabel ?? locale.showMore)}
        </button>
      ) : null}
    </div>
  );
});

import { forwardRef, useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { useTKLocale } from "../../foundation/i18n";
import { mergeRefs } from "../../internal/dom";
import { useLatest } from "../../internal/useLatest";
import { tkAnimateHeight } from "../../internal/useCollapse";
import { TKIcon, tkRenderIcon, type TKIconProp } from "../../atoms/icons";

export type TKNoticeBarTone = "accent" | "green" | "orange" | "red";

const TONES: Record<TKNoticeBarTone, [bg: string, ink: string, solid: string]> = {
  accent: ["var(--tk-accent-12)", "var(--tk-accent-ink)", "var(--tk-accent)"],
  green: ["var(--tk-green-12)", "var(--tk-green-ink)", "var(--tk-green)"],
  orange: ["var(--tk-orange-12)", "var(--tk-orange-ink)", "var(--tk-orange)"],
  red: ["var(--tk-red-12)", "var(--tk-red-ink)", "var(--tk-red)"],
};

const COPY_STYLE = { whiteSpace: "nowrap", paddingRight: "var(--tk-sp-7)" } as const;

export interface TKNoticeBarProps extends HTMLAttributes<HTMLDivElement> {
  tone?: TKNoticeBarTone;
  /** Built-in icon name, or a custom element for glyphs outside the set (REU-004);
   *  rendered decorative (hidden from AT). */
  icon?: TKIconProp;
  /** Trailing action (link/button); receives its own hit area, never marquees. */
  action?: ReactNode;
  /** Show a close button. Visibility stays with the consumer: the bar collapses
   *  its height, then calls `onClose` — unmount it there. */
  closable?: boolean;
  onClose?: () => void;
  /** Scroll overflowing text as a ticker instead of wrapping. Runs only when the
   *  text really overflows and motion is allowed; AT always gets a static copy. */
  marquee?: boolean;
  testId?: string;
}

/**
 * Single-line announcement strip (feature notice, promo, degraded-mode warning) —
 * like the pinned notice rows in Telegram clients. Enters with a soft rise;
 * closing collapses the measured height (WAAPI) so content below slides up
 * instead of jumping, then hands control back through `onClose`.
 */
export const TKNoticeBar = /* @__PURE__ */ forwardRef<HTMLDivElement, TKNoticeBarProps>(function TKNoticeBar(
  { tone = "accent", icon, action, closable, onClose, marquee, children, className, style, testId, ...rest },
  ref,
) {
  const locale = useTKLocale();
  const [bg, ink, solid] = TONES[tone] ?? TONES.accent;
  const rootRef = useRef<HTMLDivElement>(null);
  const clipRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const closingRef = useRef(false);
  const onCloseRef = useLatest(onClose);
  // The in-flight collapse animation; cancelled on unmount so its "finish"
  // listener can't fire a stale onClose after the bar is already gone.
  const closeAnimRef = useRef<Animation | null>(null);
  useEffect(() => () => closeAnimRef.current?.cancel(), []);
  // 0 = no ticker; otherwise the measured copy width in px (drives duration).
  const [tickerWidth, setTickerWidth] = useState(0);
  const ticking = !!marquee && tickerWidth > 0;

  useEffect(() => {
    const clip = clipRef.current;
    const text = textRef.current;
    if (!marquee || !clip || !text) {
      setTickerWidth(0);
      return;
    }
    const check = () => setTickerWidth(text.offsetWidth > clip.clientWidth ? text.offsetWidth : 0);
    check();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(check);
    ro.observe(clip);
    // The copy too: its width lands late (font load, first style flush) without
    // resizing the clip, and that's exactly when the ticker must re-evaluate.
    ro.observe(text);
    return () => ro.disconnect();
    // `ticking` swaps which node textRef points at — re-observe the live one.
  }, [marquee, children, ticking]);

  const close = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    const el = rootRef.current;
    const anim = el ? tkAnimateHeight(el, el.offsetHeight, 0) : null;
    if (anim) {
      closeAnimRef.current = anim;
      anim.addEventListener("finish", () => onCloseRef.current?.(), { once: true });
    } else onCloseRef.current?.();
  };

  // ~35 px/s, never faster than 8s per loop — long strings scroll calmly.
  const tickerDur = `${Math.max(8, Math.round(tickerWidth / 35))}s`;
  return (
    <div
      ref={mergeRefs(rootRef, ref)}
      role="status"
      className={className}
      data-testid={testId}
      {...rest}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--tk-sp-2)",
        padding: "10px 12px",
        borderRadius: "var(--tk-r-sm)",
        background: bg,
        color: ink,
        fontSize: "var(--tk-fz-sub)",
        fontWeight: 500,
        animation: "tk-rise var(--tk-t2) var(--tk-ease) both",
        ...style,
      }}
    >
      {icon ? (
        <span aria-hidden="true" style={{ display: "inline-flex", flexShrink: 0, color: solid }}>
          {tkRenderIcon(icon, { size: 17 })}
        </span>
      ) : null}
      <div ref={clipRef} style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
        {ticking ? (
          <>
            <span className="tk-sr-only">{children}</span>
            <div
              aria-hidden="true"
              className="tk-marquee-track"
              style={{ display: "flex", width: "max-content", "--tk-marquee-dur": tickerDur } as React.CSSProperties}
            >
              <span ref={textRef} style={COPY_STYLE}>
                {children}
              </span>
              <span style={COPY_STYLE}>{children}</span>
            </div>
          </>
        ) : (
          // With `marquee` the resting state is single-line + ellipsis; the inline
          // span still lays out to its full text width under the clip, so
          // `textRef.offsetWidth` measures the real overflow.
          <div style={marquee ? { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } : undefined}>
            <span ref={textRef}>{children}</span>
          </div>
        )}
      </div>
      {action ? <span style={{ flexShrink: 0 }}>{action}</span> : null}
      {closable ? (
        <button
          type="button"
          aria-label={locale.close}
          onClick={close}
          style={{
            appearance: "none",
            border: "none",
            background: "none",
            padding: 2,
            margin: -2,
            display: "inline-flex",
            flexShrink: 0,
            color: "inherit",
            cursor: "pointer",
            borderRadius: "var(--tk-r-xs)",
          }}
        >
          <TKIcon name="close" size={16} />
        </button>
      ) : null}
    </div>
  );
});

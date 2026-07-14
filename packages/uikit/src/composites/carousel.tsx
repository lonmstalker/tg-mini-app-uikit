import {
  Children,
  forwardRef,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ForwardedRef,
  type HTMLAttributes,
  type Key,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { useControllable } from "../internal/useControllable";
import { tkFormat, useTKLocale } from "../foundation/i18n";
import { useOptionalHaptics } from "../foundation/telegram";
import { TKPageDots } from "./navigation";
import { TKImageViewer, type TKImageViewerImage } from "./overlays/image-viewer";

export interface TKGalleryProps<T = unknown> extends HTMLAttributes<HTMLDivElement> {
  /** Data-driven slides (alternative to `children`); `renderItem` maps each (CRS-DX-006). */
  items?: T[];
  /** Renders a slide from a data item. Required when `items` is given. */
  renderItem?: (item: T, index: number) => ReactNode;
  /** Stable, UNIQUE key per data item — fixes reorder/removal remount on the data path (CRS-008). */
  getKey?: (item: T, index: number) => Key;
  /** Active slide index (controlled). Drives scroll position when set (CRS-002). */
  page?: number;
  /** Initial slide index when uncontrolled (default 0). */
  defaultPage?: number;
  /** Page change callback. */
  onPageChange?: (page: number) => void;
  /** Show the page dots under the track (default true). */
  dots?: boolean;
  /** Gap between slides, px. */
  gap?: number;
  /**
   * Keeps a side inset so horizontal swipes start away from the screen edges
   * (iOS Telegram reserves edge swipes for its own navigation), px.
   */
  edgeInset?: number;
  /** Slide height (defaults to the content height). */
  height?: number | string;
  /** Fire the Telegram selection haptic on a landed page change (default true; CRS-006). Also requires `haptics` on the `TKTelegramProvider`/`TKApp` to actually buzz. */
  haptics?: boolean;
  /**
   * Full-res images, index-aligned with the slides: tapping a slide opens the
   * built-in `TKImageViewer` on that image, growing out of the tapped slide
   * (shared-element). Slides become keyboard-operable buttons.
   */
  viewerImages?: TKImageViewerImage[];
  testId?: string;
}

function TKGalleryImpl<T>(
  { children, items, renderItem, getKey, page: pageProp, defaultPage, onPageChange, dots = true, gap = 10, edgeInset = 16, height, haptics = true, viewerImages, testId, className, style, ...rest }: TKGalleryProps<T>,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const locale = useTKLocale();
  const buzz = useOptionalHaptics();
  // Normalize slides to {key, node}: data-driven via items+renderItem (stable
  // getKey fixes the reorder remount — CRS-008/CRS-DX-006), else from children.
  const slides: { key: Key; node: ReactNode }[] =
    items && renderItem
      ? items.map((item, i) => ({ key: getKey ? getKey(item, i) : i, node: renderItem(item, i) }))
      : Children.toArray(children).map((slide, i) => ({
          key: isValidElement(slide) && slide.key != null ? slide.key : i,
          node: slide,
        }));
  const [page, setPage] = useControllable(pageProp, defaultPage ?? 0, onPageChange);
  // Fire the selection haptic exactly on a landed (committed) page change — never
  // on intermediate scroll frames — matching the rest of the kit (CRS-006).
  const commitPage = (next: number) => {
    setPage(next);
    if (haptics) buzz.selection();
  };
  const trackRef = useRef<HTMLDivElement>(null);
  // A programmatic smooth scroll (dot tap, arrow key) fires a burst of native
  // scroll events as it crosses each slide. Without this guard syncPage would
  // emit onPageChange for every intermediate slide the user never landed on
  // (and re-emit the destination). While a programmatic scroll is in flight we
  // suppress those intermediate reports and settle once the target is reached;
  // any user-initiated scroll (pointer/touch/wheel) clears the guard at once.
  const programmaticRef = useRef(false);
  const targetRef = useRef(0);
  // Self-clears the programmatic guard if the exact target frame is never observed
  // (off-by-gap, interrupted/cancelled smooth scroll) so it can't latch and swallow
  // every later user swipe (CRS-004).
  const settleTimerRef = useRef<number | undefined>(undefined);
  // Latest committed page, read by the resize realigner without re-subscribing.
  const pageRef = useRef(page);
  pageRef.current = page;
  const endProgrammatic = () => {
    programmaticRef.current = false;
  };
  // Real per-slide scroll stride: slides are 100% wide with `gap` between them, so
  // the native snap step is clientWidth + gap. Using clientWidth alone drifted the
  // programmatic scroll off-center by `gap` per slide and mis-rounded the index
  // (CRS-001).
  const strideOf = (el: HTMLElement) => (el.clientWidth || 1) + gap;

  // setPage already routes through useControllable → fires onPageChange and, when
  // uncontrolled, updates internal state (CRS-002). Don't call onPageChange again.
  const syncPage = () => {
    const el = trackRef.current;
    if (!el) return;
    const next = Math.round(el.scrollLeft / strideOf(el));
    if (programmaticRef.current) {
      // Ignore intermediate frames; the destination was already reported eagerly.
      if (next === targetRef.current) {
        programmaticRef.current = false;
        window.clearTimeout(settleTimerRef.current);
      }
      return;
    }
    if (next !== page) commitPage(next);
  };

  // DOM-only scroll to a slide (no state change) — used by the controlled-page
  // effect so the parent driving `page` never gets an echoed onPageChange.
  const scrollDom = (index: number, smooth: boolean) => {
    const el = trackRef.current;
    if (!el) return;
    // Max-of-0 LAST so an empty/single gallery yields 0, never a negative scrollTo (CRS-007).
    const clamped = Math.max(0, Math.min(index, slides.length - 1));
    const stride = strideOf(el);
    programmaticRef.current = smooth && clamped !== Math.round(el.scrollLeft / stride);
    targetRef.current = clamped;
    window.clearTimeout(settleTimerRef.current);
    if (programmaticRef.current) {
      settleTimerRef.current = window.setTimeout(() => {
        programmaticRef.current = false;
      }, 400);
    }
    if (typeof el.scrollTo === "function") el.scrollTo({ left: clamped * stride, behavior: smooth ? "smooth" : "auto" });
  };

  const prefersReduce = () =>
    typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  // User-driven jump (dot tap / arrow key): scroll AND report the change.
  const scrollTo = (index: number) => {
    // Max-of-0 LAST so an empty/single gallery yields 0, never a negative scrollTo (CRS-007).
    const clamped = Math.max(0, Math.min(index, slides.length - 1));
    scrollDom(clamped, !prefersReduce());
    if (clamped !== page) commitPage(clamped);
  };

  // Align the track to the controlled `page` whenever the parent changes it.
  useEffect(() => {
    if (pageProp == null) return;
    scrollDom(pageProp, !prefersReduce());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageProp]);

  // On mount, jump to the initial UNCONTROLLED page (defaultPage) so a deep-linked
  // carousel starts on the right slide without animating. The controlled case is
  // owned by the [pageProp] effect above — guarding here avoids a double scroll.
  useEffect(() => {
    if (pageProp == null && page !== 0) scrollDom(page, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-center the current slide when the viewport changes (Telegram expand(),
  // keyboard, rotation) so the track never parks mid-slide after a resize
  // (CRS-003). Listens to both window resize and a ResizeObserver on the track.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const realign = () => {
      const el = trackRef.current;
      if (!el || typeof el.scrollTo !== "function") return;
      // Don't yank the track while a field inside is focused — that resize is the
      // on-screen keyboard, and the WebView is already auto-scrolling to the input.
      if (el.contains(document.activeElement) && document.activeElement !== el) return;
      el.scrollTo({ left: pageRef.current * strideOf(el), behavior: "auto" });
    };
    window.addEventListener("resize", realign, { passive: true });
    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined" && trackRef.current) {
      ro = new ResizeObserver(realign);
      ro.observe(trackRef.current);
    }
    return () => {
      window.removeEventListener("resize", realign);
      ro?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gap]);

  // Clear the self-clearing scroll-settle timer on unmount (CRS-004).
  useEffect(() => () => window.clearTimeout(settleTimerRef.current), []);

  // Built-in viewer state: controlled index so a re-open lands on the slide
  // that was tapped, not on the first-open default.
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const viewerOrigin = useRef<HTMLElement | null>(null);
  const openViewer = (i: number, origin: HTMLElement) => {
    viewerOrigin.current = origin;
    setViewerIndex(Math.min(i, (viewerImages?.length ?? 1) - 1));
    setViewerOpen(true);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollTo(page - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollTo(page + 1);
    }
  };

  return (
    <div ref={forwardedRef} className={className} data-testid={testId} {...rest} style={{ display: "flex", flexDirection: "column", gap: 10, ...style }}>
      {/* announce the current slide to AT on every page change (CRS-005) */}
      {slides.length > 1 ? (
        <span
          role="status"
          aria-live="polite"
          style={{ position: "absolute", width: 1, height: 1, margin: -1, padding: 0, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 }}
        >
          {tkFormat(locale.slidePosition, { page: page + 1, total: slides.length })}
        </span>
      ) : null}
      <div
        ref={trackRef}
        role="group"
        aria-roledescription="carousel"
        tabIndex={0}
        onScroll={syncPage}
        onKeyDown={onKeyDown}
        // A real user gesture overrides any in-flight programmatic scroll, so
        // resume reporting page changes immediately instead of waiting for the
        // (now-cancelled) target.
        onPointerDown={endProgrammatic}
        onTouchStart={endProgrammatic}
        onWheel={endProgrammatic}
        style={{
          display: "flex",
          gap,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          padding: `0 ${edgeInset}px`,
          margin: "0",
          scrollPaddingInline: edgeInset,
          WebkitOverflowScrolling: "touch",
          height,
        }}
      >
        {slides.map(({ key, node }, i) => (
          <div
            // Preserve each slide's identity so reorder/removal doesn't remount the
            // wrong slide (CC-11/CRS-008); keys come from getKey (data) or the
            // keyed child, falling back to index.
            key={key}
            data-tk-gallery-slide
            // With viewerImages the slide is a real tap target: button semantics,
            // keyboard-operable, named after the image it opens.
            {...(viewerImages
              ? {
                  role: "button" as const,
                  tabIndex: 0,
                  "aria-label": viewerImages[i]?.alt,
                  onClick: (e: { currentTarget: HTMLElement }) => openViewer(i, e.currentTarget),
                  onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openViewer(i, e.currentTarget);
                    }
                  },
                }
              : {})}
            style={{
              flex: "0 0 100%",
              scrollSnapAlign: "center",
              minWidth: 0,
              cursor: viewerImages ? "zoom-in" : undefined,
            }}
          >
            {node}
          </div>
        ))}
      </div>
      {dots && slides.length > 1 ? (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <TKPageDots count={slides.length} page={page} onChange={scrollTo} />
        </div>
      ) : null}
      {viewerImages ? (
        <TKImageViewer
          open={viewerOpen}
          onClose={() => setViewerOpen(false)}
          images={viewerImages}
          index={viewerIndex}
          onIndexChange={setViewerIndex}
          originRef={viewerOrigin}
        />
      ) : null}
    </div>
  );
}

/**
 * Swipe carousel on CSS scroll-snap: SSR-safe, touchpad-friendly, integrated with
 * `TKPageDots`. Data-driven via `items`/`renderItem` (with a stable `getKey`) or
 * static `children`.
 */
export const TKGallery = /* @__PURE__ */ forwardRef(TKGalleryImpl) as <T = unknown>(
  props: TKGalleryProps<T> & { ref?: ForwardedRef<HTMLDivElement> },
) => ReactElement;

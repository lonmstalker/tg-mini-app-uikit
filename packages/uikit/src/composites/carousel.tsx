import { Children, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { TKPageDots } from "./navigation";

export interface TKGalleryProps {
  children?: ReactNode;
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
  testId?: string;
  style?: CSSProperties;
}

/**
 * Swipe carousel on CSS scroll-snap: SSR-safe, touchpad-friendly, and
 * integrated with `TKPageDots`.
 */
export function TKGallery({ children, onPageChange, dots = true, gap = 10, edgeInset = 16, height, testId, style }: TKGalleryProps) {
  const slides = Children.toArray(children);
  const [page, setPage] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const syncPage = () => {
    const el = trackRef.current;
    if (!el) return;
    const width = el.clientWidth || 1;
    const next = Math.round(el.scrollLeft / width);
    if (next !== page) {
      setPage(next);
      onPageChange?.(next);
    }
  };

  const scrollTo = (index: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
    setPage(index);
    onPageChange?.(index);
  };

  return (
    <div data-testid={testId} style={{ display: "flex", flexDirection: "column", gap: 10, ...style }}>
      <div
        ref={trackRef}
        tabIndex={0}
        onScroll={syncPage}
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
        {slides.map((slide, index) => (
          <div
            key={index}
            data-tk-gallery-slide
            style={{
              flex: "0 0 100%",
              scrollSnapAlign: "center",
              minWidth: 0,
            }}
          >
            {slide}
          </div>
        ))}
      </div>
      {dots && slides.length > 1 ? (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <TKPageDots count={slides.length} page={page} onChange={scrollTo} />
        </div>
      ) : null}
    </div>
  );
}

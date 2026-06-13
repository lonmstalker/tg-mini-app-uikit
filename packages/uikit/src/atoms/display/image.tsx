import { useEffect, useState, type CSSProperties } from "react";
import { useTKLocale } from "../../foundation/i18n";

export interface TKImgProps {
  label?: string;
  ratio?: string;
  radius?: string;
  style?: CSSProperties;
  testId?: string;
}

/** Striped wireframe placeholder. For real photos use `TKImage`. */
export function TKImg({ label, ratio = "1 / 1", radius = "var(--tk-r-md)", style, testId }: TKImgProps) {
  const locale = useTKLocale();
  return (
    <div className="tk-img-ph" data-testid={testId} style={{ aspectRatio: ratio, borderRadius: radius, width: "100%", ...style }}>
      {label ?? locale.image}
    </div>
  );
}

export interface TKImageProps {
  src?: string;
  srcSet?: string;
  sizes?: string;
  /** Tiny placeholder shown blurred until the real image loads (blur-up). */
  placeholderSrc?: string;
  alt?: string;
  ratio?: string;
  radius?: string;
  fit?: "cover" | "contain";
  /** Native lazy loading (default true). */
  lazy?: boolean;
  /** Placeholder text when there is no src or loading failed. */
  fallbackLabel?: string;
  onLoad?: () => void;
  onError?: () => void;
  style?: CSSProperties;
  className?: string;
  testId?: string;
}

export function TKImage({
  src,
  srcSet,
  sizes,
  placeholderSrc,
  alt = "",
  ratio = "1 / 1",
  radius = "var(--tk-r-md)",
  fit = "cover",
  lazy = true,
  fallbackLabel,
  onLoad,
  onError,
  style,
  className,
  testId,
}: TKImageProps) {
  const locale = useTKLocale();
  const [state, setState] = useState<"loading" | "ready" | "error">(src ? "loading" : "error");
  useEffect(() => setState(src ? "loading" : "error"), [src]);

  if (!src || state === "error") {
    return (
      <div
        className={["tk-img-ph", className ?? ""].filter(Boolean).join(" ")}
        data-testid={testId}
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        style={{ aspectRatio: ratio, borderRadius: radius, width: "100%", ...style }}
      >
        {fallbackLabel ?? locale.image}
      </div>
    );
  }
  return (
    <div
      className={className}
      data-testid={testId}
      style={{
        position: "relative",
        aspectRatio: ratio,
        borderRadius: radius,
        overflow: "hidden",
        width: "100%",
        ...style,
      }}
    >
      {state === "loading" ? (
        placeholderSrc ? (
          <img
            src={placeholderSrc}
            alt=""
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: fit,
              filter: "blur(14px)",
              transform: "scale(1.08)",
            }}
          />
        ) : (
          <div className="tk-skel" style={{ position: "absolute", inset: 0, borderRadius: 0 }} />
        )
      ) : null}
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading={lazy ? "lazy" : undefined}
        onLoad={() => {
          setState("ready");
          onLoad?.();
        }}
        onError={() => {
          setState("error");
          onError?.();
        }}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          objectFit: fit,
          opacity: state === "ready" ? 1 : 0,
          transition: "opacity var(--tk-t2) var(--tk-ease)",
        }}
      />
    </div>
  );
}

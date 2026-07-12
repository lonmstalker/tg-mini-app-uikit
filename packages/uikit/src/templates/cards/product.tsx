import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { TKButton, TKIconButton } from "../../atoms/buttons";
import { TKBadge, TKImage, TKImg } from "../../atoms/display";
import { TKIcon } from "../../atoms/icons";
import { useTKLocale } from "../../foundation/i18n";
import { useControllable } from "../../internal/useControllable";

/* ---------------- Product card · A (minimal) ---------------- */

export interface TKProductCardAProps extends Omit<HTMLAttributes<HTMLDivElement>, "onClick" | "title"> {
  title?: ReactNode;
  price?: ReactNode;
  /** Placeholder label when there is no photo. */
  img?: string;
  /** Photo URL; rendered with `TKImage` (loading and error states included). */
  src?: string;
  onAdd?: () => void;
  onClick?: () => void;
  testId?: string;
}

export const TKProductCardA = /* @__PURE__ */ forwardRef<HTMLDivElement, TKProductCardAProps>(function TKProductCardA(
  { title = "Product", price, img = "product photo", src, onAdd, onClick, className, style, testId, ...rest },
  ref,
) {
  const locale = useTKLocale();
  const titleName = typeof title === "string" ? title : undefined;
  return (
    <div
      ref={ref}
      {...rest}
      data-testid={testId}
      className={[onClick ? "tk-press tk-press-soft" : "", className ?? ""].filter(Boolean).join(" ")}
      style={{
        background: "var(--tk-surface)",
        borderRadius: "var(--tk-r-lg)",
        padding: 10,
        boxShadow: "var(--tk-shadow-sm)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        // Anchor the keyboard-operable overlay button (TCRD-004) without nesting the
        // add-to-cart button inside a role=button (the nested-interactive a11y bug).
        position: onClick ? "relative" : undefined,
        ...style,
      }}
    >
      {onClick ? (
        <button
          type="button"
          aria-label={titleName}
          onClick={onClick}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            border: "none",
            background: "transparent",
            borderRadius: "inherit",
            cursor: "pointer",
            padding: 0,
          }}
        />
      ) : null}
      {src ? (
        <TKImage src={src} alt={typeof title === "string" ? title : ""} radius="var(--tk-r-md)" fallbackLabel={img} />
      ) : (
        <TKImg label={img} radius="var(--tk-r-md)" />
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          padding: "0 2px 2px",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: "var(--tk-fz-sub)",
              fontWeight: 500,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: "var(--tk-fz-body)", fontWeight: 700 }}>{price}</div>
        </div>
        {onAdd ? (
          // Above the overlay (zIndex 2) so it's an independent control, not nested.
          <span style={{ position: "relative", zIndex: 2 }}>
            <TKIconButton
              icon="plus"
              size={34}
              variant="filled"
              label={locale.addToCart}
              onClick={(e) => {
                e.stopPropagation();
                onAdd();
              }}
            />
          </span>
        ) : null}
      </div>
    </div>
  );
});

/* ---------------- Product card · B (rich) ---------------- */

export interface TKProductCardBProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  price?: ReactNode;
  oldPrice?: ReactNode;
  rating?: ReactNode;
  reviews?: ReactNode;
  /** Placeholder label when there is no photo. */
  img?: string;
  /** Photo URL; rendered with `TKImage` (loading and error states included). */
  src?: string;
  discount?: ReactNode;
  fav?: boolean;
  defaultFav?: boolean;
  onFavChange?: (fav: boolean) => void;
  onAdd?: () => void;
  addLabel?: ReactNode;
  testId?: string;
}

export const TKProductCardB = /* @__PURE__ */ forwardRef<HTMLDivElement, TKProductCardBProps>(function TKProductCardB(
  {
    title = "Product",
    price,
    oldPrice,
    rating,
    reviews,
    img = "product photo",
    src,
    discount,
    fav,
    defaultFav = false,
    onFavChange,
    onAdd,
    addLabel,
    className,
    style,
    testId,
    ...rest
  },
  ref,
) {
  const locale = useTKLocale();
  const [isFav, setFav] = useControllable(fav, defaultFav, onFavChange);
  return (
    <div
      ref={ref}
      className={className}
      data-testid={testId}
      {...rest}
      style={{
        background: "var(--tk-surface)",
        borderRadius: "var(--tk-r-lg)",
        padding: 10,
        boxShadow: "var(--tk-shadow-sm)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        ...style,
      }}
    >
      <div style={{ position: "relative" }}>
        {src ? (
          <TKImage src={src} alt={typeof title === "string" ? title : ""} radius="var(--tk-r-md)" fallbackLabel={img} />
        ) : (
          <TKImg label={img} radius="var(--tk-r-md)" />
        )}
        {discount ? (
          <span style={{ position: "absolute", top: 8, left: 8 }}>
            <TKBadge tone="red">{discount}</TKBadge>
          </span>
        ) : null}
        <button
          type="button"
          className="tk-press"
          aria-label={locale.toggleFavorite}
          onClick={() => setFav(!isFav)}
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
            border: "none",
            borderRadius: "50%",
            background: "var(--tk-glass)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            color: isFav ? "var(--tk-red)" : "var(--tk-text-2)",
          }}
        >
          <span key={String(isFav)} className="tk-pop" style={{ display: "inline-flex" }}>
            <TKIcon name="heart" size={17} filled={isFav} strokeWidth={2} />
          </span>
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "0 2px 2px" }}>
        {rating ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              color: "var(--tk-orange)",
              fontSize: "var(--tk-fz-caption)",
              fontWeight: 600,
            }}
          >
            <TKIcon name="star" size={13} filled /> {rating}
            {reviews ? <span style={{ color: "var(--tk-text-3)", fontWeight: 500 }}>· {reviews}</span> : null}
          </div>
        ) : null}
        <div style={{ fontSize: "var(--tk-fz-sub)", fontWeight: 500, lineHeight: 1.3 }}>{title}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
          <span style={{ fontSize: "var(--tk-fz-title3)", fontWeight: 700 }}>{price}</span>
          {oldPrice ? (
            <span
              style={{ fontSize: "var(--tk-fz-caption)", color: "var(--tk-text-3)", textDecoration: "line-through" }}
            >
              {oldPrice}
            </span>
          ) : null}
        </div>
        <TKButton variant="tonal" size="sm" full icon="cart" onClick={onAdd}>
          {addLabel ?? locale.addToCart}
        </TKButton>
      </div>
    </div>
  );
});

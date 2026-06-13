import { type ReactNode } from "react";
import { TKButton, TKIconButton } from "../buttons";
import { TKBadge, TKImage, TKImg } from "../display";
import { TKIcon } from "../icons";
import { useTKLocale } from "../i18n";
import { useControllable } from "../internal/useControllable";

/* ---------------- Product card · A (minimal) ---------------- */

export interface TKProductCardAProps {
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

export function TKProductCardA({ title = "Product", price, img = "product photo", src, onAdd, onClick, testId }: TKProductCardAProps) {
  const locale = useTKLocale();
  return (
    <div
      data-testid={testId}
      className="tk-press tk-press-soft"
      onClick={onClick}
      style={{
        background: "var(--tk-surface)",
        borderRadius: "var(--tk-r-lg)",
        padding: 10,
        boxShadow: "var(--tk-shadow-sm)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        cursor: onClick ? "pointer" : "default",
      }}
    >
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
        ) : null}
      </div>
    </div>
  );
}

/* ---------------- Product card · B (rich) ---------------- */

export interface TKProductCardBProps {
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

export function TKProductCardB({
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
  testId,
}: TKProductCardBProps) {
  const locale = useTKLocale();
  const [isFav, setFav] = useControllable(fav, defaultFav, onFavChange);
  return (
    <div
      data-testid={testId}
      style={{
        background: "var(--tk-surface)",
        borderRadius: "var(--tk-r-lg)",
        padding: 10,
        boxShadow: "var(--tk-shadow-sm)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
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
}

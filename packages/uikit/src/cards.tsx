import {
  forwardRef,
  type CSSProperties,
  type ElementType,
  type ForwardedRef,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { TKIcon } from "./icons";
import type { TKPolymorphicProps } from "./internal/polymorphic";
import { useTKLocale } from "./i18n";
import { TKButton, TKIconButton } from "./buttons";
import { TKAvatar, TKBadge, TKImage, TKImg } from "./display";
import { useControllable } from "./internal/useControllable";

/* ---------------- Generic card primitives ---------------- */

export interface TKCardProps {
  children?: ReactNode;
  interactive?: boolean;
  onClick?: () => void;
  padding?: number | string;
  inset?: boolean;
  testId?: string;
  className?: string;
  style?: CSSProperties;
}

export const TKCard = /* @__PURE__ */ forwardRef<HTMLDivElement, TKCardProps>(function TKCard(
  { children, onClick, interactive, padding = 14, inset = true, testId, className, style },
  ref,
) {
  const isInteractive = interactive ?? !!onClick;
  return (
    <div
      ref={ref}
      data-testid={testId}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={[isInteractive ? "tk-press tk-press-soft" : "", className].filter(Boolean).join(" ")}
      style={{
        background: "var(--tk-surface)",
        borderRadius: inset ? "var(--tk-r-lg)" : 0,
        boxShadow: inset ? "var(--tk-shadow-sm)" : "none",
        padding,
        cursor: onClick ? "pointer" : "default",
        outline: "none",
        ...style,
      }}
    >
      {children}
    </div>
  );
});

export interface TKCardCellOwnProps {
  children?: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  before?: ReactNode;
  after?: ReactNode;
  onClick?: () => void;
  compact?: boolean;
  testId?: string;
  className?: string;
  style?: CSSProperties;
}

export type TKCardCellProps<T extends ElementType = "div"> = TKPolymorphicProps<T, TKCardCellOwnProps>;

function TKCardCellImpl(
  {
    as,
    children,
    title,
    subtitle,
    before,
    after,
    onClick,
    compact,
    testId,
    className,
    style,
    ...rest
  }: TKCardCellOwnProps & { as?: ElementType } & Record<string, unknown>,
  ref: ForwardedRef<HTMLElement>,
) {
  const Tag = as ?? "div";
  return (
    <Tag
      {...rest}
      ref={ref as never}
      data-testid={testId}
      role={onClick && Tag === "div" ? "button" : undefined}
      tabIndex={onClick && Tag === "div" ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e: KeyboardEvent) => {
        if (!onClick || Tag !== "div") return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={[onClick ? "tk-press tk-press-soft" : "", className].filter(Boolean).join(" ")}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        minHeight: compact ? 44 : 54,
        padding: compact ? "8px 10px" : "11px 12px",
        borderRadius: "var(--tk-r-md)",
        cursor: onClick || Tag === "a" ? "pointer" : "default",
        color: "inherit",
        textDecoration: "none",
        outline: "none",
        ...style,
      }}
    >
      {before}
      <div style={{ flex: 1, minWidth: 0 }}>
        {title ? (
          <div style={{ fontSize: "var(--tk-fz-body)", fontWeight: 600, color: "var(--tk-text)" }}>{title}</div>
        ) : null}
        {subtitle ? (
          <div style={{ fontSize: "var(--tk-fz-caption)", color: "var(--tk-text-2)", marginTop: 1 }}>{subtitle}</div>
        ) : null}
        {children}
      </div>
      {after}
    </Tag>
  );
}

/** Card row; `<TKCardCell as="a" href="…">` renders a link row. */
export const TKCardCell = /* @__PURE__ */ forwardRef(TKCardCellImpl) as <T extends ElementType = "div">(
  props: TKCardCellProps<T> & { ref?: ForwardedRef<HTMLElement> },
) => ReactElement;

export interface TKCardChipProps {
  children?: ReactNode;
  selected?: boolean;
  tone?: "accent" | "green" | "red" | "orange" | "gray";
  onClick?: () => void;
  testId?: string;
  className?: string;
  style?: CSSProperties;
}

export const TKCardChip = /* @__PURE__ */ forwardRef<HTMLButtonElement, TKCardChipProps>(function TKCardChip(
  { children, selected, tone = "accent", onClick, testId, className, style },
  ref,
) {
  const color =
    tone === "green"
      ? "var(--tk-green)"
      : tone === "red"
        ? "var(--tk-red)"
        : tone === "orange"
          ? "var(--tk-orange)"
          : tone === "gray"
            ? "var(--tk-text-2)"
            : "var(--tk-accent)";
  const ink =
    tone === "green"
      ? "var(--tk-green-ink)"
      : tone === "red"
        ? "var(--tk-red-ink)"
        : tone === "orange"
          ? "var(--tk-orange-ink)"
          : tone === "gray"
            ? "var(--tk-text-2)"
            : "var(--tk-accent-ink)";
  return (
    <button
      type="button"
      ref={ref}
      data-testid={testId}
      aria-pressed={selected}
      onClick={onClick}
      className={["tk-press", className].filter(Boolean).join(" ")}
      style={{
        border: "none",
        borderRadius: "var(--tk-r-pill)",
        padding: "6px 10px",
        background: selected ? color : "var(--tk-surface-2)",
        color: selected ? "var(--tk-on-accent)" : ink,
        fontFamily: "inherit",
        fontSize: "var(--tk-fz-caption)",
        fontWeight: 700,
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </button>
  );
});

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

/* ---------------- Banner card ---------------- */

export interface TKBannerCardProps {
  title?: ReactNode;
  text?: ReactNode;
  cta?: ReactNode;
  onCta?: () => void;
  testId?: string;
}

export function TKBannerCard({ title, text, cta, onCta, testId }: TKBannerCardProps) {
  return (
    <div
      data-testid={testId}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "var(--tk-r-lg)",
        padding: "18px 18px 16px",
        color: "#fff",
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--tk-accent) 86%, #fff) 0%, var(--tk-accent) 55%, color-mix(in srgb, var(--tk-accent) 78%, #000) 100%)",
        boxShadow: "0 14px 30px -12px var(--tk-accent-35)",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -36,
          right: -28,
          width: 130,
          height: 130,
          borderRadius: "50%",
          background: "rgba(255,255,255,.12)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -50,
          right: 36,
          width: 90,
          height: 90,
          borderRadius: "50%",
          background: "rgba(255,255,255,.08)",
        }}
      />
      <div style={{ fontSize: "var(--tk-fz-title2)", fontWeight: 700, letterSpacing: "-.01em" }}>{title}</div>
      <div style={{ fontSize: "var(--tk-fz-sub)", opacity: 0.86, maxWidth: "85%" }}>{text}</div>
      {cta ? (
        <div style={{ marginTop: 8 }}>
          <button
            type="button"
            className="tk-press"
            onClick={onCta}
            style={{
              border: "none",
              borderRadius: "var(--tk-r-pill)",
              padding: "9px 16px",
              fontSize: "var(--tk-fz-sub)",
              fontWeight: 600,
              fontFamily: "inherit",
              background: "rgba(255,255,255,.92)",
              color: "var(--tk-accent-ink)",
            }}
          >
            {cta}
          </button>
        </div>
      ) : null}
    </div>
  );
}

/* ---------------- Booking / event card ---------------- */

export interface TKBookingCardProps {
  initials?: string;
  avatarTone?: string;
  name: ReactNode;
  subtitle?: ReactNode;
  /** Trailing status node, e.g. `<TKBadge tone="green" soft>Confirmed</TKBadge>`. */
  status?: ReactNode;
  date?: ReactNode;
  time?: ReactNode;
  actionLabel?: ReactNode;
  onAction?: () => void;
  testId?: string;
}

export function TKBookingCard({
  initials = "",
  avatarTone,
  name,
  subtitle,
  status,
  date,
  time,
  actionLabel,
  onAction,
  testId,
}: TKBookingCardProps) {
  const hasMeta = date || time || actionLabel;
  return (
    <div
      data-testid={testId}
      style={{
        background: "var(--tk-surface)",
        borderRadius: "var(--tk-r-lg)",
        boxShadow: "var(--tk-shadow-sm)",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 14 }}>
        <TKAvatar initials={initials} size={44} tone={avatarTone} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "var(--tk-fz-body)", fontWeight: 600 }}>{name}</div>
          {subtitle ? (
            <div style={{ fontSize: "var(--tk-fz-caption)", color: "var(--tk-text-2)" }}>{subtitle}</div>
          ) : null}
        </div>
        {status}
      </div>
      {hasMeta ? (
        <>
          <div style={{ height: 0.5, background: "var(--tk-sep)" }} />
          <div
            style={{
              display: "flex",
              gap: 16,
              padding: "12px 14px",
              color: "var(--tk-text-2)",
              fontSize: "var(--tk-fz-sub)",
            }}
          >
            {date ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <TKIcon name="calendar" size={16} /> {date}
              </span>
            ) : null}
            {time ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <TKIcon name="clock" size={16} /> {time}
              </span>
            ) : null}
            {actionLabel ? (
              <span
                onClick={onAction}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  marginLeft: "auto",
                  color: "var(--tk-accent-ink)",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {actionLabel}
              </span>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}

/* ---------------- Stat tile ---------------- */

export interface TKStatTileProps {
  label?: ReactNode;
  value?: ReactNode;
  delta?: ReactNode;
  up?: boolean;
  bars?: number[];
  testId?: string;
  style?: CSSProperties;
}

export function TKStatTile({
  label,
  value,
  delta,
  up = true,
  bars = [5, 8, 6, 10, 9, 13, 12],
  testId,
  style,
}: TKStatTileProps) {
  const locale = useTKLocale();
  const max = Math.max(...bars);
  return (
    <div
      data-testid={testId}
      style={{
        background: "var(--tk-surface)",
        borderRadius: "var(--tk-r-lg)",
        boxShadow: "var(--tk-shadow-sm)",
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        ...style,
      }}
    >
      <div
        style={{
          fontSize: "var(--tk-fz-caption)",
          fontWeight: 600,
          color: "var(--tk-text-2)",
          textTransform: "uppercase",
          letterSpacing: ".04em",
        }}
      >
        {label ?? locale.metric}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: "var(--tk-fz-title2)", fontWeight: 700, letterSpacing: "-.02em" }}>{value}</span>
        {delta ? (
          <span
            style={{
              fontSize: "var(--tk-fz-caption)",
              fontWeight: 700,
              color: up ? "var(--tk-green)" : "var(--tk-red)",
            }}
          >
            {delta}
          </span>
        ) : null}
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 34 }}>
        {bars.map((b, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              borderRadius: 3,
              height: `${(b / max) * 100}%`,
              background: i === bars.length - 1 ? "var(--tk-accent)" : "var(--tk-accent-20)",
              transition: "height var(--tk-t3) var(--tk-spring)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

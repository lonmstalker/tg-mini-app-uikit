import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ForwardedRef,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { TKIcon, type TKIconName } from "./icons";
import { useTKLocale } from "./i18n";
import { useOptionalHaptics } from "./telegram";
import { tkDomProps, type TKDomProps } from "./internal/dom";
import { tkRovingNext, tkTabbableIndex } from "./internal/roving";
import type { TKPolymorphicProps } from "./internal/polymorphic";

export type TKButtonVariant = "filled" | "tonal" | "plain" | "outline" | "destructive" | "surface";
export type TKButtonSize = "sm" | "md" | "lg";

const BTN_SIZES: Record<TKButtonSize, { h: number; px: number; fz: string }> = {
  sm: { h: 34, px: 14, fz: "var(--tk-fz-sub)" },
  md: { h: 44, px: 20, fz: "var(--tk-fz-body)" },
  lg: { h: 52, px: 24, fz: "var(--tk-fz-body)" },
};

export function tkButtonVariantStyle(variant: TKButtonVariant): CSSProperties {
  switch (variant) {
    case "filled":
      return { background: "var(--tk-accent-grad)", color: "var(--tk-on-accent)", boxShadow: "0 6px 16px -6px var(--tk-accent-35)" };
    case "tonal":
      return { background: "var(--tk-accent-12)", color: "var(--tk-accent-ink)" };
    case "plain":
      return { background: "transparent", color: "var(--tk-accent-ink)" };
    case "outline":
      return { background: "transparent", color: "var(--tk-accent-ink)", boxShadow: "inset 0 0 0 1.5px var(--tk-accent-35)" };
    case "destructive":
      return { background: "var(--tk-red-12)", color: "var(--tk-red-ink)" };
    case "surface":
      return { background: "var(--tk-surface)", color: "var(--tk-text)", boxShadow: "var(--tk-shadow-sm)" };
  }
}

export interface TKButtonOwnProps {
  children?: ReactNode;
  variant?: TKButtonVariant;
  size?: TKButtonSize;
  pill?: boolean;
  full?: boolean;
  icon?: TKIconName;
  disabled?: boolean;
  /** Shows a spinner, sets `aria-busy` and blocks clicks; the width stays stable. */
  loading?: boolean;
  /** Rendered as `data-testid`. */
  testId?: string;
  style?: CSSProperties;
  className?: string;
}

export type TKButtonProps<T extends ElementType = "button"> = TKPolymorphicProps<T, TKButtonOwnProps>;

function TKButtonImpl(
  {
    as,
    children,
    variant = "filled",
    size = "md",
    pill,
    full,
    icon,
    disabled,
    loading,
    testId,
    style,
    className,
    ...rest
  }: TKButtonOwnProps & { as?: ElementType } & Record<string, unknown>,
  ref: ForwardedRef<HTMLElement>,
) {
  const Tag = as ?? "button";
  const s = BTN_SIZES[size] ?? BTN_SIZES.md;
  const blocked = disabled || loading;
  return (
    <Tag
      {...(Tag === "button" ? { type: "button", disabled: blocked } : { "aria-disabled": blocked || undefined })}
      {...rest}
      ref={ref as never}
      data-testid={testId}
      className={["tk-press", className ?? ""].filter(Boolean).join(" ")}
      aria-busy={loading || undefined}
      style={{
        position: loading ? "relative" : undefined,
        display: full ? "flex" : "inline-flex",
        width: full ? "100%" : undefined,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        height: s.h,
        padding: `0 ${s.px}px`,
        border: "none",
        borderRadius: pill ? "var(--tk-r-pill)" : "var(--tk-r-md)",
        fontSize: s.fz,
        fontWeight: 600,
        fontFamily: "inherit",
        letterSpacing: ".01em",
        textDecoration: "none",
        opacity: disabled ? 0.45 : 1,
        pointerEvents: blocked ? "none" : undefined,
        cursor: blocked ? "default" : "pointer",
        ...tkButtonVariantStyle(variant),
        ...style,
      }}
    >
      {loading ? (
        // a hidden copy of the content keeps the width stable while loading
        <>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              visibility: "hidden",
            }}
          >
            {icon ? <TKIcon name={icon} size={Math.round(s.h * 0.42)} /> : null}
            {children}
          </span>
          <span
            style={{
              position: "absolute",
              inset: 0,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TKSpinner color="currentColor" size={Math.round(s.h * 0.4)} />
          </span>
        </>
      ) : (
        <>
          {icon ? <TKIcon name={icon} size={Math.round(s.h * 0.42)} /> : null}
          {children}
        </>
      )}
    </Tag>
  );
}

/** Polymorphic action button: `<TKButton as="a" href="…">` renders a styled link. */
export const TKButton = /* @__PURE__ */ forwardRef(TKButtonImpl) as <T extends ElementType = "button">(
  props: TKButtonProps<T> & { ref?: ForwardedRef<HTMLElement> },
) => ReactElement;

export type TKIconButtonSize = "sm" | "md" | "lg";

const ICON_BTN_SIZES: Record<TKIconButtonSize, number> = { sm: 32, md: 40, lg: 48 };

export interface TKIconButtonProps extends TKDomProps<HTMLButtonElement> {
  icon: TKIconName;
  variant?: TKButtonVariant;
  /**
   * Visual size. Prefer the `"sm" | "md" | "lg"` variants;
   * a raw pixel number is supported for backwards compatibility.
   * @deprecated numbers — use the size variants instead.
   */
  size?: TKIconButtonSize | number;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  style?: CSSProperties;
  active?: boolean;
  disabled?: boolean;
  /** Accessible label — icon buttons have no visible text. */
  label?: string;
  /** Corner badge: a number renders a counter, `true` renders a dot. */
  badge?: number | boolean;
}

export const TKIconButton = /* @__PURE__ */ forwardRef<HTMLButtonElement, TKIconButtonProps>(function TKIconButton(
  { icon, variant = "tonal", size = "md", onClick, style, active, disabled, label, badge, ...dom },
  ref,
) {
  const px = typeof size === "number" ? size : (ICON_BTN_SIZES[size] ?? ICON_BTN_SIZES.md);
  return (
    <button
      type="button"
      ref={ref}
      className="tk-press"
      onClick={onClick}
      disabled={disabled}
      {...tkDomProps(dom)}
      aria-label={dom["aria-label"] ?? label}
      style={{
        position: badge != null && badge !== false ? "relative" : undefined,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: px,
        height: px,
        border: "none",
        borderRadius: "var(--tk-r-pill)",
        opacity: disabled ? 0.45 : 1,
        pointerEvents: disabled ? "none" : undefined,
        ...tkButtonVariantStyle(variant),
        ...(active ? { background: "var(--tk-accent)", color: "var(--tk-on-accent)" } : {}),
        ...style,
      }}
    >
      <TKIcon name={icon} size={Math.round(px * 0.52)} />
      {typeof badge === "number" ? (
        <span
          style={{
            position: "absolute",
            top: -4,
            right: -4,
            minWidth: 17,
            height: 17,
            padding: "0 4px",
            borderRadius: "var(--tk-r-pill)",
            background: "var(--tk-red)",
            color: "#fff",
            fontSize: "var(--tk-fz-caption2)",
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 0 2px var(--tk-surface)",
          }}
        >
          {badge}
        </span>
      ) : badge ? (
        <span
          data-tk-badge-dot
          style={{
            position: "absolute",
            top: -1,
            right: -1,
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: "var(--tk-red)",
            boxShadow: "0 0 0 2px var(--tk-surface)",
          }}
        />
      ) : null}
    </button>
  );
});

/* ---------------- Inline button group ---------------- */

export interface TKInlineButtonItem {
  id: string;
  label: ReactNode;
  icon?: TKIconName;
  disabled?: boolean;
  danger?: boolean;
  selected?: boolean;
  onClick?: () => void;
}

export interface TKInlineButtonsProps {
  items: TKInlineButtonItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  equal?: boolean;
  size?: "sm" | "md";
  testId?: string;
  style?: CSSProperties;
}

export function TKInlineButtons({
  items,
  value,
  defaultValue = "",
  onChange,
  equal = true,
  size = "md",
  testId,
  style,
}: TKInlineButtonsProps) {
  const [inner, setInner] = useState(defaultValue);
  const active = value ?? inner;
  const height = size === "sm" ? 34 : 40;
  const fontSize = size === "sm" ? "var(--tk-fz-caption)" : "var(--tk-fz-sub)";
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const disabledAt = (i: number) => !!items[i]?.disabled;
  // toolbar pattern: focus roves, activation stays on click/Enter
  const [focusIdx, setFocusIdx] = useState(() => tkTabbableIndex(0, items.length, disabledAt));

  return (
    <div
      role="group"
      data-testid={testId}
      style={{
        display: "flex",
        gap: 6,
        padding: 4,
        borderRadius: "var(--tk-r-lg)",
        background: "var(--tk-surface-2)",
        ...style,
      }}
    >
      {items.map((item, i) => {
        const selected = item.selected ?? active === item.id;
        const color = item.danger ? "var(--tk-red)" : selected ? "var(--tk-on-accent)" : "var(--tk-text)";
        return (
          <button
            key={item.id}
            type="button"
            ref={(el) => {
              refs.current[i] = el;
            }}
            tabIndex={i === focusIdx ? 0 : -1}
            onFocus={() => setFocusIdx(i)}
            onKeyDown={(e) => {
              const next = tkRovingNext(e.key, i, items.length, disabledAt, "horizontal");
              if (next == null) return;
              e.preventDefault();
              setFocusIdx(next);
              refs.current[next]?.focus();
            }}
            aria-pressed={selected}
            disabled={item.disabled}
            className="tk-press"
            onClick={() => {
              if (item.disabled) return;
              if (value === undefined) setInner(item.id);
              onChange?.(item.id);
              item.onClick?.();
            }}
            style={{
              flex: equal ? 1 : "0 0 auto",
              minWidth: 0,
              height,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              padding: size === "sm" ? "0 10px" : "0 13px",
              border: "none",
              borderRadius: "var(--tk-r-md)",
              background: selected ? (item.danger ? "var(--tk-red)" : "var(--tk-accent)") : "transparent",
              color,
              opacity: item.disabled ? 0.45 : 1,
              pointerEvents: item.disabled ? "none" : undefined,
              fontFamily: "inherit",
              fontSize,
              fontWeight: 700,
              letterSpacing: 0,
              cursor: item.disabled ? "default" : "pointer",
              boxShadow: selected ? "var(--tk-shadow-sm)" : "none",
              transition:
                "background var(--tk-t2) var(--tk-ease), color var(--tk-t2) var(--tk-ease), box-shadow var(--tk-t2) var(--tk-ease)",
            }}
          >
            {item.icon ? <TKIcon name={item.icon} size={size === "sm" ? 15 : 17} /> : null}
            <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export interface TKSpinnerProps {
  color?: string;
  size?: number;
  testId?: string;
}

export function TKSpinner({ color = "var(--tk-accent)", size = 20, testId }: TKSpinnerProps) {
  return (
    <span
      data-testid={testId}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: `2.5px solid color-mix(in srgb, ${color} 25%, transparent)`,
        borderTopColor: color,
        display: "inline-block",
        animation: "tk-spin calc(700ms / var(--tk-ms)) linear infinite",
      }}
    />
  );
}

export type TKMainButtonStatus = "idle" | "loading" | "success";

export interface TKMainButtonProps {
  label: ReactNode;
  successLabel?: ReactNode;
  /** Controlled status. Omit it and return a promise from `onClick` to get the idle → loading → success cycle for free. */
  status?: TKMainButtonStatus;
  onClick?: () => void | Promise<unknown>;
  /** How long the success state is shown in auto mode, ms. */
  successDuration?: number;
  disabled?: boolean;
  testId?: string;
  style?: CSSProperties;
}

/** Telegram-style bottom action button with a built-in state machine. */
export const TKMainButton = /* @__PURE__ */ forwardRef<HTMLButtonElement, TKMainButtonProps>(function TKMainButton(
  { label, successLabel, status, onClick, successDuration = 1600, disabled, testId, style },
  ref,
) {
  const locale = useTKLocale();
  const haptics = useOptionalHaptics();
  const successText = successLabel ?? locale.done;
  const [auto, setAuto] = useState<TKMainButtonStatus>("idle");
  const timer = useRef<number | undefined>(undefined);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      window.clearTimeout(timer.current);
    };
  }, []);

  const state = status ?? auto;
  const isSuccess = state === "success";

  const run = () => {
    if (disabled || state !== "idle") return;
    const result = onClick?.();
    if (status !== undefined) return; // controlled — the consumer drives the status
    if (result && typeof (result as Promise<unknown>).then === "function") {
      setAuto("loading");
      (result as Promise<unknown>).then(
        () => {
          if (!mounted.current) return;
          haptics.notification("success");
          setAuto("success");
          timer.current = window.setTimeout(() => mounted.current && setAuto("idle"), successDuration);
        },
        () => mounted.current && setAuto("idle"),
      );
    }
  };

  return (
    <button
      type="button"
      ref={ref}
      className="tk-press-soft tk-press"
      onClick={run}
      disabled={disabled}
      data-testid={testId}
      aria-busy={state === "loading" || undefined}
      // keep an accessible name while the visible label is replaced by the spinner
      aria-label={state === "loading" && typeof label === "string" ? label : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        width: "100%",
        height: 52,
        border: "none",
        borderRadius: "var(--tk-r-md)",
        fontSize: "var(--tk-fz-body)",
        fontWeight: 600,
        fontFamily: "inherit",
        color: "var(--tk-on-accent)",
        opacity: disabled ? 0.45 : 1,
        pointerEvents: disabled ? "none" : undefined,
        background: isSuccess
          ? "linear-gradient(180deg, color-mix(in srgb, var(--tk-green) 88%, #fff), var(--tk-green))"
          : "var(--tk-accent-grad)",
        boxShadow: isSuccess ? "0 6px 16px -6px var(--tk-green)" : "0 6px 16px -6px var(--tk-accent-35)",
        transition: "background var(--tk-t2) var(--tk-ease), box-shadow var(--tk-t2) var(--tk-ease)",
        ...style,
      }}
    >
      {state === "loading" ? (
        <TKSpinner color="var(--tk-on-accent)" />
      ) : isSuccess ? (
        <span key="ok" className="tk-pop" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <TKIcon name="check" size={20} strokeWidth={2.6} /> {successText}
        </span>
      ) : (
        label
      )}
    </button>
  );
});

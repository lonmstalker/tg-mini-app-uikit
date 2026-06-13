import type { CSSProperties } from "react";

export type TKButtonVariant = "filled" | "tonal" | "plain" | "outline" | "destructive" | "surface";
export type TKButtonSize = "sm" | "md" | "lg";
export type TKIconButtonSize = "sm" | "md" | "lg";

export const BTN_SIZES: Record<TKButtonSize, { h: number; px: number; fz: string }> = {
  sm: { h: 34, px: 14, fz: "var(--tk-fz-sub)" },
  md: { h: 44, px: 20, fz: "var(--tk-fz-body)" },
  lg: { h: 52, px: 24, fz: "var(--tk-fz-body)" },
};

export const ICON_BTN_SIZES: Record<TKIconButtonSize, number> = { sm: 32, md: 40, lg: 48 };

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

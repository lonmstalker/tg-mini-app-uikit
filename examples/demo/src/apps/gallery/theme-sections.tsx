import type { CSSProperties } from "react";
import { TKBadge, TKButton, TKCard, TKCell, TKInput, TKListGroup, TKProvider, TKSwitch, useTKTheme, type TKThemeKnobs } from "tg-mini-app-uikit";
import { ACCENTS } from "../../shell/types";

/* ---- theme matrix: representative components under nested TKProvider knobs ---- */

export const MATRIX_VARIANTS: { label: string; knobs: TKThemeKnobs }[] = [
  ...ACCENTS.map((accent) => ({ label: `accent ${accent}`, knobs: { accent } })),
  { label: "round 0.4", knobs: { roundness: 0.4 } },
  { label: "round 1", knobs: { roundness: 1 } },
  { label: "round 1.6", knobs: { roundness: 1.6 } },
  { label: "font 14", knobs: { fontSize: 14 } },
  { label: "font 19", knobs: { fontSize: 19 } },
];

export function MatrixRow({ label, knobs }: { label: string; knobs: TKThemeKnobs }) {
  // Nested providers default to light — inherit the shell's current scheme.
  const { theme } = useTKTheme();
  return (
    <div data-demo-matrix-row={label}>
      <TKProvider theme={theme} {...knobs} style={{ background: "transparent" }}>
        <TKCard padding={10} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 92,
              flexShrink: 0,
              fontSize: "var(--tk-fz-caption2)",
              fontWeight: 600,
              color: "var(--tk-text-3)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {label}
          </span>
          <TKButton size="sm">Pay</TKButton>
          <TKButton size="sm" variant="tonal">Edit</TKButton>
          <div style={{ flex: 1, minWidth: 0 }}>
            <TKInput placeholder="Promo" />
          </div>
          <TKSwitch defaultChecked ariaLabel={`Switch · ${label}`} />
        </TKCard>
      </TKProvider>
    </div>
  );
}

/* ---- Telegram theme mode: `.tk-tg` resolves tokens from --tg-theme-* ---- */

const TG_PALETTES: Record<"light" | "dark", Record<string, string>> = {
  // Mirrors the demo Telegram mock (examples/demo/src/telegram/mock.ts).
  light: {
    bg_color: "#ffffff",
    secondary_bg_color: "#eef1f6",
    section_bg_color: "#ffffff",
    section_separator_color: "#e3e7ee",
    text_color: "#131c26",
    subtitle_text_color: "#57636f",
    hint_color: "#646e79",
    link_color: "#3390ec",
    button_color: "#3390ec",
    button_text_color: "#ffffff",
    destructive_text_color: "#e5484d",
  },
  dark: {
    bg_color: "#17212b",
    secondary_bg_color: "#0e1621",
    section_bg_color: "#17212b",
    section_separator_color: "#202c39",
    text_color: "#f3f6f9",
    subtitle_text_color: "#aebbc9",
    hint_color: "#95a3b2",
    link_color: "#3390ec",
    button_color: "#3390ec",
    button_text_color: "#ffffff",
    destructive_text_color: "#ff6166",
  },
};

/** `bg_color` → `--tg-theme-bg-color`, exactly how the Telegram client injects them. */
function tgVars(palette: Record<string, string>): CSSProperties {
  return Object.fromEntries(
    Object.entries(palette).map(([key, value]) => [`--tg-theme-${key.replace(/_/g, "-")}`, value]),
  ) as CSSProperties;
}

export function TgThemeBlock({ scheme }: { scheme: "light" | "dark" }) {
  return (
    <div data-demo-tg-scheme={scheme} style={{ ...tgVars(TG_PALETTES[scheme]), borderRadius: "var(--tk-r-lg)", overflow: "hidden" }}>
      <TKProvider theme={scheme} telegram style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "var(--tk-fz-sub)", fontWeight: 700, flex: 1 }}>
            Telegram {scheme} palette
          </span>
          <TKBadge soft>tk-tg</TKBadge>
        </div>
        <TKListGroup>
          <TKCell icon="user" title="Anna Karlova" subtitle="@annak · Premium" chevron onClick={() => {}} />
          <TKCell icon="bell" title="Notifications" defaultToggle />
        </TKListGroup>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <TKButton size="sm">button_color</TKButton>
          <TKButton size="sm" variant="destructive">destructive</TKButton>
          <span style={{ fontSize: "var(--tk-fz-caption)", color: "var(--tk-text-3)" }}>hint_color</span>
        </div>
      </TKProvider>
    </div>
  );
}

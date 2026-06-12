import type { ReactNode } from "react";
import { TKProvider, TKSegmented, TKSlider, TKSwitch } from "tg-mini-app-uikit";
import { ACCENTS, type Tweaks } from "./types";

/* The panel itself is built from the kit — dogfooding the components. */

function Label({ children, first }: { children: ReactNode; first?: boolean }) {
  return (
    <div
      style={{
        fontSize: "var(--tk-fz-caption)",
        fontWeight: 600,
        letterSpacing: ".05em",
        textTransform: "uppercase",
        color: "var(--tk-text-3)",
        margin: first ? "0 0 2px" : "10px 0 2px",
      }}
    >
      {children}
    </div>
  );
}

export interface TweaksPanelProps {
  tweaks: Tweaks;
  onChange: (patch: Partial<Tweaks>) => void;
  style?: React.CSSProperties;
}

export function TweaksPanel({ tweaks, onChange, style }: TweaksPanelProps) {
  return (
    <TKProvider
      theme="dark"
      accent={tweaks.accent}
      style={{
        width: 252,
        borderRadius: 18,
        padding: "16px 16px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        boxShadow: "0 18px 48px rgba(0,0,0,.45), inset 0 0 0 1px rgba(255,255,255,.06)",
        ...style,
      }}
    >
      <div style={{ fontSize: "var(--tk-fz-sub)", fontWeight: 700, marginBottom: 2 }}>Tweaks</div>

      <Label first>Theme</Label>
      <TKSwitch label="Dark mode" checked={tweaks.dark} onChange={(dark) => onChange({ dark })} />

      <Label>Accent</Label>
      <div style={{ display: "flex", gap: 10 }}>
        {ACCENTS.map((color) => {
          const on = color === tweaks.accent;
          return (
            <button
              type="button"
              key={color}
              aria-label={`Accent ${color}`}
              onClick={() => onChange({ accent: color })}
              className="tk-press"
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "none",
                background: color,
                boxShadow: on ? `0 0 0 2.5px var(--tk-surface), 0 0 0 5px ${color}` : "none",
                transition: "box-shadow var(--tk-t2) var(--tk-ease)",
              }}
            />
          );
        })}
      </div>

      <Label>Roundness · ×{tweaks.roundness.toFixed(2)}</Label>
      <TKSlider label="Roundness" min={0.4} max={1.6} step={0.05} value={tweaks.roundness} onChange={(roundness) => onChange({ roundness })} />

      <Label>Language</Label>
      <TKSegmented
        full
        options={[
          { value: "en", label: "EN" },
          { value: "ru", label: "RU" },
          { value: "ar", label: "AR" },
        ]}
        value={tweaks.locale}
        onChange={(locale) => onChange({ locale: locale as Tweaks["locale"] })}
      />

      <Label>Motion</Label>
      <TKSegmented
        full
        options={["Springy", "Smooth"]}
        value={tweaks.motion === "springy" ? "Springy" : "Smooth"}
        onChange={(v) => onChange({ motion: v === "Springy" ? "springy" : "smooth" })}
      />
      <Label>Speed · ×{tweaks.motionSpeed.toFixed(1)}</Label>
      <TKSlider label="Speed" min={0.4} max={2} step={0.1} value={tweaks.motionSpeed} onChange={(motionSpeed) => onChange({ motionSpeed })} />

      <Label>Base font size · {tweaks.fontSize}px</Label>
      <TKSlider label="Base font size" min={14} max={19} step={0.5} value={tweaks.fontSize} onChange={(fontSize) => onChange({ fontSize })} />

      <div style={{ fontSize: "var(--tk-fz-caption2)", color: "var(--tk-text-3)", marginTop: 6 }}>
        Every knob maps to a design token — the apps restyle live.
      </div>
    </TKProvider>
  );
}

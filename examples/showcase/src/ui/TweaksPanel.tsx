import { useLayoutEffect, useState } from "react";
import {
  TKButton,
  TKChip,
  TKSlider,
  TKSwitch,
  type TKTheme,
} from "tg-mini-app-uikit";
import { SectionTitle } from "./layout";
import {
  SHOWCASE_TWEAK_RANGES,
  type ShowcaseTweaks,
} from "./showcaseTweaks";
import { mixHexColors, resolveTokenHex } from "./themeColors";

const RADIUS_RANGE = SHOWCASE_TWEAK_RANGES.radius;
const MOTION_RANGE = SHOWCASE_TWEAK_RANGES.motion;
const FONT_RANGE = SHOWCASE_TWEAK_RANGES.font;

const ACCENT_PRESETS = [
  { id: "telegram", label: "Telegram blue", token: "--tk-accent" },
  { id: "green", label: "Green", token: "--tk-green" },
  { id: "orange", label: "Orange", token: "--tk-orange" },
  { id: "purple", label: "Purple", token: "--tk-purple" },
  { id: "red", label: "Red", token: "--tk-red" },
] as const;

interface AccentPreset {
  id: (typeof ACCENT_PRESETS)[number]["id"];
  label: string;
  value: string;
}

interface TweaksPanelProps {
  theme: TKTheme;
  tweaks: ShowcaseTweaks;
  onChange: (tweaks: ShowcaseTweaks) => void;
  onDefaultAccentResolved: (accent: string) => void;
  onReset: () => void;
}

function resolveAccentPresets(theme: TKTheme): AccentPreset[] {
  const host = document.createElement("div");
  host.className = "tk";
  host.dataset.theme = theme;
  host.setAttribute("aria-hidden", "true");
  host.style.position = "fixed";
  host.style.inlineSize = "0";
  host.style.blockSize = "0";
  host.style.overflow = "hidden";
  host.style.visibility = "hidden";
  document.body.append(host);

  try {
    const resolved = new Map(
      ACCENT_PRESETS.map((preset) => [preset.id, resolveTokenHex(host, preset.token)]),
    );
    const telegram = resolved.get("telegram");
    const red = resolved.get("red");

    // Current tokens.css has no purple token yet. Prefer it when present, then
    // derive a palette-bound fallback from the resolved kit accent and red.
    if (!resolved.get("purple") && telegram && red) {
      resolved.set("purple", mixHexColors(telegram, red));
    }

    return ACCENT_PRESETS.flatMap((preset) => {
      const value = resolved.get(preset.id);
      return value ? [{ id: preset.id, label: preset.label, value }] : [];
    });
  } finally {
    host.remove();
  }
}

export function TweaksPanel({
  theme,
  tweaks,
  onChange,
  onDefaultAccentResolved,
  onReset,
}: TweaksPanelProps) {
  const [presets, setPresets] = useState<AccentPreset[]>([]);
  const [previewEnabled, setPreviewEnabled] = useState(true);
  const [previewPressed, setPreviewPressed] = useState(false);

  useLayoutEffect(() => {
    const next = resolveAccentPresets(theme);
    setPresets(next);
    if (next[0]) onDefaultAccentResolved(next[0].value);
  }, [onDefaultAccentResolved, theme]);

  const currentAccent = tweaks.accent ?? presets[0]?.value ?? "";
  const selectedPreset = presets.find(
    (preset) => preset.value.toLowerCase() === currentAccent.toLowerCase(),
  );
  const update = (change: Partial<ShowcaseTweaks>) => onChange({ ...tweaks, ...change });

  return (
    <div className="tweaks-layout">
      <div className="tweaks-intro">
        <SectionTitle id="tweaks-title">Tune every surface</SectionTitle>
        <p>
          Adjust the UIKit at its root. Every demo below the provider inherits the same
          accent, radius, motion speed, and type scale immediately.
        </p>
      </div>

      <div className="tweaks-panel" data-testid="tweaks-panel">
        <div className="tweaks-panel-heading">
          <div>
            <strong>Live theme controls</strong>
            <span>Saved automatically on this device</span>
          </div>
          <TKButton size="sm" variant="outline" onClick={onReset} testId="tweaks-reset">
            Reset
          </TKButton>
        </div>

        <div className="tweaks-control tweaks-control--accent">
          <div className="tweaks-control-heading">
            <span id="tweaks-accent-label">Accent</span>
            <output aria-labelledby="tweaks-accent-label">
              {selectedPreset?.label ?? "Custom"}
              {currentAccent ? <code>{currentAccent.toUpperCase()}</code> : null}
            </output>
          </div>

          <div className="tweaks-swatches" role="group" aria-labelledby="tweaks-accent-label">
            {presets.map((preset) => {
              const selected = preset.id === selectedPreset?.id;
              return (
                <TKChip
                  key={preset.id}
                  selected={selected}
                  aria-label={`Use ${preset.label} accent`}
                  onClick={() => update({ accent: preset.value })}
                  style={{
                    width: 44,
                    height: 44,
                    padding: 0,
                    justifyContent: "center",
                    color: "var(--tk-text)",
                    background: "var(--tk-surface-2)",
                    boxShadow: selected ? "var(--tk-ring)" : "inset 0 0 0 1px var(--tk-sep)",
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="tweaks-swatch-dot"
                    style={{ background: preset.value }}
                  />
                </TKChip>
              );
            })}

            <label className="tweaks-color-input">
              <input
                type="color"
                value={currentAccent}
                aria-label="Choose a custom accent color"
                onChange={(event) => update({ accent: event.currentTarget.value })}
              />
              <span>Custom</span>
            </label>
          </div>
        </div>

        <div className="tweaks-control">
          <div className="tweaks-control-heading">
            <span id="tweaks-radius-label">Radius</span>
            <output aria-labelledby="tweaks-radius-label">{tweaks.roundness.toFixed(1)}×</output>
          </div>
          <TKSlider
            min={RADIUS_RANGE.min}
            max={RADIUS_RANGE.max}
            step={0.1}
            value={tweaks.roundness}
            onChange={(roundness) => update({ roundness })}
            label="Global radius scale"
            suffix="×"
            testId="tweaks-radius"
          />
        </div>

        <div className="tweaks-control">
          <div className="tweaks-control-heading">
            <span id="tweaks-motion-label">Motion speed</span>
            <output aria-labelledby="tweaks-motion-label">{tweaks.motionSpeed.toFixed(1)}×</output>
          </div>
          <TKSlider
            min={MOTION_RANGE.min}
            max={MOTION_RANGE.max}
            step={0.1}
            value={tweaks.motionSpeed}
            onChange={(motionSpeed) => update({ motionSpeed })}
            label="Global motion speed"
            suffix="×"
            testId="tweaks-motion"
          />
        </div>

        <div className="tweaks-control">
          <div className="tweaks-control-heading">
            <span id="tweaks-font-label">Font size</span>
            <output aria-labelledby="tweaks-font-label">{tweaks.fontSize} px</output>
          </div>
          <TKSlider
            min={FONT_RANGE.min}
            max={FONT_RANGE.max}
            step={1}
            value={tweaks.fontSize}
            onChange={(fontSize) => update({ fontSize })}
            label="Global base font size"
            suffix=" px"
            testId="tweaks-font"
          />
        </div>

        <div className="tweaks-preview" aria-label="Live control preview">
          <div>
            <strong>Local preview</strong>
            <span>These controls use the same inherited tokens.</span>
          </div>
          <div className="tweaks-preview-actions">
            <TKSwitch
              checked={previewEnabled}
              onChange={setPreviewEnabled}
              label="Live preview switch"
            />
            <TKButton
              size="sm"
              variant="tonal"
              aria-pressed={previewPressed}
              onClick={() => setPreviewPressed((pressed) => !pressed)}
              testId="tweaks-preview-button"
            >
              {previewPressed ? "Preview active" : "Preview action"}
            </TKButton>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useLayoutEffect, useState } from "react";
import {
  TKButton,
  TKChip,
  TKSlider,
  TKSwitch,
  type TKTheme,
} from "tg-mini-app-uikit";
import { SectionTitle } from "../shared/layout";
import { formatSiteString, useSiteLocale } from "../shared/i18n";
import {
  SHOWCASE_TWEAK_RANGES,
  type ShowcaseTweaks,
} from "./showcaseTweaks";
import { mixHexColors, resolveTokenHex } from "./themeColors";

const RADIUS_RANGE = SHOWCASE_TWEAK_RANGES.radius;
const MOTION_RANGE = SHOWCASE_TWEAK_RANGES.motion;
const FONT_RANGE = SHOWCASE_TWEAK_RANGES.font;

const ACCENT_PRESETS = [
  { id: "telegram", token: "--tk-accent" },
  { id: "green", token: "--tk-green" },
  { id: "orange", token: "--tk-orange" },
  { id: "purple", token: "--tk-purple" },
  { id: "red", token: "--tk-red" },
] as const;

type AccentPresetId = (typeof ACCENT_PRESETS)[number]["id"];

interface AccentPreset {
  id: AccentPresetId;
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

function resolveAccentPresets(
  theme: TKTheme,
  labels: Record<AccentPresetId, string>,
): AccentPreset[] {
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
      return value ? [{ id: preset.id, label: labels[preset.id], value }] : [];
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
  const { strings } = useSiteLocale();
  const copy = strings.demo.tweaks;
  const [presets, setPresets] = useState<AccentPreset[]>([]);
  const [previewEnabled, setPreviewEnabled] = useState(true);
  const [previewPressed, setPreviewPressed] = useState(false);

  useLayoutEffect(() => {
    const next = resolveAccentPresets(theme, {
      telegram: copy.telegramBlue,
      green: copy.green,
      orange: copy.orange,
      purple: copy.purple,
      red: copy.red,
    });
    setPresets(next);
    if (next[0]) onDefaultAccentResolved(next[0].value);
  }, [copy, onDefaultAccentResolved, theme]);

  const currentAccent = tweaks.accent ?? presets[0]?.value ?? "";
  const selectedPreset = presets.find(
    (preset) => preset.value.toLowerCase() === currentAccent.toLowerCase(),
  );
  const update = (change: Partial<ShowcaseTweaks>) => onChange({ ...tweaks, ...change });

  return (
    <div className="tweaks-layout">
      <div className="tweaks-intro">
        <SectionTitle id="tweaks-title">{copy.title}</SectionTitle>
        <p>{copy.intro}</p>
      </div>

      <div className="tweaks-panel" data-testid="tweaks-panel">
        <div className="tweaks-panel-heading">
          <div>
            <strong>{copy.controls}</strong>
            <span>{copy.saved}</span>
          </div>
          <TKButton size="sm" variant="outline" onClick={onReset} testId="tweaks-reset">
            {copy.reset}
          </TKButton>
        </div>

        <div className="tweaks-control tweaks-control--accent">
          <div className="tweaks-control-heading">
            <span id="tweaks-accent-label">{copy.accent}</span>
            <output aria-labelledby="tweaks-accent-label">
              {selectedPreset?.label ?? copy.custom}
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
                  aria-label={formatSiteString(copy.useAccent, { label: preset.label })}
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
                aria-label={copy.chooseAccent}
                onChange={(event) => update({ accent: event.currentTarget.value })}
              />
              <span>{copy.custom}</span>
            </label>
          </div>
        </div>

        <div className="tweaks-control">
          <div className="tweaks-control-heading">
            <span id="tweaks-radius-label">{copy.radius}</span>
            <output aria-labelledby="tweaks-radius-label">{tweaks.roundness.toFixed(1)}×</output>
          </div>
          <TKSlider
            min={RADIUS_RANGE.min}
            max={RADIUS_RANGE.max}
            step={0.1}
            value={tweaks.roundness}
            onChange={(roundness) => update({ roundness })}
            label={copy.radiusAria}
            suffix="×"
            testId="tweaks-radius"
          />
        </div>

        <div className="tweaks-control">
          <div className="tweaks-control-heading">
            <span id="tweaks-motion-label">{copy.motion}</span>
            <output aria-labelledby="tweaks-motion-label">{tweaks.motionSpeed.toFixed(1)}×</output>
          </div>
          <TKSlider
            min={MOTION_RANGE.min}
            max={MOTION_RANGE.max}
            step={0.1}
            value={tweaks.motionSpeed}
            onChange={(motionSpeed) => update({ motionSpeed })}
            label={copy.motionAria}
            suffix="×"
            testId="tweaks-motion"
          />
        </div>

        <div className="tweaks-control">
          <div className="tweaks-control-heading">
            <span id="tweaks-font-label">{copy.fontSize}</span>
            <output aria-labelledby="tweaks-font-label">{tweaks.fontSize} px</output>
          </div>
          <TKSlider
            min={FONT_RANGE.min}
            max={FONT_RANGE.max}
            step={1}
            value={tweaks.fontSize}
            onChange={(fontSize) => update({ fontSize })}
            label={copy.fontSizeAria}
            suffix=" px"
            testId="tweaks-font"
          />
        </div>

        <div className="tweaks-preview" aria-label={copy.previewAria}>
          <div>
            <strong>{copy.previewTitle}</strong>
            <span>{copy.previewCopy}</span>
          </div>
          <div className="tweaks-preview-actions">
            <TKSwitch
              checked={previewEnabled}
              onChange={setPreviewEnabled}
              label={copy.previewSwitch}
            />
            <TKButton
              size="sm"
              variant="tonal"
              aria-pressed={previewPressed}
              onClick={() => setPreviewPressed((pressed) => !pressed)}
              testId="tweaks-preview-button"
            >
              {previewPressed ? copy.previewActive : copy.previewAction}
            </TKButton>
          </div>
        </div>
      </div>
    </div>
  );
}

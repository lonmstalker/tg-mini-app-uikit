import {
  TKListGroup,
  TKPage,
  TKRating,
  TKSegmented,
  TKSlider,
  TKText,
  TKTitle,
  type TKMotion,
} from "tg-mini-app-uikit";
import { useLang, useT, type Lang } from "../../i18n";
import { DEFAULT_THEME_PREFS, useAppDispatch, useAppState, type ThemePrefs } from "../../store";
import { useMockBackHeader } from "../../components/MockBackHeader";
import { PrimaryAction } from "../../components/PrimaryAction";

// All AA-compliant with white text (≥ 4.5:1), so any choice keeps contrast.
const ACCENTS = [
  { id: "blue", color: "#1c6fd3" },
  { id: "green", color: "#1f7a37" },
  { id: "orange", color: "#a85513" },
  { id: "purple", color: "#8c52d6" },
  { id: "red", color: "#cc2f34" },
];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7, padding: "8px 14px" }}>
      <TKText weight={600} size="footnote">
        {label}
      </TKText>
      {children}
    </div>
  );
}

export function PlatformLab({ active }: { active: boolean }) {
  const t = useT();
  const { lang, setLang } = useLang();
  const { themePrefs } = useAppState();
  const dispatch = useAppDispatch();
  const set = (payload: Partial<ThemePrefs>) => dispatch({ type: "SET_THEME_PREF", payload });
  const header = useMockBackHeader(t("lab.title"));

  const activeAccent = ACCENTS.find((a) => a.color.toLowerCase() === themePrefs.accent.toLowerCase())?.id ?? "blue";

  return (
    <TKPage
      testId="panel-profile-lab"
      header={header}
      gap={10}
      footer={
        <PrimaryAction
          active={active}
          testId="lab-reset"
          label={t("lab.reset")}
          onClick={() =>
            set({
              accent: DEFAULT_THEME_PREFS.accent,
              roundness: DEFAULT_THEME_PREFS.roundness,
              motion: DEFAULT_THEME_PREFS.motion,
              fontSize: DEFAULT_THEME_PREFS.fontSize,
              colorScheme: "light",
            })
          }
        />
      }
    >
      <TKTitle level={1}>{t("lab.title")}</TKTitle>
      <TKText tone="secondary" size="footnote">
        {t("lab.intro")}
      </TKText>

      {/* Live preview — reflects accent + radius + type scale immediately. */}
      <div
        data-testid="lab-preview-card"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: 12,
          borderRadius: "calc(var(--tk-r-lg, 18px) * var(--tk-rx, 1))",
          background: "var(--tk-accent-12)",
          border: "1px solid var(--tk-accent)",
        }}
      >
        <div
          aria-hidden
          style={{ width: 40, height: 40, borderRadius: "calc(var(--tk-r-md, 14px) * var(--tk-rx, 1))", background: "var(--tk-accent)" }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <TKText as="div" weight={600}>
            {t("lab.previewCard")}
          </TKText>
          <TKRating value={4.9} max={5} readonly allowHalf />
        </div>
      </div>

      <TKListGroup>
        <Row label={t("lab.accent")}>
          <TKSegmented
            testId="lab-accent"
            full
            value={activeAccent}
            onChange={(id) => set({ accent: ACCENTS.find((a) => a.id === id)?.color ?? DEFAULT_THEME_PREFS.accent })}
            options={ACCENTS.map((a) => ({
              value: a.id,
              label: <span aria-hidden style={{ display: "inline-block", width: 16, height: 16, borderRadius: 8, background: a.color }} />,
            }))}
          />
        </Row>
        <Row label={t("lab.radius")}>
          <TKSlider
            testId="lab-radius"
            label={t("lab.radius")}
            min={0.4}
            max={1.6}
            step={0.1}
            value={themePrefs.roundness}
            onChange={(roundness) => set({ roundness })}
          />
        </Row>
        <Row label={t("lab.typeScale")}>
          <TKSlider
            testId="lab-type"
            label={t("lab.typeScale")}
            min={14}
            max={18}
            step={1}
            value={themePrefs.fontSize}
            onChange={(fontSize) => set({ fontSize })}
          />
        </Row>
        <Row label={t("lab.motion")}>
          <TKSegmented
            testId="lab-motion"
            full
            value={themePrefs.motion}
            onChange={(m) => set({ motion: m as TKMotion })}
            options={[
              { value: "springy", label: t("lab.motion.springy") },
              { value: "smooth", label: t("lab.motion.smooth") },
            ]}
          />
        </Row>
        <Row label={t("lab.appearance")}>
          <TKSegmented
            testId="lab-appearance"
            full
            value={themePrefs.colorScheme}
            onChange={(s) => set({ colorScheme: s as "light" | "dark" })}
            options={[
              { value: "light", label: t("lab.appearance.light") },
              { value: "dark", label: t("lab.appearance.dark") },
            ]}
          />
        </Row>
        <Row label={t("lab.language")}>
          <TKSegmented
            testId="lab-language"
            full
            value={lang}
            onChange={(l) => setLang(l as Lang)}
            options={[
              { value: "en", label: "English" },
              { value: "ru", label: "Русский" },
            ]}
          />
        </Row>
      </TKListGroup>

      <div aria-hidden style={{ height: "calc(var(--tk-safe-bottom, 0px) + 72px)" }} />
    </TKPage>
  );
}

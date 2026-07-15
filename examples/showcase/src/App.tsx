import { useCallback, useEffect, useState } from "react";
import {
  enLocale,
  ruLocale,
  TKLocaleProvider,
  TKProvider,
  TKToastProvider,
  type TKTheme,
} from "tg-mini-app-uikit";
import { Hero } from "./ui/Hero";
import { Features } from "./ui/Features";
import { Components } from "./ui/Components";
import { I18nShowcase, type ShowcaseLocale } from "./ui/I18nShowcase";
import { SiteFooter } from "./ui/SiteFooter";
import { SiteHeader } from "./ui/SiteHeader";
import { Container, Section } from "./ui/layout";
import {
  clearShowcaseTweaksStorage,
  createDefaultShowcaseTweaks,
  getInitialShowcaseTweaks,
  persistShowcaseTweaks,
} from "./ui/showcaseTweaks";
import { TweaksPanel } from "./ui/TweaksPanel";

function getInitialTheme(): TKTheme {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "dark";
  }

  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function App() {
  const [theme, setTheme] = useState<TKTheme>(getInitialTheme);
  const [locale, setLocale] = useState<ShowcaseLocale>("en");
  const [tweaks, setTweaks] = useState(getInitialShowcaseTweaks);
  const [defaultAccent, setDefaultAccent] = useState<string | null>(null);

  const handleDefaultAccentResolved = useCallback((accent: string) => {
    setDefaultAccent(accent);
    setTweaks((current) => current.accent === null ? { ...current, accent } : current);
  }, []);

  const resetTweaks = () => {
    clearShowcaseTweaksStorage();
    setTweaks(createDefaultShowcaseTweaks(defaultAccent));
  };

  useEffect(() => {
    if (defaultAccent) persistShowcaseTweaks(tweaks, defaultAccent);
  }, [defaultAccent, tweaks]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <TKProvider
      theme={theme}
      accent={tweaks.accent ?? undefined}
      roundness={tweaks.roundness}
      motionSpeed={tweaks.motionSpeed}
      fontSize={tweaks.fontSize}
      className="showcase"
      testId="showcase-root"
    >
      <TKLocaleProvider locale={locale === "ru" ? ruLocale : enLocale}>
        <TKToastProvider>
          <a className="skip-link" href="#components">
            Skip to components
          </a>

          <SiteHeader
            theme={theme}
            onThemeToggle={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
          />

          <main>
            <Section className="showcase-hero" id="hero" reveal={false}>
              <Container>
                <Hero theme={theme} />
              </Container>
            </Section>

            <Section className="showcase-features" id="features" reveal={false}>
              <Container>
                <Features theme={theme} />
              </Container>
            </Section>

            <Section className="showcase-components" id="components" reveal={false}>
              <Container>
                <Components theme={theme} />
              </Container>
            </Section>

            <Section className="showcase-tweaks" id="tweaks" revealIndex={3}>
              <Container>
                <TweaksPanel
                  theme={theme}
                  tweaks={tweaks}
                  onChange={setTweaks}
                  onDefaultAccentResolved={handleDefaultAccentResolved}
                  onReset={resetTweaks}
                />
              </Container>
            </Section>

            <Section className="showcase-i18n" id="i18n" revealIndex={4}>
              <Container>
                <I18nShowcase locale={locale} onLocaleChange={setLocale} />
              </Container>
            </Section>
          </main>

          <SiteFooter />
        </TKToastProvider>
      </TKLocaleProvider>
    </TKProvider>
  );
}

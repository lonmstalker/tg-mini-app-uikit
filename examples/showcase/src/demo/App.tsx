import { useCallback, useEffect, useState } from "react";
import {
  enLocale,
  ruLocale,
  TKIcon,
  TKLocaleProvider,
  TKNoticeBar,
  TKProvider,
  TKToastProvider,
} from "tg-mini-app-uikit";
import { SiteFooter } from "../shared/SiteFooter";
import { SiteHeader } from "../shared/SiteHeader";
import { useSiteLocale } from "../shared/i18n";
import { Container, Section } from "../shared/layout";
import { TELEGRAM_DEMO_URL } from "../shared/links";
import { useSiteTheme } from "../shared/theme";
import { Components } from "./Components";
import { Features } from "./Features";
import { Hero } from "./Hero";
import { I18nShowcase } from "./I18nShowcase";
import {
  clearShowcaseTweaksStorage,
  createDefaultShowcaseTweaks,
  getInitialShowcaseTweaks,
  persistShowcaseTweaks,
} from "./showcaseTweaks";
import { TweaksPanel } from "./TweaksPanel";

export function App() {
  const { theme, toggleTheme } = useSiteTheme();
  const { locale, strings } = useSiteLocale();
  const [tweaks, setTweaks] = useState(getInitialShowcaseTweaks);
  const [defaultAccent, setDefaultAccent] = useState<string | null>(null);
  const navigation = [
    { href: "#features", label: strings.demo.navigation.features },
    { href: "#components", label: strings.demo.navigation.components },
    { href: "#tweaks", label: strings.demo.navigation.tweaks },
    { href: "#i18n", label: strings.demo.navigation.i18n },
  ] as const;

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
            {strings.demo.skipToComponents}
          </a>

          <SiteHeader
            theme={theme}
            onThemeToggle={toggleTheme}
            navigation={navigation}
            wordmarkHref="../"
            wordmarkContext={strings.demo.navigation.context}
            utilityLink={{ href: "../", label: strings.demo.navigation.landing }}
          />

          <main>
            <Container className="demo-browser-notice">
              <TKNoticeBar
                className="demo-browser-notice-bar"
                icon={<TKIcon name="info" size={18} />}
                action={
                  <a href={TELEGRAM_DEMO_URL} target="_blank" rel="noopener noreferrer">
                    {strings.demo.notice.action}
                  </a>
                }
                testId="browser-demo-notice"
              >
                {strings.demo.notice.copy}
              </TKNoticeBar>
            </Container>

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
                <I18nShowcase />
              </Container>
            </Section>
          </main>

          <SiteFooter />
        </TKToastProvider>
      </TKLocaleProvider>
    </TKProvider>
  );
}

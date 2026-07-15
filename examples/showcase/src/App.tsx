import { useCallback, useEffect, useState } from "react";
import { TKProvider, TKToastProvider, type TKTheme } from "tg-mini-app-uikit";
import { Hero } from "./ui/Hero";
import { Features } from "./ui/Features";
import { Components } from "./ui/Components";
import { SiteFooter } from "./ui/SiteFooter";
import { SiteHeader } from "./ui/SiteHeader";
import { Container, Section, SectionTitle } from "./ui/layout";
import {
  clearShowcaseTweaksStorage,
  createDefaultShowcaseTweaks,
  getInitialShowcaseTweaks,
  persistShowcaseTweaks,
} from "./ui/showcaseTweaks";
import { TweaksPanel } from "./ui/TweaksPanel";

const sections = [
  { id: "i18n", title: "Internationalization" },
] as const;

function getInitialTheme(): TKTheme {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "dark";
  }

  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function App() {
  const [theme, setTheme] = useState<TKTheme>(getInitialTheme);
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

          {sections.map(({ id, title }, index) => (
            <Section id={id} key={id} revealIndex={index + 4}>
              <Container>
                <SectionTitle id={`${id}-title`}>{title}</SectionTitle>
              </Container>
            </Section>
          ))}
        </main>

        <SiteFooter />
      </TKToastProvider>
    </TKProvider>
  );
}

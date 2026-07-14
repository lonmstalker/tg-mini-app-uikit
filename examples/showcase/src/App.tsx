import { useState } from "react";
import { TKProvider, type TKTheme } from "tg-mini-app-uikit";
import { SiteFooter } from "./ui/SiteFooter";
import { SiteHeader } from "./ui/SiteHeader";
import { Container, Section, SectionTitle } from "./ui/layout";

const sections = [
  { id: "features", title: "Features" },
  { id: "components", title: "Components" },
  { id: "tweaks", title: "Tweaks" },
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

  return (
    <TKProvider theme={theme} className="showcase">
      <a className="skip-link" href="#components">
        Skip to components
      </a>

      <SiteHeader
        theme={theme}
        onThemeToggle={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
      />

      <main>
        <Section className="showcase-hero" id="hero">
          <Container>
            <SectionTitle as="h1" id="hero-title">
              iOS-flavored UI kit for Telegram Mini Apps
            </SectionTitle>
          </Container>
        </Section>

        {sections.map(({ id, title }, index) => (
          <Section id={id} key={id} revealIndex={index + 1}>
            <Container>
              <SectionTitle id={`${id}-title`}>{title}</SectionTitle>
            </Container>
          </Section>
        ))}
      </main>

      <SiteFooter />
    </TKProvider>
  );
}

import { useState } from "react";
import { TKProvider, TKToastProvider, type TKTheme } from "tg-mini-app-uikit";
import { Hero } from "./ui/Hero";
import { Features } from "./ui/Features";
import { Components } from "./ui/Components";
import { SiteFooter } from "./ui/SiteFooter";
import { SiteHeader } from "./ui/SiteHeader";
import { Container, Section, SectionTitle } from "./ui/layout";

const sections = [
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

          {sections.map(({ id, title }, index) => (
            <Section id={id} key={id} revealIndex={index + 3}>
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

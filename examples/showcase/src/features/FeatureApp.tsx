import { TKProvider, TKToastProvider } from "tg-mini-app-uikit";
import { useSiteLocale } from "../shared/i18n";
import { SiteFooter } from "../shared/SiteFooter";
import { SiteHeader } from "../shared/SiteHeader";
import { Container, Section, SectionTitle } from "../shared/layout";
import { useSiteTheme } from "../shared/theme";
import { FEATURE_CONTENT, type FeatureBlock, type FeatureSlug } from "./content";

function resolveHref(href: string): string {
  return /^https?:/.test(href) ? href : `${import.meta.env.BASE_URL}${href}`;
}

function Block({ block }: { block: FeatureBlock }) {
  return (
    <article className="feature-page-block">
      <h3>{block.heading}</h3>
      <p>{block.body}</p>
      {block.code ? <code className="feature-page-code">{block.code}</code> : null}
      {block.links?.length ? (
        <p className="feature-page-links">
          {block.links.map((link) => (
            <a key={link.href} href={resolveHref(link.href)}>
              {link.label} <span aria-hidden="true">→</span>
            </a>
          ))}
        </p>
      ) : null}
    </article>
  );
}

export function FeatureApp({ slug }: { slug: FeatureSlug }) {
  const { theme, toggleTheme } = useSiteTheme();
  const { locale, strings } = useSiteLocale();
  const content = FEATURE_CONTENT[locale][slug];
  const base = import.meta.env.BASE_URL;

  return (
    <TKProvider theme={theme} className="landing feature-page" testId="feature-page-root">
      <TKToastProvider>
        <SiteHeader
          theme={theme}
          onThemeToggle={toggleTheme}
          navigation={[]}
          wordmarkHref={base}
          utilityLink={{ href: `${base}demo/`, label: strings.landing.navigation.demo }}
        />

        <main>
          <Section className="feature-page-hero" id="feature" labelledBy="feature-title" reveal={false}>
            <Container>
              <p className="landing-eyebrow">{content.eyebrow}</p>
              <SectionTitle as="h1" id="feature-title">
                {content.title}
              </SectionTitle>
              <p className="feature-page-intro">{content.intro}</p>
            </Container>
          </Section>

          <Section className="feature-page-body" id="details" labelledBy="feature-title" reveal={false}>
            <Container>
              <div className="feature-page-grid" data-testid="feature-blocks">
                {content.blocks.map((block) => (
                  <Block key={block.heading} block={block} />
                ))}
              </div>
            </Container>
          </Section>
        </main>

        <SiteFooter />
      </TKToastProvider>
    </TKProvider>
  );
}

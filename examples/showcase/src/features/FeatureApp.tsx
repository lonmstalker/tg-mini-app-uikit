import { useMemo, useState } from "react";
import { createMockTelegram } from "@tg-mini-app/telegram/testing";
import {
  TKBadge,
  TKButton,
  TKIcon,
  TKMainButton,
  TKProvider,
  TKSlider,
  TKTelegramProvider,
  TKToastProvider,
  useTKBusyAnnounce,
  type TKBusyState,
  type TKIconName,
} from "tg-mini-app-uikit";
import { resolveTokenHex } from "../demo/themeColors";
import { useSiteLocale } from "../shared/i18n";
import { SiteFooter } from "../shared/SiteFooter";
import { SiteHeader } from "../shared/SiteHeader";
import { Container, Section, SectionTitle } from "../shared/layout";
import { useSiteTheme } from "../shared/theme";
import { BLOCK_META, FEATURE_CONTENT, type FeatureBlock, type FeatureBlockMeta, type FeatureSlug } from "./content";

function resolveHref(href: string): string {
  return /^https?:/.test(href) ? href : `${import.meta.env.BASE_URL}${href}`;
}

function Block({ block, meta }: { block: FeatureBlock; meta: FeatureBlockMeta }) {
  return (
    <article className="feature-page-block">
      <span className={`landing-feature-icon landing-feature-icon--${meta.tone}`}>
        <TKIcon name={meta.icon as TKIconName} size={20} />
      </span>
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

/* ---- live hero demos, one per page — small, kit-only, interaction-driven ---- */

function TelegramDemo({ copy }: { copy: Record<string, string> }) {
  const telegram = useMemo(() => createMockTelegram({ colorScheme: "dark" }), []);
  return (
    <TKTelegramProvider webApp={telegram.webApp} signalReady={false}>
      <TKProvider telegram className="feature-hero-device">
        <div className="feature-hero-device-body">
          <span>Team offsite</span>
          <strong>$640</strong>
        </div>
        <TKMainButton
          label={copy.button}
          successLabel={copy.success}
          onClick={() => new Promise<void>((resolve) => window.setTimeout(resolve, 650))}
          style={{ background: "var(--tk-accent)" }}
          testId="feature-hero-mainbutton"
        />
      </TKProvider>
    </TKTelegramProvider>
  );
}

function MotionDemo({ copy }: { copy: Record<string, string> }) {
  const [value, setValue] = useState(64);
  return (
    <div className="feature-hero-panel">
      <TKSlider value={value} onChange={setValue} label={copy.slider} suffix="%" testId="feature-hero-slider" />
      <TKButton variant="tonal" className="tk-press">
        {copy.press}
      </TKButton>
    </div>
  );
}

function AccessibilityDemo({ copy }: { copy: Record<string, string> }) {
  const [busy, setBusy] = useState<TKBusyState>("idle");
  const liveRegion = useTKBusyAnnounce(busy, { loadingText: copy.loading, doneText: copy.done });
  const visible = busy === "loading" ? copy.loading : busy === "done" ? copy.done : copy.idle;

  return (
    <div className="feature-hero-panel">
      <TKButton
        variant="outline"
        onClick={() => {
          setBusy("loading");
          window.setTimeout(() => setBusy("done"), 900);
        }}
      >
        {copy.run}
      </TKButton>
      <p className="feature-hero-live">
        <span aria-hidden="true">{copy.hears}</span>
        <strong>{visible}</strong>
      </p>
      {liveRegion}
    </div>
  );
}

function ArchitectureDemo() {
  return (
    <div className="feature-hero-panel feature-hero-badges">
      <TKBadge soft>~60 kB brotli</TKBadge>
      <TKBadge soft tone="green">0 deps</TKBadge>
      <TKBadge soft tone="gray">1246 tests</TKBadge>
      <TKBadge soft tone="gray">MIT</TKBadge>
    </div>
  );
}

const THEMING_SWATCH_TOKENS = ["--tk-accent", "--tk-green", "--tk-orange", "--tk-red"] as const;

function ThemingDemo({ copy }: { copy: Record<string, string> }) {
  const [accent, setAccent] = useState<string | null>(null);
  const [swatches, setSwatches] = useState<string[]>([]);

  return (
    <div
      className="feature-hero-panel"
      ref={(node) => {
        if (node && !swatches.length) {
          setSwatches(THEMING_SWATCH_TOKENS.map((token) => resolveTokenHex(node, token) ?? "#3390ec"));
        }
      }}
    >
      <div className="feature-hero-swatches" role="group" aria-label={copy.caption}>
        {swatches.map((hex) => (
          <button
            key={hex}
            type="button"
            aria-pressed={accent === hex}
            style={{ background: hex }}
            onClick={() => setAccent(hex)}
          />
        ))}
      </div>
      <TKProvider accent={accent ?? undefined} className="feature-hero-sample">
        <span style={{ color: "var(--tk-accent-ink)" }}>{copy.sample}</span>
        <TKButton size="sm">{copy.action}</TKButton>
      </TKProvider>
    </div>
  );
}

function HeroDemo({ slug, copy }: { slug: FeatureSlug; copy: Record<string, string> }) {
  const demo =
    slug === "telegram" ? (
      <TelegramDemo copy={copy} />
    ) : slug === "motion" ? (
      <MotionDemo copy={copy} />
    ) : slug === "accessibility" ? (
      <AccessibilityDemo copy={copy} />
    ) : slug === "architecture" ? (
      <ArchitectureDemo />
    ) : (
      <ThemingDemo copy={copy} />
    );

  return (
    <figure className="feature-hero-demo" data-testid="feature-hero-demo">
      {demo}
      {copy.caption ? <figcaption>{copy.caption}</figcaption> : null}
    </figure>
  );
}

export function FeatureApp({ slug }: { slug: FeatureSlug }) {
  const { theme, toggleTheme } = useSiteTheme();
  const { locale, strings } = useSiteLocale();
  const content = FEATURE_CONTENT[locale][slug];
  const meta = BLOCK_META[slug];
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
            <Container className="feature-hero-grid">
              <div>
                <p className="landing-eyebrow">{content.eyebrow}</p>
                <SectionTitle as="h1" id="feature-title">
                  {content.title}
                </SectionTitle>
                <p className="feature-page-intro">{content.intro}</p>
              </div>
              <HeroDemo slug={slug} copy={content.demo} />
            </Container>
          </Section>

          <Section className="feature-page-body" id="details" labelledBy="feature-title" reveal={false}>
            <Container>
              <div className="feature-page-grid" data-testid="feature-blocks">
                {content.blocks.map((block, index) => (
                  <Block key={block.heading} block={block} meta={meta[index] ?? { icon: "sparkles", tone: "accent" }} />
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

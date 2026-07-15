import {
  TKBadge,
  TKButton,
  TKIcon,
  TKIconButton,
  TKProvider,
  TKToastProvider,
  useTKToast,
  type TKIconName,
} from "tg-mini-app-uikit";
import quickstartSource from "../snippets/quickstart.snippet.tsx?raw";
import { SiteFooter } from "../shared/SiteFooter";
import { SiteHeader } from "../shared/SiteHeader";
import { copyText } from "../shared/clipboard";
import { useSiteLocale } from "../shared/i18n";
import { Container, Section, SectionTitle } from "../shared/layout";
import { TELEGRAM_DEMO_URL } from "../shared/links";
import { useSiteTheme } from "../shared/theme";

const INSTALL_COMMAND = "npm i tg-mini-app-uikit";
const GITHUB_URL = "https://github.com/lonmstalker/tg-mini-app-uikit";
const NPM_URL = "https://www.npmjs.com/package/tg-mini-app-uikit";

interface Feature {
  title: string;
  copy: string;
  icon: TKIconName;
  tone: "accent" | "green" | "orange";
  href: string;
  wide?: boolean;
}

export function App() {
  const { theme, toggleTheme } = useSiteTheme();
  const { strings } = useSiteLocale();
  const base = import.meta.env.BASE_URL;
  const navigation = [
    { href: "#features", label: strings.landing.navigation.features },
    { href: "#code", label: strings.landing.navigation.code },
    { href: "#get-started", label: strings.landing.navigation.getStarted },
  ] as const;

  return (
    <TKProvider theme={theme} className="landing" testId="landing-root">
      <TKToastProvider>
        <a className="skip-link" href="#features">
          {strings.landing.skipToFeatures}
        </a>

        <SiteHeader
          theme={theme}
          onThemeToggle={toggleTheme}
          navigation={navigation}
          wordmarkHref="#hero"
          utilityLink={{ href: `${base}demo/`, label: strings.landing.navigation.demo }}
        />

        <main>
          <LandingHero base={base} />
          <FeatureSection base={base} />
          <CodeSection />
          <GetStartedSection base={base} />
          <ExploreSection base={base} />
        </main>

        <SiteFooter />
      </TKToastProvider>
    </TKProvider>
  );
}

function LandingHero({ base }: { base: string }) {
  const { strings } = useSiteLocale();
  const copy = strings.landing.hero;

  return (
    <TKProvider theme="dark" className="landing-hero-theme">
      <Section
        className="landing-hero"
        id="hero"
        labelledBy="landing-hero-title"
        reveal={false}
      >
        <Container className="landing-hero-grid">
          <div className="landing-hero-copy">
            <h1 id="landing-hero-title">
              {copy.titleBefore}{" "}
              <span className="landing-hero-title-accent">{copy.titleAccent}</span>
              {copy.titleAfter}
            </h1>
            <p className="landing-hero-subline">
              {copy.subline}
            </p>

            <div className="landing-install" aria-label={`${copy.installWith} ${INSTALL_COMMAND}`}>
              <code>{INSTALL_COMMAND}</code>
              <CopyButton
                text={INSTALL_COMMAND}
                label={copy.copyInstall}
                successMessage={copy.installCopied}
                testId="landing-install-copy"
              />
            </div>

            <div className="landing-badges" aria-label={copy.packageFacts}>
              <TKBadge soft>~60 kB brotli</TKBadge>
              <TKBadge soft tone="green">1245 tests</TKBadge>
              <TKBadge soft tone="gray">MIT</TKBadge>
              <TKBadge soft tone="gray">v{__TK_PACKAGE_VERSION__}</TKBadge>
            </div>

            <div className="landing-hero-actions">
              <TKButton
                as="a"
                href={TELEGRAM_DEMO_URL}
                target="_blank"
                rel="noopener noreferrer"
                icon="send"
                size="lg"
                testId="landing-telegram-cta"
              >
                {copy.openTelegram}
              </TKButton>
              <TKButton as="a" href={`${base}docs/`} icon="arrowRight" size="lg" variant="outline">
                {copy.getStarted}
              </TKButton>
            </div>

            <div className="landing-hero-links">
              <TKButton
                as="a"
                href={`${base}demo/`}
                size="lg"
                variant="plain"
                testId="landing-demo-cta"
              >
                {copy.browserDemo}
              </TKButton>
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                <TKIcon name="star" size={18} />
                {copy.starGithub}
              </a>
            </div>
          </div>

          <StaticWallet />
        </Container>
      </Section>
    </TKProvider>
  );
}

function StaticWallet() {
  const { strings } = useSiteLocale();
  const copy = strings.landing.wallet;

  return (
    <figure className="landing-phone-figure">
      <div
        className="landing-phone"
        role="img"
        aria-label={copy.preview}
      >
        <div className="landing-phone-screen">
          <div className="landing-statusbar" aria-hidden="true">
            <span>9:41</span>
            <span className="landing-dynamic-island" />
            <span>●●●</span>
          </div>

          <div className="landing-wallet-toolbar">
            <span className="landing-wallet-app-icon"><TKIcon name="wallet" size={18} /></span>
            <strong>{copy.wallet}</strong>
            <TKIcon name="dots" size={20} />
          </div>

          <div className="landing-balance">
            <span>{copy.totalBalance}</span>
            <strong>$12,480.72</strong>
          </div>

          <div className="landing-bank-card">
            <span>{copy.everyday}</span>
            <TKIcon name="card" size={22} />
            <strong>•••• 4821</strong>
          </div>

          <div className="landing-wallet-actions" aria-hidden="true">
            <span><TKIcon name="send" size={18} /> {copy.send}</span>
            <span><TKIcon name="plus" size={18} /> {copy.add}</span>
            <span><TKIcon name="qr" size={18} /> {copy.scan}</span>
          </div>

          <div className="landing-activity-heading">
            <strong>{copy.activity}</strong>
            <span>{copy.today}</span>
          </div>

          <div className="landing-activity-list">
            <div>
              <span className="landing-activity-icon"><TKIcon name="gift" size={16} /></span>
              <span><strong>Telegram Premium</strong><small>{copy.subscription}</small></span>
              <strong>−$4.99</strong>
            </div>
            <div>
              <span className="landing-activity-icon"><TKIcon name="arrowRight" size={16} /></span>
              <span><strong>{copy.transferReceived}</strong><small>Alex Morgan</small></span>
              <strong className="landing-positive">+$280</strong>
            </div>
          </div>

          <div className="landing-main-button">{copy.sendPayment}</div>
          <div className="landing-home-indicator" aria-hidden="true" />
        </div>
      </div>
      <figcaption>{copy.caption}</figcaption>
    </figure>
  );
}

function FeatureSection({ base }: { base: string }) {
  const { strings } = useSiteLocale();
  const copy = strings.landing.features;
  const features: Feature[] = [
    {
      title: copy.gesturesTitle,
      copy: copy.gesturesCopy,
      icon: "fingerprint",
      tone: "accent",
      href: `${base}demo/#components`,
      wide: true,
    },
    {
      title: copy.telegramTitle,
      copy: copy.telegramCopy,
      icon: "phone",
      tone: "accent",
      href: `${base}storybook/?path=/story/foundation-telegram--runtime-provider`,
      wide: true,
    },
    {
      title: copy.motionTitle,
      copy: copy.motionCopy,
      icon: "bolt",
      tone: "orange",
      href: `${base}storybook/?path=/story/foundation-motion--keyframe-library`,
    },
    {
      title: copy.accessibilityTitle,
      copy: copy.accessibilityCopy,
      icon: "shield",
      tone: "green",
      href: `${base}storybook/?path=/story/atoms-controls--binary-controls`,
    },
    {
      title: copy.dependenciesTitle,
      copy: copy.dependenciesCopy,
      icon: "document",
      tone: "orange",
      href: `${base}docs/`,
    },
    {
      title: copy.i18nTitle,
      copy: copy.i18nCopy,
      icon: "globe",
      tone: "green",
      href: `${base}storybook/?path=/story/foundation-i18n--localized-controls`,
    },
  ];

  return (
    <Section className="landing-features" id="features">
      <Container>
        <LandingSectionHeading
          eyebrow={copy.eyebrow}
          title={copy.title}
          titleId="features-title"
          intro={copy.intro}
        />

        <div className="landing-feature-grid">
          {features.map((feature) => (
            <a
              className={`landing-feature${feature.wide ? " landing-feature--wide" : ""}`}
              href={feature.href}
              key={feature.title}
            >
              <span className={`landing-feature-icon landing-feature-icon--${feature.tone}`}>
                <TKIcon name={feature.icon} size={22} />
              </span>
              <span>
                <strong>{feature.title}</strong>
                <small>{feature.copy}</small>
              </span>
              <TKIcon name="arrowRight" size={18} />
            </a>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function CodeSection() {
  const { strings } = useSiteLocale();
  const copy = strings.landing.code;

  return (
    <Section className="landing-code" id="code">
      <Container className="landing-code-grid">
        <div className="landing-code-copy">
          <LandingSectionHeading
            className="landing-section-heading--code"
            eyebrow={copy.eyebrow}
            title={copy.title}
            titleId="code-title"
            intro={copy.copy}
          />
          <a href={`${import.meta.env.BASE_URL}docs/`}>{copy.guide}</a>
        </div>

        <div className="landing-code-panel">
          <div className="landing-code-toolbar">
            <span className="landing-code-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span className="landing-code-filename">WalletScreen.tsx</span>
            <CopyButton
              text={quickstartSource.trimEnd()}
              label={copy.copyQuickstart}
              successMessage={copy.quickstartCopied}
              testId="landing-code-copy"
            />
          </div>
          <pre aria-label={copy.quickstartAria} tabIndex={0}>
            <code>{quickstartSource.trimEnd()}</code>
          </pre>
        </div>
      </Container>
    </Section>
  );
}

function GetStartedSection({ base }: { base: string }) {
  const { strings } = useSiteLocale();
  const copy = strings.landing.getStarted;

  return (
    <Section className="landing-get-started" id="get-started">
      <Container>
        <LandingSectionHeading
          eyebrow={copy.eyebrow}
          title={copy.title}
          titleId="get-started-title"
          intro={copy.intro}
        />

        <ol className="landing-steps">
          <li>
            <span>1</span>
            <div>
              <strong>{copy.install}</strong>
              <code>{INSTALL_COMMAND}</code>
            </div>
          </li>
          <li>
            <span>2</span>
            <div>
              <strong>{copy.wrap}</strong>
              <code>{"<TKTelegramProvider><TKProvider telegram>…"}</code>
            </div>
          </li>
          <li>
            <span>3</span>
            <div>
              <strong>{copy.ship}</strong>
              <a href={`${base}docs/telegram-platform.html`}>{copy.connect}</a>
            </div>
          </li>
        </ol>
      </Container>
    </Section>
  );
}

function ExploreSection({ base }: { base: string }) {
  const { strings } = useSiteLocale();
  const copy = strings.landing.explore;
  const links = [
    { label: copy.telegramLabel, copy: copy.telegramCopy, href: TELEGRAM_DEMO_URL, external: true },
    { label: copy.browserLabel, copy: copy.browserCopy, href: `${base}demo/` },
    { label: copy.storybookLabel, copy: copy.storybookCopy, href: `${base}storybook/` },
    { label: copy.docsLabel, copy: copy.docsCopy, href: `${base}docs/` },
    { label: copy.npmLabel, copy: copy.npmCopy, href: NPM_URL, external: true },
    { label: copy.githubLabel, copy: copy.githubCopy, href: GITHUB_URL, external: true },
  ];

  return (
    <Section className="landing-explore" id="explore" labelledBy="explore-title">
      <Container>
        <LandingSectionHeading
          className="landing-section-heading--explore"
          eyebrow={copy.eyebrow}
          title={copy.title}
          titleId="explore-title"
        />
        <div className="landing-explore-links">
          {links.map((link) => (
            <a
              href={link.href}
              key={link.label}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
            >
              <span><strong>{link.label}</strong><small>{link.copy}</small></span>
              <TKIcon name={link.external ? "externalLink" : "arrowRight"} size={18} />
            </a>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function LandingSectionHeading({
  eyebrow,
  title,
  titleId,
  intro,
  className,
}: {
  eyebrow: string;
  title: string;
  titleId: string;
  intro?: string;
  className?: string;
}) {
  return (
    <div className={["landing-section-heading", className].filter(Boolean).join(" ")}>
      <p className="landing-eyebrow">{eyebrow}</p>
      <SectionTitle id={titleId}>{title}</SectionTitle>
      {intro ? <p>{intro}</p> : null}
    </div>
  );
}

function CopyButton({
  text,
  label,
  successMessage,
  testId,
}: {
  text: string;
  label: string;
  successMessage: string;
  testId: string;
}) {
  const toast = useTKToast();
  const { strings } = useSiteLocale();

  const onCopy = async () => {
    if (await copyText(text)) toast.success(successMessage);
    else toast.error(strings.landing.copyError);
  };

  return (
    <TKIconButton
      icon="copy"
      label={label}
      onClick={onCopy}
      variant="plain"
      testId={testId}
    />
  );
}

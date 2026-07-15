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
import { Container, Section, SectionTitle } from "../shared/layout";
import { TELEGRAM_DEMO_URL } from "../shared/links";
import { useSiteTheme } from "../shared/theme";

const INSTALL_COMMAND = "npm i tg-mini-app-uikit";
const GITHUB_URL = "https://github.com/lonmstalker/tg-mini-app-uikit";
const NPM_URL = "https://www.npmjs.com/package/tg-mini-app-uikit";

const navigation = [
  { href: "#features", label: "Features" },
  { href: "#code", label: "Code" },
  { href: "#get-started", label: "Get started" },
] as const;

interface Feature {
  title: string;
  copy: string;
  icon: TKIconName;
  href: string;
  wide?: boolean;
}

export function App() {
  const { theme, toggleTheme } = useSiteTheme();
  const base = import.meta.env.BASE_URL;

  return (
    <TKProvider theme={theme} className="landing" testId="landing-root">
      <TKToastProvider>
        <a className="skip-link" href="#features">
          Skip to features
        </a>

        <SiteHeader
          theme={theme}
          onThemeToggle={toggleTheme}
          navigation={navigation}
          wordmarkHref="#hero"
          utilityLink={{ href: `${base}demo/`, label: "Demo" }}
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
  return (
    <Section
      className="landing-hero"
      id="hero"
      labelledBy="landing-hero-title"
      reveal={false}
    >
      <Container className="landing-hero-grid">
        <div className="landing-hero-copy">
          <h1 id="landing-hero-title">
            The iOS-flavored React UI kit for Telegram Mini Apps
          </h1>
          <p className="landing-hero-subline">
            Zero runtime dependencies · React 18 &amp; 19 · Bot API 9.6
          </p>

          <div className="landing-install" aria-label={`Install with ${INSTALL_COMMAND}`}>
            <code>{INSTALL_COMMAND}</code>
            <CopyButton
              text={INSTALL_COMMAND}
              label="Copy install command"
              successMessage="Install command copied"
              testId="landing-install-copy"
            />
          </div>

          <div className="landing-badges" aria-label="Package facts">
            <TKBadge soft>~60 kB brotli</TKBadge>
            <TKBadge soft tone="green">1235 tests</TKBadge>
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
              Open demo in Telegram
            </TKButton>
            <TKButton as="a" href={`${base}docs/`} icon="arrowRight" size="lg" variant="outline">
              Get started
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
              Browser demo — no Telegram required
            </TKButton>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              <TKIcon name="star" size={18} />
              Star on GitHub
            </a>
          </div>
        </div>

        <StaticWallet />
      </Container>
    </Section>
  );
}

function StaticWallet() {
  return (
    <figure className="landing-phone-figure">
      <div
        className="landing-phone"
        role="img"
        aria-label="Static preview of a wallet screen built with tg-mini-app-uikit"
      >
        <div className="landing-phone-screen">
          <div className="landing-statusbar" aria-hidden="true">
            <span>9:41</span>
            <span className="landing-dynamic-island" />
            <span>●●●</span>
          </div>

          <div className="landing-wallet-toolbar">
            <span className="landing-wallet-app-icon"><TKIcon name="wallet" size={18} /></span>
            <strong>Wallet</strong>
            <TKIcon name="dots" size={20} />
          </div>

          <div className="landing-balance">
            <span>Total balance</span>
            <strong>$12,480.72</strong>
          </div>

          <div className="landing-bank-card">
            <span>Everyday</span>
            <TKIcon name="card" size={22} />
            <strong>•••• 4821</strong>
          </div>

          <div className="landing-wallet-actions" aria-hidden="true">
            <span><TKIcon name="send" size={18} /> Send</span>
            <span><TKIcon name="plus" size={18} /> Add</span>
            <span><TKIcon name="qr" size={18} /> Scan</span>
          </div>

          <div className="landing-activity-heading">
            <strong>Activity</strong>
            <span>Today</span>
          </div>

          <div className="landing-activity-list">
            <div>
              <span className="landing-activity-icon"><TKIcon name="gift" size={16} /></span>
              <span><strong>Telegram Premium</strong><small>Subscription</small></span>
              <strong>−$4.99</strong>
            </div>
            <div>
              <span className="landing-activity-icon"><TKIcon name="arrowRight" size={16} /></span>
              <span><strong>Transfer received</strong><small>Alex Morgan</small></span>
              <strong className="landing-positive">+$280</strong>
            </div>
          </div>

          <div className="landing-main-button">Send payment</div>
          <div className="landing-home-indicator" aria-hidden="true" />
        </div>
      </div>
      <figcaption>Frozen UI · zero timers · built from the same token system</figcaption>
    </figure>
  );
}

function FeatureSection({ base }: { base: string }) {
  const features: Feature[] = [
    {
      title: "Native-feel gestures",
      copy: "Sheets, galleries, viewers, and edge-aware interactions feel at home in a mobile WebView.",
      icon: "fingerprint",
      href: `${base}demo/#components`,
      wide: true,
    },
    {
      title: "Telegram out of the box",
      copy: "Theme mapping, MainButton wrappers, safe areas, and haptics are first-class APIs.",
      icon: "phone",
      href: `${base}storybook/?path=/story/foundation-telegram--runtime-provider`,
      wide: true,
    },
    {
      title: "Motion with a budget",
      copy: "Compositor-only animation rules are enforced by CI, with reduced motion built in.",
      icon: "bolt",
      href: `${base}storybook/?path=/story/foundation-motion--keyframe-library`,
    },
    {
      title: "Accessible by default",
      copy: "Keyboard, focus, announcements, names, and touch targets are part of the component contract.",
      icon: "shield",
      href: `${base}storybook/?path=/story/atoms-controls--binary-controls`,
    },
    {
      title: "Zero runtime dependencies",
      copy: "The full package stays near 60 kB brotli without shipping a dependency graph to every app.",
      icon: "document",
      href: `${base}docs/`,
    },
    {
      title: "Theming and en/ru i18n",
      copy: "Semantic tokens and bundled English and Russian locales adapt the whole interface at the root.",
      icon: "globe",
      href: `${base}storybook/?path=/story/foundation-i18n--localized-controls`,
    },
  ];

  return (
    <Section className="landing-features" id="features">
      <Container>
        <div className="landing-section-heading">
          <SectionTitle id="features-title">Built for the constraints Telegram actually has</SectionTitle>
          <p>Production primitives, platform behavior, and proof in one source package.</p>
        </div>

        <div className="landing-feature-grid">
          {features.map((feature) => (
            <a
              className={`landing-feature${feature.wide ? " landing-feature--wide" : ""}`}
              href={feature.href}
              key={feature.title}
            >
              <TKIcon name={feature.icon} size={22} />
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
  return (
    <Section className="landing-code" id="code">
      <Container className="landing-code-grid">
        <div className="landing-code-copy">
          <SectionTitle id="code-title">From npm to a native-feel screen</SectionTitle>
          <p>
            Wrap once, compose normal React, and let the kit bridge Telegram behavior without
            taking over your app architecture.
          </p>
          <a href={`${import.meta.env.BASE_URL}docs/`}>Read the getting started guide →</a>
        </div>

        <div className="landing-code-panel">
          <div className="landing-code-toolbar">
            <span>WalletScreen.tsx</span>
            <CopyButton
              text={quickstartSource.trimEnd()}
              label="Copy quickstart code"
              successMessage="Quickstart code copied"
              testId="landing-code-copy"
            />
          </div>
          <pre aria-label="Typechecked React quickstart" tabIndex={0}>
            <code>{quickstartSource.trimEnd()}</code>
          </pre>
        </div>
      </Container>
    </Section>
  );
}

function GetStartedSection({ base }: { base: string }) {
  return (
    <Section className="landing-get-started" id="get-started">
      <Container>
        <div className="landing-section-heading">
          <SectionTitle id="get-started-title">Ship a Mini App in three moves</SectionTitle>
          <p>The shortest path keeps the platform details explicit.</p>
        </div>

        <ol className="landing-steps">
          <li>
            <span>1</span>
            <div>
              <strong>Install</strong>
              <code>{INSTALL_COMMAND}</code>
            </div>
          </li>
          <li>
            <span>2</span>
            <div>
              <strong>Wrap providers</strong>
              <code>{"<TKTelegramProvider><TKProvider telegram>…"}</code>
            </div>
          </li>
          <li>
            <span>3</span>
            <div>
              <strong>Ship in Telegram</strong>
              <a href={`${base}docs/telegram-platform.html`}>Connect and validate the platform layer →</a>
            </div>
          </li>
        </ol>
      </Container>
    </Section>
  );
}

function ExploreSection({ base }: { base: string }) {
  const links = [
    { label: "Telegram demo", copy: "Open the native Mini App experience", href: TELEGRAM_DEMO_URL, external: true },
    { label: "Browser demo", copy: "Try the showcase without Telegram", href: `${base}demo/` },
    { label: "Storybook", copy: "Inspect every component and state", href: `${base}storybook/` },
    { label: "Docs", copy: "Read guides and API contracts", href: `${base}docs/` },
    { label: "npm", copy: "Install the published package", href: NPM_URL, external: true },
    { label: "GitHub", copy: "Explore source, issues, and releases", href: GITHUB_URL, external: true },
  ];

  return (
    <Section className="landing-explore" id="explore" labelledBy="explore-title">
      <Container>
        <h2 id="explore-title">Explore the project</h2>
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

  const onCopy = async () => {
    if (await copyText(text)) toast.success(successMessage);
    else toast.error("Could not copy to the clipboard");
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

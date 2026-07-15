import { Container } from "./layout";
import { useSiteLocale } from "./i18n";
import { TELEGRAM_DEMO_URL } from "./links";
import { Wordmark } from "./Wordmark";

const CURRENT_YEAR = new Date().getFullYear();
const GITHUB_URL = "https://github.com/lonmstalker/tg-mini-app-uikit";
const ISSUES_URL = `${GITHUB_URL}/issues`;
const NPM_URL = "https://www.npmjs.com/package/tg-mini-app-uikit";

export function SiteFooter() {
  const { strings } = useSiteLocale();
  const copy = strings.shared.footer;
  const base = import.meta.env.BASE_URL;

  const productLinks = [
    { href: TELEGRAM_DEMO_URL, label: copy.telegramDemo, external: true },
    { href: `${base}demo/`, label: copy.browserDemo },
    { href: `${base}storybook/`, label: copy.storybook },
    { href: `${base}docs/`, label: copy.docs },
  ] as const;
  const communityLinks = [
    { href: GITHUB_URL, label: copy.github },
    { href: NPM_URL, label: copy.npm },
    { href: ISSUES_URL, label: copy.issues },
  ] as const;

  return (
    <footer className="site-footer" data-testid="site-footer">
      <Container className="site-footer-inner">
        <div className="site-footer-top">
          <div className="site-footer-brand">
            <Wordmark href={base} size="footer" tagline={copy.tagline} />
            <p className="site-footer-meta">
              v{__TK_PACKAGE_VERSION__} · {copy.license}
            </p>
          </div>

          <nav className="site-footer-navigation" aria-label={strings.shared.footerNavigation}>
            <FooterLinkGroup title={copy.product} links={productLinks} />
            <FooterLinkGroup title={copy.community} links={communityLinks} external />
          </nav>
        </div>

        <div className="site-footer-bottom">
          <span>© {CURRENT_YEAR} tg-mini-app-uikit</span>
          <span>{copy.license}</span>
          <span>{copy.credits}</span>
        </div>
      </Container>
    </footer>
  );
}

interface FooterLinkGroupProps {
  title: string;
  links: readonly { href: string; label: string; external?: boolean }[];
  external?: boolean;
}

function FooterLinkGroup({ title, links, external = false }: FooterLinkGroupProps) {
  return (
    <div className="site-footer-group">
      <h2>{title}</h2>
      <ul>
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              target={external || link.external ? "_blank" : undefined}
              rel={external || link.external ? "noopener noreferrer" : undefined}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

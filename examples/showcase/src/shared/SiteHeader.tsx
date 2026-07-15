import { useEffect, useMemo, useState } from "react";
import { TKIcon, type TKTheme } from "tg-mini-app-uikit";
import { useSiteLocale } from "./i18n";
import { Container } from "./layout";
import { Wordmark } from "./Wordmark";

export interface SiteLink {
  href: string;
  label: string;
}

function GitHubIcon() {
  return (
    <svg
      aria-hidden="true"
      className="github-icon"
      focusable="false"
      viewBox="0 0 24 24"
    >
      <path
        fill="currentColor"
        d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.86c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.58 9.58 0 0 1 12 6.83c.85 0 1.71.12 2.51.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.76c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"
      />
    </svg>
  );
}

interface SiteHeaderProps {
  theme: TKTheme;
  onThemeToggle: () => void;
  navigation: readonly SiteLink[];
  wordmarkHref: string;
  wordmarkContext?: string;
  utilityLink?: SiteLink;
}

function useActiveSection(navigation: readonly SiteLink[]) {
  const sectionKey = navigation.map(({ href }) => href).join(",");
  const sectionHrefs = useMemo(() => sectionKey.split(",").filter(Boolean), [sectionKey]);
  const [activeHref, setActiveHref] = useState<string | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const sections = sectionHrefs
      .map((href) => document.getElementById(href.slice(1)))
      .filter((section): section is HTMLElement => section !== null);
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

        if (current) {
          setActiveHref(`#${current.target.id}`);
          return;
        }

        setActiveHref((active) =>
          entries.some((entry) => !entry.isIntersecting && `#${entry.target.id}` === active)
            ? null
            : active,
        );
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [sectionHrefs]);

  return [activeHref, setActiveHref] as const;
}

export function SiteHeader({
  theme,
  onThemeToggle,
  navigation,
  wordmarkHref,
  wordmarkContext,
  utilityLink,
}: SiteHeaderProps) {
  const nextTheme = theme === "dark" ? "light" : "dark";
  const { locale, setLocale, strings } = useSiteLocale();
  const [activeHref, setActiveHref] = useActiveSection(navigation);

  return (
    <header className="site-header" data-testid="site-header">
      <Container className="site-header-inner">
        <Wordmark href={wordmarkHref} context={wordmarkContext} />

        <nav className="site-navigation" aria-label={strings.shared.primaryNavigation}>
          <ul>
            {navigation.map(({ href, label }) => (
              <li key={href}>
                <a
                  href={href}
                  aria-current={activeHref === href ? "location" : undefined}
                  data-testid={`site-nav-link-${href.replace(/^#/, "")}`}
                  onClick={() => setActiveHref(href)}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-header-actions">
          {utilityLink ? (
            <a className="site-header-link" href={utilityLink.href}>
              {utilityLink.label}
            </a>
          ) : null}
          <div className="site-locale-switch" role="group" aria-label={strings.shared.localeControl}>
            {(["en", "ru"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={locale === option}
                data-testid={`site-locale-${option}`}
                lang={option}
                onClick={() => setLocale(option)}
              >
                {option.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="site-icon-button"
            aria-label={
              nextTheme === "light"
                ? strings.shared.switchToLightTheme
                : strings.shared.switchToDarkTheme
            }
            onClick={onThemeToggle}
          >
            <TKIcon name={theme === "dark" ? "sun" : "moon"} size={20} />
          </button>
          <a
            className="site-icon-button"
            href="https://github.com/lonmstalker/tg-mini-app-uikit"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={strings.shared.githubRepository}
          >
            <GitHubIcon />
          </a>
        </div>
      </Container>
    </header>
  );
}

import { Container } from "./layout";
import { TELEGRAM_DEMO_URL } from "./links";

const githubUrl = "https://github.com/lonmstalker/tg-mini-app-uikit";
const npmUrl = "https://www.npmjs.com/package/tg-mini-app-uikit";

export function SiteFooter() {
  const storybookUrl = `${import.meta.env.BASE_URL}storybook/`;
  const docsUrl = `${import.meta.env.BASE_URL}docs/`;
  const browserDemoUrl = `${import.meta.env.BASE_URL}demo/`;

  return (
    <footer className="site-footer">
      <Container className="site-footer-inner">
        <div>
          <strong className="site-footer-wordmark">tg-mini-app-uikit</strong>
          <p className="site-footer-meta">
            v{__TK_PACKAGE_VERSION__} · MIT licensed
          </p>
        </div>

        <nav aria-label="Footer navigation">
          <ul className="site-footer-links">
            <li>
              <a href={TELEGRAM_DEMO_URL} target="_blank" rel="noopener noreferrer">
                Telegram demo
              </a>
            </li>
            <li>
              <a href={browserDemoUrl}>Browser demo</a>
            </li>
            <li>
              <a href={storybookUrl}>Storybook</a>
            </li>
            <li>
              <a href={docsUrl}>Docs</a>
            </li>
            <li>
              <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </li>
            <li>
              <a href={npmUrl} target="_blank" rel="noopener noreferrer">
                npm
              </a>
            </li>
          </ul>
        </nav>
      </Container>
    </footer>
  );
}

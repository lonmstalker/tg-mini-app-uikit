import { TKProvider } from "tg-mini-app-uikit";

const sections = [
  { id: "features", title: "Features" },
  { id: "components", title: "Components" },
  { id: "tweaks", title: "Tweaks" },
  { id: "i18n", title: "Internationalization" },
] as const;

export function App() {
  return (
    <TKProvider theme="dark" className="showcase">
      <a className="skip-link" href="#components">
        Skip to components
      </a>

      <header className="site-header">
        <div className="container">
          <strong>tg-mini-app-uikit</strong>
        </div>
      </header>

      <main>
        <section
          className="showcase-section showcase-hero"
          id="hero"
          aria-labelledby="hero-title"
        >
          <div className="container">
            <h1 id="hero-title">iOS-flavored UI kit for Telegram Mini Apps</h1>
          </div>
        </section>

        {sections.map(({ id, title }) => (
          <section
            className="showcase-section"
            id={id}
            aria-labelledby={`${id}-title`}
            key={id}
          >
            <div className="container">
              <h2 id={`${id}-title`}>{title}</h2>
            </div>
          </section>
        ))}
      </main>

      <footer className="site-footer">
        <div className="container">tg-mini-app-uikit</div>
      </footer>
    </TKProvider>
  );
}

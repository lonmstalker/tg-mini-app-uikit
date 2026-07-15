import { useState } from "react";
import {
  TKIconButton,
  TKOTP,
  TKSearch,
  TKSegmented,
  useTKToast,
} from "tg-mini-app-uikit";
import installSnippetSource from "../snippets/install.snippet.txt?raw";
import telegramSnippetSource from "../snippets/telegram.snippet.tsx?raw";
import themeSnippetSource from "../snippets/theme.snippet.tsx?raw";
import { copyText } from "./clipboard";
import { SectionTitle } from "./layout";

export type ShowcaseLocale = "en" | "ru";
type SnippetId = "install" | "theme" | "telegram";

const localeOptions = [
  { value: "en", label: "English" },
  { value: "ru", label: "Русский" },
];

const snippets: Record<SnippetId, { label: string; code: string }> = {
  install: { label: "Install", code: installSnippetSource.trimEnd() },
  theme: { label: "Theme", code: themeSnippetSource.trimEnd() },
  telegram: { label: "Telegram", code: telegramSnippetSource.trimEnd() },
};

const snippetOptions = Object.entries(snippets).map(([value, snippet]) => ({
  value,
  label: snippet.label,
}));

export function I18nShowcase({
  locale,
  onLocaleChange,
}: {
  locale: ShowcaseLocale;
  onLocaleChange: (locale: ShowcaseLocale) => void;
}) {
  return (
    <div className="i18n-layout">
      <header className="i18n-intro">
        <SectionTitle id="i18n-title">Internationalization, live</SectionTitle>
        <p>Site copy stays in English. The switch changes only strings owned by the kit.</p>
      </header>

      <div className="i18n-blocks">
        <LocaleDemo locale={locale} onLocaleChange={onLocaleChange} />
        <CodeSnippets />
      </div>
    </div>
  );
}

function LocaleDemo({
  locale,
  onLocaleChange,
}: {
  locale: ShowcaseLocale;
  onLocaleChange: (locale: ShowcaseLocale) => void;
}) {
  const [otp, setOtp] = useState("");

  return (
    <article className="i18n-card i18n-card--locale">
      <div className="i18n-card-header">
        <div>
          <h3>Live locale</h3>
          <p>Try the bundled English and Russian dictionaries without reloading.</p>
        </div>
        <div className="i18n-locale-control">
          <TKSegmented
            options={localeOptions}
            value={locale}
            onChange={(value) => onLocaleChange(value === "ru" ? "ru" : "en")}
            ariaLabel="Kit locale"
            testId="locale-switch"
          />
        </div>
      </div>

      <div className="i18n-demo-cluster" data-testid="locale-demo-cluster">
        <TKSearch showCancelAction={false} testId="locale-search" />
        <TKOTP
          length={4}
          value={otp}
          onChange={setOtp}
          onResend={() => setOtp("")}
          testId="locale-otp"
        />
      </div>

      <p className="i18n-demo-note">
        The hero PIN pad, ImageViewer counter, NoticeBar close label, and other kit demos follow this choice too.
      </p>
    </article>
  );
}

function CodeSnippets() {
  const [activeId, setActiveId] = useState<SnippetId>("install");
  const toast = useTKToast();
  const activeSnippet = snippets[activeId];

  const onCopy = async () => {
    if (await copyText(activeSnippet.code)) toast.success(`${activeSnippet.label} snippet copied`);
    else toast.error(`Could not copy the ${activeSnippet.label.toLowerCase()} snippet`);
  };

  return (
    <article className="i18n-card i18n-card--snippets">
      <div className="i18n-card-header">
        <div>
          <h3>Start with the public API</h3>
          <p>Short teasers from the getting started, theming, and Telegram guides.</p>
        </div>
        <TKIconButton
          icon="copy"
          label={`Copy ${activeSnippet.label} snippet`}
          onClick={onCopy}
          variant="tonal"
          testId="snippet-copy"
        />
      </div>

      <TKSegmented
        options={snippetOptions}
        value={activeId}
        onChange={(value) => setActiveId(value as SnippetId)}
        full
        ariaLabel="Code snippet"
        testId="snippet-tabs"
      />

      <pre
        className="snippet-code"
        aria-label={`${activeSnippet.label} code snippet`}
        data-testid="snippet-code"
        tabIndex={0}
      >
        <code>{activeSnippet.code}</code>
      </pre>
    </article>
  );
}

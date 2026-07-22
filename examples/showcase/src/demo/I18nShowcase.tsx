import { useRef, useState } from "react";
import {
  TKIconButton,
  TKOTP,
  TKPhoneInput,
  TKSearch,
  TKSegmented,
  TKTimeInput,
  useTKToast,
} from "tg-mini-app-uikit";
import installSnippetSource from "../snippets/install.snippet.txt?raw";
import telegramSnippetSource from "../snippets/telegram.snippet.tsx?raw";
import themeSnippetSource from "../snippets/theme.snippet.tsx?raw";
import { withScrollAnchor } from "../shared/anchorScroll";
import { copyText } from "../shared/clipboard";
import { useSiteLocale } from "../shared/i18n";
import { formatSiteString } from "../shared/strings";
import { SectionTitle } from "../shared/layout";

type SnippetId = "install" | "theme" | "telegram";

const snippetCode: Record<SnippetId, string> = {
  install: installSnippetSource.trimEnd(),
  theme: themeSnippetSource.trimEnd(),
  telegram: telegramSnippetSource.trimEnd(),
};

export function I18nShowcase() {
  const { strings } = useSiteLocale();
  const copy = strings.demo.i18n;

  return (
    <div className="i18n-layout">
      <header className="i18n-intro">
        <SectionTitle id="i18n-title">{copy.title}</SectionTitle>
        <p>{copy.intro}</p>
      </header>

      <div className="i18n-blocks">
        <LocaleDemo />
        <CodeSnippets />
      </div>
    </div>
  );
}

function LocaleDemo() {
  const { locale, setLocale, strings } = useSiteLocale();
  const copy = strings.demo.i18n;
  const controlRef = useRef<HTMLDivElement>(null);
  const localeOptions = [
    { value: "en", label: strings.shared.english },
    { value: "ru", label: strings.shared.russian },
  ];
  const [otp, setOtp] = useState("");

  return (
    <article className="i18n-card i18n-card--locale">
      <div className="i18n-card-header">
        <div>
          <h3>{copy.liveLocale}</h3>
          <p>{copy.liveCopy}</p>
        </div>
        <div className="i18n-locale-control" ref={controlRef}>
          <TKSegmented
            options={localeOptions}
            value={locale}
            onChange={(value) => {
              // Copy above this switch changes length with the locale — keep
              // the control pinned under the visitor's pointer.
              withScrollAnchor(controlRef.current, () => setLocale(value === "ru" ? "ru" : "en"));
            }}
            ariaLabel={copy.localeAria}
            testId="locale-switch"
          />
        </div>
      </div>

      <div className="i18n-demo-cluster" data-testid="locale-demo-cluster">
        <TKSearch showCancelAction={false} testId="locale-search" />
        {/* Locale-driven behavior defaults (REU-011): under ru this field masks
            +7 (###) ###-##-##, under any other locale it is free international
            input. Keyed by locale so the uncontrolled value re-derives from the
            new default instead of keeping the previous format. */}
        <TKPhoneInput
          key={`phone-${locale}`}
          label={copy.phoneLabel}
          hint={copy.phoneHint}
          testId="locale-phone"
        />
        {/* Localized validation strings (REU-012): an incomplete time shows the
            locale's invalidTime message live. */}
        <TKTimeInput label={copy.timeLabel} hint={copy.timeHint} testId="locale-time" />
        <TKOTP
          length={4}
          value={otp}
          onChange={setOtp}
          onResend={() => setOtp("")}
          testId="locale-otp"
        />
      </div>

      <p className="i18n-demo-note">
        {copy.note}
      </p>
    </article>
  );
}

function CodeSnippets() {
  const { strings } = useSiteLocale();
  const copy = strings.demo.i18n;
  const [activeId, setActiveId] = useState<SnippetId>("install");
  const toast = useTKToast();
  const snippets: Record<SnippetId, { label: string; code: string }> = {
    install: { label: copy.install, code: snippetCode.install },
    theme: { label: copy.theme, code: snippetCode.theme },
    telegram: { label: copy.telegram, code: snippetCode.telegram },
  };
  const snippetOptions = Object.entries(snippets).map(([value, snippet]) => ({
    value,
    label: snippet.label,
  }));
  const activeSnippet = snippets[activeId];

  const onCopy = async () => {
    if (await copyText(activeSnippet.code)) {
      toast.success(formatSiteString(copy.snippetCopied, { label: activeSnippet.label }));
    } else {
      toast.error(formatSiteString(copy.snippetCopyError, { label: activeSnippet.label }));
    }
  };

  return (
    <article className="i18n-card i18n-card--snippets">
      <div className="i18n-card-header">
        <div>
          <h3>{copy.snippetsTitle}</h3>
          <p>{copy.snippetsCopy}</p>
        </div>
        <TKIconButton
          icon="copy"
          label={formatSiteString(copy.copySnippet, { label: activeSnippet.label })}
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
        ariaLabel={copy.snippetTabs}
        testId="snippet-tabs"
      />

      <pre
        className="snippet-code"
        // Named, focusable scrollable region (axe: scrollable-region-focusable).
        role="region"
        aria-label={formatSiteString(copy.snippetAria, { label: activeSnippet.label })}
        data-testid="snippet-code"
        tabIndex={0}
      >
        <code>{activeSnippet.code}</code>
      </pre>
    </article>
  );
}

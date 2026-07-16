import { useEffect } from "react";
import { TKProvider, TKToastProvider } from "tg-mini-app-uikit";
import { useTelegramTheme } from "@tg-mini-app/telegram";
import { App } from "./App";
import { LangProvider } from "./i18n";
import { useStore } from "./store";
import { useMockHandle } from "./telegram/mock-context";

/*
 * Bridges the store to the kit providers. Real Telegram Mini Apps follow the
 * host client's light/dark scheme; the local mock keeps the Platform Lab
 * appearance toggle for demos and e2e. The other visual knobs and language come
 * from `themePrefs`, all persisted via DeviceStorage.
 */
export function AppFrame() {
  const { state, dispatch } = useStore();
  const mock = useMockHandle();
  const clientTheme = useTelegramTheme();
  const { themePrefs } = state;
  const activeTheme = mock ? themePrefs.colorScheme : clientTheme;

  // Keep the mock device chrome (status bar, etc.) in step with the chosen
  // scheme. ponytail: a real client owns its own chrome, so this is mock-only;
  // the kit theme below is driven straight from the pref in every environment.
  useEffect(() => {
    if (mock && mock.getState().colorScheme !== themePrefs.colorScheme) {
      mock.setColorScheme(themePrefs.colorScheme);
    }
  }, [mock, themePrefs.colorScheme]);

  return (
    <LangProvider
      lang={themePrefs.lang}
      onLangChange={(lang) => dispatch({ type: "SET_THEME_PREF", payload: { lang } })}
    >
      <TKProvider
        theme={activeTheme}
        telegram
        testId="app-root"
        accent={themePrefs.accent}
        roundness={themePrefs.roundness}
        motion={themePrefs.motion}
        fontSize={themePrefs.fontSize}
      >
        <TKToastProvider>
          <App />
        </TKToastProvider>
      </TKProvider>
    </LangProvider>
  );
}

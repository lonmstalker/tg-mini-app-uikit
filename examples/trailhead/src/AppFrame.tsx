import { useEffect } from "react";
import { TKProvider, TKToastProvider } from "tg-mini-app-uikit";
import { App } from "./App";
import { LangProvider } from "./i18n";
import { useStore } from "./store";
import { useMockHandle } from "./telegram/mock-context";

/*
 * Bridges the store to the kit providers. `themePrefs.colorScheme` is the single
 * source of truth for light/dark — seeded from the client at startup (see
 * store), then owned by the Platform Lab toggle so it works in mock AND real
 * clients. The other visual knobs and language come from `themePrefs` too, all
 * persisted via DeviceStorage. Lives inside StoreProvider so it reads hydrated
 * preferences.
 */
export function AppFrame() {
  const { state, dispatch } = useStore();
  const mock = useMockHandle();
  const { themePrefs } = state;

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
        theme={themePrefs.colorScheme}
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

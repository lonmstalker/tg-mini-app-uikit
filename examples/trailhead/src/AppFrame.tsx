import { useEffect } from "react";
import { TKProvider, TKToastProvider, useTelegramTheme } from "tg-mini-app-uikit";
import { App } from "./App";
import { LangProvider } from "./i18n";
import { useStore } from "./store";
import { useMockHandle } from "./telegram/mock-context";

/*
 * Bridges the store to the kit providers. The theme follows the (mock) Telegram
 * client's light/dark; the visual knobs, language and RTL come from `themePrefs`,
 * which Platform Lab (M4) drives and which persist via DeviceStorage. Lives
 * inside StoreProvider so it reads hydrated preferences.
 */
export function AppFrame() {
  const { state, dispatch } = useStore();
  const mock = useMockHandle();
  const theme = useTelegramTheme();
  const { themePrefs } = state;

  // Apply the persisted / Platform Lab colour scheme to the mock client (mock
  // mode only — a real client owns its own light/dark). `useTelegramTheme` then
  // reflects it, so dark mode survives a reload.
  useEffect(() => {
    if (mock && mock.getState().colorScheme !== themePrefs.colorScheme) {
      mock.setColorScheme(themePrefs.colorScheme);
    }
  }, [mock, themePrefs.colorScheme]);

  // Simulated device cutouts (notch / home indicator), mock mode only.
  useEffect(() => {
    mock?.setDeviceCutouts(themePrefs.cutouts);
  }, [mock, themePrefs.cutouts]);

  return (
    <LangProvider
      lang={themePrefs.lang}
      onLangChange={(lang) => dispatch({ type: "SET_THEME_PREF", payload: { lang } })}
      rtl={mock ? themePrefs.rtl : false}
      onRtlChange={(rtl) => dispatch({ type: "SET_THEME_PREF", payload: { rtl } })}
    >
      <TKProvider
        theme={theme}
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

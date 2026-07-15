import { TKLocaleProvider, TKProvider, ruLocale } from "tg-mini-app-uikit";

export function ThemePreview() {
  return (
    <TKProvider theme="dark" roundness={1.2} motionSpeed={1}>
      <TKLocaleProvider locale={ruLocale}><main /></TKLocaleProvider>
    </TKProvider>
  );
}

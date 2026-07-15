import { TKProvider, TKTelegramProvider } from "tg-mini-app-uikit";

export function TelegramPreview() {
  return (
    <TKTelegramProvider haptics>
      <TKProvider telegram>
        <main />
      </TKProvider>
    </TKTelegramProvider>
  );
}

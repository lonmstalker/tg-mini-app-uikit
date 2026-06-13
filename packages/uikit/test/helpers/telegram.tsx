import type { ReactNode } from "react";
import { afterEach, vi } from "vitest";
import { TKTelegramProvider, type TelegramWebApp } from "../../src/telegram";

export function wrapperFor(webApp: TelegramWebApp | undefined) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <TKTelegramProvider webApp={webApp} signalReady={false}>
        {children}
      </TKTelegramProvider>
    );
  };
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  Reflect.deleteProperty(window, "Telegram");
  Reflect.deleteProperty(navigator, "share");
});

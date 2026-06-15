import { createContext, use, type ReactNode } from "react";
import type { MockTelegram } from "tg-mini-app-uikit/testing";

/*
 * Local dev/e2e can inject a mock bridge; production uses a real
 * `window.Telegram.WebApp` when present and otherwise runs as an honest browser
 * fallback. Platform Lab reaches for the live-control methods on the handle
 * (`setColorScheme`, `setDeviceCutouts`, ...) only in mock mode.
 */
const MockContext = createContext<MockTelegram | null>(null);

export function MockProvider({ value, children }: { value: MockTelegram | null; children: ReactNode }) {
  return <MockContext.Provider value={value}>{children}</MockContext.Provider>;
}

/** The live mock handle, or null when running against a real Telegram bridge. */
export function useMockHandle(): MockTelegram | null {
  return use(MockContext);
}

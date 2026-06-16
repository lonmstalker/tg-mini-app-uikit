import { createContext, use, type ReactNode } from "react";
import type { MockTelegram } from "@tg-mini-app/telegram/testing";

/*
 * Local dev/e2e injects a mock bridge; production uses a real
 * `window.Telegram.WebApp` when present, otherwise an honest browser fallback.
 * The presence of this handle is how `useRuntimeMode` distinguishes mock from
 * native — a mock reports `isSupported === true` but is never native (D4).
 */
const MockContext = createContext<MockTelegram | null>(null);

export function MockProvider({ value, children }: { value: MockTelegram | null; children: ReactNode }) {
  return <MockContext.Provider value={value}>{children}</MockContext.Provider>;
}

/** The live mock handle, or null when running against a real (or absent) bridge. */
export function useMockHandle(): MockTelegram | null {
  return use(MockContext);
}

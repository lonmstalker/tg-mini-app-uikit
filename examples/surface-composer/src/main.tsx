import "./index.css";
import "tg-mini-app-uikit/style.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { getTelegramWebApp, TKTelegramProvider } from "tg-mini-app-uikit";
import { createMockTelegram } from "@tg-mini-app/telegram/testing";
import { SurfaceComposerApp } from "./app/SurfaceComposerApp";
import { StoreProvider } from "./app/composerStore";
import { LangProvider, initialLangFor } from "./i18n";
import { MockProvider } from "./runtime/mockContext";

/*
 * Deep-link knobs (read once at startup, mirrors trailhead):
 *  ?mock=1 — force the injected mock runtime
 *  ?mock=0 — disable the mock (honest browser fallback)
 *  ?lang=ru|en — language override (read inside initialLangFor)
 */
const params = new URLSearchParams(window.location.search);
const forceMock = params.get("mock") === "1";
const disableMock = params.get("mock") === "0";

function getRealBridge() {
  const bridge = getTelegramWebApp();
  if (!bridge) return null;
  if (bridge.initData || bridge.initDataUnsafe?.user) return bridge;
  // telegram-web-app.js leaves a browser stub even outside Telegram; keeping it
  // would hide DOM fallbacks and fake native APIs, so treat it as absent.
  const host = window as { Telegram?: { WebApp?: unknown } };
  if (host.Telegram?.WebApp === bridge) delete host.Telegram.WebApp;
  return null;
}

const realBridge = getRealBridge();
const shouldUseMock = !realBridge && !disableMock && (import.meta.env.DEV || forceMock);
const mock = shouldUseMock ? createMockTelegram({ colorScheme: "light" }) : null;
const initialLang = initialLangFor(realBridge?.initDataUnsafe?.user?.language_code);

// Dev-only automation handle for preview tools / e2e to drive the mock client.
if (import.meta.env.DEV && mock) {
  (window as unknown as { __composerMock?: typeof mock }).__composerMock = mock;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TKTelegramProvider webApp={mock?.webApp ?? realBridge ?? undefined} haptics>
      <MockProvider value={mock}>
        <LangProvider initialLang={initialLang}>
          <StoreProvider>
            <SurfaceComposerApp />
          </StoreProvider>
        </LangProvider>
      </MockProvider>
    </TKTelegramProvider>
  </StrictMode>,
);

import "./index.css";
import "tg-mini-app-uikit/style.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { TKTelegramProvider, getTelegramWebApp } from "@tg-mini-app/telegram";
import { createMockTelegram } from "@tg-mini-app/telegram/testing";
import { AppFrame } from "./AppFrame";
import { configureMockApi, getMockApiConfig } from "./data/mockApi";
import { StoreProvider } from "./store";
import { isRealTelegramBridge } from "./telegram/launch";
import { MockProvider } from "./telegram/mock-context";

/*
 * Deep-link knobs for demos and e2e (read once at startup):
 *  ?fail=1  — start with the mock-API failure flag set (shows error/retry)
 *  ?fast=1  — shrink the artificial latency so tests run quickly
 */
const params = new URLSearchParams(window.location.search);
const forceMock = params.get("mock") === "1";
const disableMock = params.get("mock") === "0";
configureMockApi({
  fail: params.get("fail") === "1",
  delayMs: params.get("fast") === "1" ? 60 : getMockApiConfig().delayMs,
});

async function ensureTelegramWebAppScript(): Promise<void> {
  if (forceMock || import.meta.env.DEV || getTelegramWebApp()) return;

  const src = "https://telegram.org/js/telegram-web-app.js";
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
  await new Promise<void>((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };

    const script = existing ?? document.createElement("script");
    script.addEventListener("load", finish, { once: true });
    script.addEventListener("error", finish, { once: true });

    if (!existing) {
      script.src = src;
      script.async = false;
      script.dataset.trailheadTelegramWebApp = "true";
      document.head.append(script);
    }

    window.setTimeout(finish, 1500);
  });
}

function getTelegramLaunchBridge() {
  const bridge = getTelegramWebApp();
  if (!bridge) return null;
  // Classify by PLATFORM, not initData: a real client always stamps its
  // platform, but can legitimately launch with an empty initData (e.g. the
  // main Mini App opened from the bot profile). The initData check used here
  // before misread those launches as "browser" and ran the DOM-fallback mode
  // inside Telegram — no native MainButton, no expand(), a pay bar half below
  // the visible area (wiki/device-testing.md #6).
  if (isRealTelegramBridge(bridge)) return bridge;

  // telegram-web-app.js creates a browser stub even outside Telegram. Keeping
  // it would hide DOM fallbacks and call unsupported APIs, so treat it as absent.
  const host = window as { Telegram?: { WebApp?: unknown } };
  if (host.Telegram?.WebApp === bridge) {
    delete host.Telegram.WebApp;
  }
  return null;
}

async function bootstrap() {
  /*
   * Production must not silently turn into a fake Telegram runtime: real Mini
   * Apps get the official bridge, local/dev previews get the injected mock, and
   * production browser fallback stays honest unless `?mock=1` is explicit.
   */
  await ensureTelegramWebAppScript();
  const realBridge = getTelegramLaunchBridge();
  const shouldUseMock = !realBridge && !disableMock && (import.meta.env.DEV || forceMock);
  const mock = shouldUseMock ? createMockTelegram({ colorScheme: "light" }) : null;
  const tonManifestUrl = new URL(`${import.meta.env.BASE_URL}tonconnect-manifest.json`, window.location.origin).toString();

  // Dev-only automation handle: lets the preview tools and e2e drive the mock
  // client (theme, cutouts) before Platform Lab's UI exists. Never shipped to a
  // production build.
  if (import.meta.env.DEV) {
    const w = window as unknown as {
      __trailheadMock?: typeof mock;
      __trailheadApi?: { configureMockApi: typeof configureMockApi };
    };
    if (mock) w.__trailheadMock = mock;
    // Lets the preview tools and e2e toggle the mock-API failure/latency at runtime.
    w.__trailheadApi = { configureMockApi };
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <TonConnectUIProvider
        manifestUrl={tonManifestUrl}
        actionsConfiguration={{ twaReturnUrl: import.meta.env.VITE_TRAILHEAD_BOT_URL ?? "https://t.me/lonmstalker_bot" }}
      >
        <TKTelegramProvider webApp={mock?.webApp ?? realBridge ?? undefined} haptics>
          <MockProvider value={mock}>
            <StoreProvider>
              <AppFrame />
            </StoreProvider>
          </MockProvider>
        </TKTelegramProvider>
      </TonConnectUIProvider>
    </StrictMode>,
  );
}

void bootstrap();

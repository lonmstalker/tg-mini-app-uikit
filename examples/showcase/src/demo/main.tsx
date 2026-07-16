import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { getTelegramWebApp } from "@tg-mini-app/telegram";
import "tg-mini-app-uikit/style.css";
import "../shared/styles.css";
import { SiteLocaleProvider } from "../shared/i18n";
import { App } from "./App";
import "./styles.css";

async function bootstrap() {
  // The official bridge, vendored inside the kit and bundled as an app chunk —
  // no runtime fetch from telegram.org to lose on a slow route
  // (wiki/device-testing.md #6, v3). Loaded only when the host hasn't already
  // provided a bridge; outside Telegram it defines an inert stub and the page
  // keeps working as a plain browser demo.
  if (!getTelegramWebApp()) {
    try {
      await import("@tg-mini-app/telegram/bridge");
    } catch {
      /* chunk unreachable — stay a plain browser demo */
    }
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <SiteLocaleProvider>
        <App />
      </SiteLocaleProvider>
    </StrictMode>,
  );
}

void bootstrap();

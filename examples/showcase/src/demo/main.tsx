import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { tkResolveTelegramBridge } from "@tg-mini-app/telegram";
import "tg-mini-app-uikit/style.css";
import "../shared/styles.css";
import { SiteLocaleProvider } from "../shared/i18n";
import { App } from "./App";
import "./styles.css";

async function bootstrap() {
  // Kit-owned launch: loads the vendored bridge when the host didn't provide
  // one, classifies by platform, and deletes the outside-Telegram stub — the
  // page then keeps working as a plain browser demo (wiki/ios-debugging.md).
  await tkResolveTelegramBridge();

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <SiteLocaleProvider>
        <App />
      </SiteLocaleProvider>
    </StrictMode>,
  );
}

void bootstrap();

// FIRST import: the official Telegram bridge, vendored inside the kit and
// bundled with the app — no runtime fetch from telegram.org to lose on a slow
// route (wiki/device-testing.md #6, v3). Outside Telegram it defines an inert
// stub and the page keeps working as a plain browser demo.
import "@tg-mini-app/telegram/bridge";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "tg-mini-app-uikit/style.css";
import "../shared/styles.css";
import { SiteLocaleProvider } from "../shared/i18n";
import { App } from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SiteLocaleProvider>
      <App />
    </SiteLocaleProvider>
  </StrictMode>,
);

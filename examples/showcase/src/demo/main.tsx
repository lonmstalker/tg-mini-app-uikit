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

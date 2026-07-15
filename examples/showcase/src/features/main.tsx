import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "tg-mini-app-uikit/style.css";
import "../shared/styles.css";
import "../landing/styles.css";
import "./styles.css";
import { SiteLocaleProvider } from "../shared/i18n";
import { FEATURE_SLUGS, type FeatureSlug } from "./content";
import { FeatureApp } from "./FeatureApp";

// One entry serves every feature page: each HTML shell stamps its slug on <html>.
const slug = document.documentElement.dataset.feature as FeatureSlug;
if (!FEATURE_SLUGS.includes(slug)) throw new Error(`Unknown feature page slug: ${slug}`);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SiteLocaleProvider>
      <FeatureApp slug={slug} />
    </SiteLocaleProvider>
  </StrictMode>,
);

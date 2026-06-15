/**
 * Re-export shim. The Telegram platform bridge now lives in its own package,
 * `@tg-mini-app/telegram`; uikit depends on it as a peer (a single physical
 * instance, so the Telegram context and the back-button queue never
 * double-instantiate). This barrel keeps `tg-mini-app-uikit`'s public surface
 * unchanged for existing consumers — the package owns the curation now (the
 * same exports as the old barrel, plus the previously-dropped storage types).
 *
 * @deprecated Import platform hooks from `@tg-mini-app/telegram` directly. This
 * compatibility re-export will be removed in a future major; consumers should
 * add `@tg-mini-app/telegram` to their dependencies and import from it.
 */
export * from "@tg-mini-app/telegram";

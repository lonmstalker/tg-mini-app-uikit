# Theming

`TKProvider` owns the `.tk` root and maps all component styles to CSS variables in the `tk` layer.

- `theme="light" | "dark"` chooses the base palette.
- `telegram` maps tokens to live `--tg-theme-*` values when the Telegram client provides them.
- `accent`, `roundness`, `fontSize`, `motion` and `motionSpeed` are runtime knobs used by the demo Tweaks panel.
- `preset="ios" | "material"` changes the feel without forking components.

Use `TKLocaleProvider` for app strings. The bundled default is English, `ruLocale` is shipped, and apps can pass any `Partial<TKLocale>`.

```tsx
<TKLocaleProvider locale={{ search: "Search products" }}>
  <TKProvider theme="dark" accent="#1c93e3" roundness={1.2}>
    <ShopScreen />
  </TKProvider>
</TKLocaleProvider>
```

All new motion should stay on transform or opacity and must respect reduced-motion tokens.

## Token contract

The public stylesheet is `tg-mini-app-uikit/style.css`. It declares semantic CSS custom properties in `packages/uikit/src/styles/tokens.css`; components read those variables instead of hard-coded theme values.

Core groups:

- Runtime knobs: `--tk-accent`, `--tk-rx`, `--tk-ms`, `--tk-fz`, `--tk-spring`, `--tk-ease`.
- Radius: `--tk-r-xs`, `--tk-r-sm`, `--tk-r-md`, `--tk-r-lg`, `--tk-r-xl`, `--tk-r-pill`.
- Typography: `--tk-fz-caption2`, `--tk-fz-caption`, `--tk-fz-footnote`, `--tk-fz-sub`, `--tk-fz-body`, `--tk-fz-title3`, `--tk-fz-title2`, `--tk-fz-title1`, `--tk-fz-large`.
- Spacing: `--tk-sp-1` through `--tk-sp-8`.
- Z-index: `--tk-z-base`, `--tk-z-sticky`, `--tk-z-header`, `--tk-z-overlay`, `--tk-z-sheet`, `--tk-z-dialog`, `--tk-z-toast`, `--tk-z-tooltip`, `--tk-z-dropdown`, `--tk-z-popper`.
- Safe area: `--tk-safe-top`, `--tk-safe-bottom`, `--tk-safe-left`, `--tk-safe-right`.
- Semantic colors: `--tk-bg`, `--tk-surface`, `--tk-surface-2`, `--tk-surface-3`, `--tk-text`, `--tk-text-2`, `--tk-text-3`, `--tk-sep`, `--tk-on-accent`, `--tk-green`, `--tk-red`, `--tk-orange`.
- Feedback and elevation: `--tk-ring`, accent overlays, status inks, shadows, glass, and scrim variables.

When `TKProvider telegram` is enabled, semantic tokens can map to Telegram theme variables such as `--tg-theme-button-color`, `--tg-theme-secondary-bg-color`, `--tg-theme-section-bg-color`, `--tg-theme-text-color`, `--tg-theme-subtitle-text-color`, `--tg-theme-hint-color`, `--tg-theme-section-separator-color`, `--tg-theme-destructive-text-color`, and `--tg-theme-button-text-color`.

`--tk-sep` is the canonical separator token. `--tk-separator` is kept as a compatibility alias for existing stories and downstream CSS.

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

---
"tg-mini-app-uikit": minor
---

Reuse-audit waves 2–3 (REU-001…REU-012). **Breaking (0.x minor):** `TKPhoneInput` no longer hardcodes the invisible `+7` + Russian mask default — the default now derives from the active locale (`TKLocale.lang` on the bundled presets, or the `lang` prop). A Russian locale keeps `+7` with the Russian grouping mask; any other (or no) locale makes the simple field a free unmasked international input, and `countrySelect` picks its country from the `lang` region subtag (US fallback). Pass `defaultCountry="+7"` (or provide `ruLocale`) to keep the old behavior.

Also in this release:

- `TKSheet`, `TKDialog`, `TKActionSheet`, and `TKImageViewer` portal into the nearest `.tk` root / `[data-tk-portal-root]` host (the toast/popper contract) instead of anchoring in place — transformed, positioned, or `overflow: hidden` ancestors can no longer clip or displace them. Inside a `.tk` host they stay `position: absolute` (Telegram iOS-safe); `position: fixed` only for the bare `document.body` fallback. Portals mount client-side, so SSR markup no longer contains open-overlay content.
- `TKSelect`/`TKMultiselect` dropdowns portal to the same host, glued to the trigger (re-measured on open/scroll/resize), keeping keyboard, focus, and close contracts.
- New `TKLocale` keys with English fallbacks and Russian translations: `invalidDate`, `invalidTime`, `month`, `year`, `amPm`; optional `TKLocale.lang`.
- Reuse-contract escape hatches from wave 2: custom `icon` elements everywhere, per-instance `color` props, `style`/`className` reaching component roots, no invented demo content, and dev warnings for silent coupling.

# API Reference

This page is intentionally compact. The source of truth is the generated type declarations in `packages/uikit/dist/*.d.ts`; this page gives import-level orientation for docs and AI agents.

```tsx
import {
  TKProvider,
  TKTelegramProvider,
  TKButton,
  TKCalendar,
  TKNavStack,
  useInvoice,
  useBackIntercept,
} from "tg-mini-app-uikit";
```

Key conventions:

- Props named `testId` render to `data-testid`.
- Options accept `string` or `{ value, label, icon, disabled }`.
- Locale resolution is component prop, then `TKLocaleProvider`, then English default.
- Back handling is LIFO through `useBackIntercept`; sheets and dialogs intercept before navigation stacks.
- Telegram hooks return safe fallbacks outside Telegram and never require a runtime dependency.

For the full AI-oriented map see `../../llms-full.md` and the package `.d.ts` output after `npm run build -w tg-mini-app-uikit`.

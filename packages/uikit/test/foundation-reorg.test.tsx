import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import * as kit from "../src";
import {
  TKProvider,
  tkThemeVars,
  useTKTheme,
  type TKProviderProps,
} from "../src/foundation/theme";
import {
  TKLocaleProvider,
  ruLocale,
  tkFormat,
  useTKLocale,
  type TKLocaleProviderProps,
} from "../src/foundation/i18n";
import { tkFlattenOptions, tkOptionItem, type TKOption } from "../src/foundation/options";
import {
  TKTelegramProvider,
  getTelegramWebApp,
  useWebApp,
  type TKNativeButtonParams,
} from "../src/foundation/telegram";
import { createStorageApi } from "../../telegram/src/storage";

function ThemeProbe() {
  const theme = useTKTheme();
  return <div data-testid="theme-probe">{theme.theme}</div>;
}

function LocaleProbe() {
  const locale = useTKLocale();
  return <div>{locale.done}</div>;
}

function TelegramProbe() {
  const webApp = useWebApp();
  return <div data-testid="telegram-probe">{webApp?.version ?? "missing"}</div>;
}

describe("foundation module reorganization", () => {
  it("publishes foundation providers from the new source category and root entrypoint", () => {
    expect(TKProvider).toBe(kit.TKProvider);
    expect(TKLocaleProvider).toBe(kit.TKLocaleProvider);
    expect(TKTelegramProvider).toBe(kit.TKTelegramProvider);
    expect(tkThemeVars).toBe(kit.tkThemeVars);
    expect(tkFormat).toBe(kit.tkFormat);
    expect(tkOptionItem).toBe(kit.tkOptionItem);
    expect(getTelegramWebApp).toBe(kit.getTelegramWebApp);
  });

  it("keeps foundation type contracts available at their new source paths", () => {
    const providerProps = {} satisfies TKProviderProps;
    const localeProps = {} satisfies TKLocaleProviderProps;
    const option = "ru" satisfies TKOption;
    const nativeButton = { text: "Pay", position: "bottom" } satisfies TKNativeButtonParams;

    expect(providerProps).toEqual({});
    expect(localeProps).toEqual({});
    expect(option).toBe("ru");
    expect(nativeButton).toEqual({ text: "Pay", position: "bottom" });
  });

  it("renders theme, locale, options, and Telegram runtime surfaces from foundation modules", async () => {
    render(
      <TKProvider theme="dark" accent="#2481cc" testId="provider">
        <TKLocaleProvider locale={ruLocale}>
          <TKTelegramProvider webApp={{ version: "test" }} signalReady={false}>
            <ThemeProbe />
            <LocaleProbe />
            <TelegramProbe />
          </TKTelegramProvider>
        </TKLocaleProvider>
      </TKProvider>,
    );

    expect(screen.getByTestId("provider")).toHaveAttribute("data-theme", "dark");
    expect(screen.getByTestId("theme-probe")).toHaveTextContent("dark");
    expect(screen.getByText("Готово")).toBeVisible();
    expect(screen.getByTestId("telegram-probe")).toHaveTextContent("test");
    expect(tkFlattenOptions([{ label: "Locale", options: ["ru"] }])).toEqual([
      { value: "ru", label: "ru", group: "Locale" },
    ]);
    await expect(createStorageApi(undefined, "tk-test:").get("missing")).resolves.toBeNull();
  });
});

import { renderToString } from "react-dom/server";
import type { ReactNode } from "react";
import { describe, expect, expectTypeOf, it } from "vitest";
import "tg-mini-app-uikit/style.css";
import {
  TKButton,
  TKDialog,
  TKInput,
  TKProvider,
  TKSafeArea,
  TKTelegramProvider,
  useMainButton,
  useSafeArea,
  useWebApp,
  type TKButtonProps,
  type TKCloudStorage,
  type TKInitData,
  type TKTheme,
} from "tg-mini-app-uikit";

function TelegramHookConsumer() {
  const webApp = useWebApp();
  const mainButton = useMainButton({ text: "Continue", visible: false });
  const safeArea = useSafeArea();

  return (
    <span data-supported={mainButton.isSupported} data-has-web-app={Boolean(webApp)}>
      {safeArea.inset.top}:{safeArea.contentInset.bottom}
    </span>
  );
}

describe("consumer package imports", () => {
  it("API-EXPORT-003 imports representative components and hooks from the root package", () => {
    expect(TKButton).toBeTruthy();
    expect(TKInput).toBeTruthy();
    expect(TKDialog).toBeTruthy();
    expect(TKTelegramProvider).toBeTruthy();
    expect(useWebApp).toBeTypeOf("function");
    expect(useMainButton).toBeTypeOf("function");
    expect(useSafeArea).toBeTypeOf("function");
  });

  it("re-exports the platform types after the @tg-mini-app/telegram split", () => {
    // The old curated barrel dropped the storage types; the extraction restores
    // them, and TKTheme now lives in the platform package (re-exported here).
    expectTypeOf<TKTheme>().toEqualTypeOf<"light" | "dark">();
    expectTypeOf<TKCloudStorage["get"]>().toBeFunction();
    expectTypeOf<TKInitData["raw"]>().toEqualTypeOf<string | undefined>();
  });

  it("typechecks common consumer props without private subpath imports", () => {
    expectTypeOf<TKButtonProps["children"]>().toEqualTypeOf<ReactNode>();
    expectTypeOf<TKButtonProps["loading"]>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<TKButtonProps["variant"]>().toEqualTypeOf<
      "filled" | "tonal" | "plain" | "outline" | "destructive" | "surface" | undefined
    >();
  });

  it("API-EXPORT-005 renders representative providers, components and hook consumers during SSR", () => {
    const html = renderToString(
      <TKTelegramProvider signalReady={false}>
        <TKProvider theme="light">
          <TKSafeArea>
            <TKInput label="Name" />
            <TKButton>Save</TKButton>
            <TKDialog open={false} title="Confirm" />
            <TelegramHookConsumer />
          </TKSafeArea>
        </TKProvider>
      </TKTelegramProvider>,
    );

    expect(html).toContain("Name");
    expect(html).toContain("Save");
    expect(html).toContain("data-supported=\"false\"");
  });
});

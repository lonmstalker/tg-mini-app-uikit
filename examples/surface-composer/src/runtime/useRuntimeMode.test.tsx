import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { TKTelegramProvider } from "tg-mini-app-uikit";
import { createMockTelegram } from "@tg-mini-app/telegram/testing";
import { MockProvider } from "./mockContext";
import { useRuntimeMode } from "./useRuntimeMode";

describe("useRuntimeMode (honest labelling, D4)", () => {
  it("reports 'mock' when a mock handle is present — never 'native', even though the mock is isSupported", () => {
    const mock = createMockTelegram();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <TKTelegramProvider webApp={mock.webApp} haptics>
        <MockProvider value={mock}>{children}</MockProvider>
      </TKTelegramProvider>
    );
    const { result } = renderHook(() => useRuntimeMode(), { wrapper });
    expect(result.current).toBe("mock");
  });

  it("reports 'fallback' with neither a real bridge nor a mock", () => {
    const wrapper = ({ children }: { children: ReactNode }) => <MockProvider value={null}>{children}</MockProvider>;
    const { result } = renderHook(() => useRuntimeMode(), { wrapper });
    expect(result.current).toBe("fallback");
  });
});

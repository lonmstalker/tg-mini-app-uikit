import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createMockTelegram } from "./support/telegram/mock";
import { useInitData, useSecureStorage } from "../src/foundation/telegram";
import { createStorageApi } from "../src/foundation/telegram/storage";
import { wrapperFor } from "./helpers/telegram";

describe("Telegram storage and init data trust boundary", () => {
  it("TG-STORAGE-004 exposes local SecureStorage fallback as not natively supported", async () => {
    const { result } = renderHook(() => useSecureStorage());

    expect(result.current.isSupported).toBe(false);
    await result.current.set("token", "local-dev-value");
    await expect(result.current.get("token")).resolves.toBe("local-dev-value");
    expect(window.localStorage.getItem("tk-secure:token")).toBe("local-dev-value");
  });

  it("TG-STORAGE-005 keeps fallback methods safe when browser localStorage is unavailable", async () => {
    vi.spyOn(window, "localStorage", "get").mockImplementation(() => {
      throw new DOMException("Blocked", "SecurityError");
    });

    const storage = createStorageApi(undefined, "tk-cloud:");

    await expect(storage.get("draft")).resolves.toBe(null);
    await expect(storage.getMany(["draft"])).resolves.toEqual({ draft: null });
    await expect(storage.keys()).resolves.toEqual([]);
    await expect(storage.set("draft", "value")).resolves.toBeUndefined();
    await expect(storage.remove("draft")).resolves.toBeUndefined();
    await expect(storage.clear?.()).resolves.toBeUndefined();
    expect(storage.isSupported).toBe(false);
  });

  it("TG-STORAGE-006 returns raw initData separately from display-only unsafe data", () => {
    const mock = createMockTelegram();
    const { result } = renderHook(() => useInitData(), { wrapper: wrapperFor(mock.webApp) });

    expect(result.current.raw).toContain("hash=demo-not-valid");
    expect(result.current.unsafe).toBe(mock.webApp.initDataUnsafe);
    expect(result.current.user).toBe(mock.webApp.initDataUnsafe?.user);
    expect(result.current.startParam).toBe("platform_lab");
  });
});

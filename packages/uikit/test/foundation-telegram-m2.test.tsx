import { act, render, renderHook, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMockTelegram } from "@tg-mini-app/telegram/testing";
import {
  TKTelegramProvider,
  tkIsAllowedLinkUrl,
  tkIsTelegramDeepLink,
  useBackDispatcher,
  useBackIntercept,
  useShare,
  useTelegramEnvironment,
  useTelegramLinks,
  useViewport,
} from "@tg-mini-app/telegram";
import { createStorageApi } from "../../telegram/src/storage";
import { __tkResetBackState, tkBackState } from "../../telegram/src/back-registry";
import { wrapperFor } from "./helpers/telegram";

/* M2 telegram runtime: FND-001/004/006/007/008/DX-005/009. */

/* ---------------- FND-007 · link scheme allowlist ---------------- */

describe("FND-007 link helpers reject dangerous schemes", () => {
  it("tkIsAllowedLinkUrl allows http/https/tg/mailto/tel and blocks the rest", () => {
    for (const ok of ["https://t.me/x", "http://a.b", "tg://resolve?domain=x", "mailto:a@b.c", "tel:+100"]) {
      expect(tkIsAllowedLinkUrl(ok)).toBe(true);
    }
    for (const bad of ["javascript:alert(1)", "data:text/html,<script>", "vbscript:x", "", "   "]) {
      expect(tkIsAllowedLinkUrl(bad)).toBe(false);
    }
  });

  it("tkIsTelegramDeepLink accepts only tg:/t.me, not arbitrary https or relative", () => {
    expect(tkIsTelegramDeepLink("tg://resolve?domain=x")).toBe(true);
    expect(tkIsTelegramDeepLink("https://t.me/x")).toBe(true);
    expect(tkIsTelegramDeepLink("https://evil.com")).toBe(false);
    expect(tkIsTelegramDeepLink("/relative/path")).toBe(false);
    expect(tkIsTelegramDeepLink("javascript:alert(1)")).toBe(false);
  });

  it("openLink/openTelegramLink do not forward dangerous or off-contract URLs", () => {
    const openLink = vi.fn();
    const openTelegramLink = vi.fn();
    const webApp = { openLink, openTelegramLink } as never;
    const { result } = renderHook(() => useTelegramLinks(), { wrapper: wrapperFor(webApp) });
    expect(result.current.openLink("javascript:alert(1)")).toBe(false);
    expect(openLink).not.toHaveBeenCalled();
    // openTelegramLink rejects an arbitrary https host (would have navigated the app away)
    expect(result.current.openTelegramLink("https://evil.com")).toBe(false);
    expect(result.current.openTelegramLink("data:text/html,x")).toBe(false);
    expect(openTelegramLink).not.toHaveBeenCalled();
    // allowed urls still forward
    expect(result.current.openLink("https://t.me/x")).toBe(true);
    expect(openLink).toHaveBeenCalledWith("https://t.me/x", undefined);
    expect(result.current.openTelegramLink("tg://resolve?domain=x")).toBe(true);
    expect(openTelegramLink).toHaveBeenCalledWith("tg://resolve?domain=x");
  });
});

/* ---------------- FND-DX-005 · useTelegramEnvironment ---------------- */

describe("FND-DX-005 useTelegramEnvironment", () => {
  afterEach(() => Reflect.deleteProperty(window, "Telegram"));

  it("reports browser with no WebApp", () => {
    const { result } = renderHook(() => useTelegramEnvironment());
    expect(result.current).toEqual({ inside: false, reason: "browser" });
  });

  it("reports inside when a WebApp is present", () => {
    const mock = createMockTelegram();
    const { result } = renderHook(() => useTelegramEnvironment(), { wrapper: wrapperFor(mock.webApp) });
    expect(result.current).toEqual({ inside: true, reason: "webapp" });
  });
});

/* ---------------- FND-006 · honest viewport unknown ---------------- */

describe("FND-006 useViewport exposes an honest unknown outside Telegram", () => {
  it("isSupported false and height undefined with no WebApp", () => {
    const { result } = renderHook(() => useViewport());
    expect(result.current.isSupported).toBe(false);
    expect(result.current.height).toBeUndefined();
    expect(result.current.stableHeight).toBeUndefined();
  });

  it("isSupported true inside Telegram", () => {
    const mock = createMockTelegram();
    const { result } = renderHook(() => useViewport(), { wrapper: wrapperFor(mock.webApp) });
    expect(result.current.isSupported).toBe(true);
  });
});

/* ---------------- FND-008 · CloudStorage key validation ---------------- */

describe("FND-008 storage validates keys on read/remove consistently", () => {
  function nativeApi() {
    return {
      getItem: vi.fn((_k: string, cb: (e: Error | null, v?: string | null) => void) => cb(null, "v")),
      setItem: vi.fn((_k: string, _v: string, cb: (e: Error | null) => void) => cb(null)),
      getItems: vi.fn((_ks: string[], cb: (e: Error | null, v?: Record<string, string | null>) => void) => cb(null, {})),
      removeItem: vi.fn((_k: string, cb: (e: Error | null) => void) => cb(null)),
      removeItems: vi.fn((_ks: string[], cb: (e: Error | null) => void) => cb(null)),
    };
  }

  it("native getMany/removeMany reject an invalid key without calling through", async () => {
    const api = nativeApi();
    const store = createStorageApi(api as never, "tk:");
    await expect(store.getMany(["ok", "bad key!"])).rejects.toThrow();
    expect(api.getItems).not.toHaveBeenCalled();
    await expect(store.removeMany(["ok", "a".repeat(200)])).rejects.toThrow();
    expect(api.removeItems).not.toHaveBeenCalled();
  });

  it("native get/remove reject an invalid key", async () => {
    const api = nativeApi();
    const store = createStorageApi(api as never, "tk:");
    await expect(store.get("bad key!")).rejects.toThrow();
    expect(api.getItem).not.toHaveBeenCalled();
    await expect(store.remove("bad key!")).rejects.toThrow();
    expect(api.removeItem).not.toHaveBeenCalled();
  });

  it("the localStorage fallback rejects the same invalid key (consistency)", async () => {
    const fallback = createStorageApi(undefined, "tk:");
    await expect(fallback.getMany(["ok", "bad key!"])).rejects.toThrow();
    await expect(fallback.get("bad key!")).rejects.toThrow();
  });

  it("valid keys still pass through", async () => {
    const api = nativeApi();
    const store = createStorageApi(api as never, "tk:");
    await store.getMany(["a", "b_1", "c-2"]);
    expect(api.getItems).toHaveBeenCalledWith(["a", "b_1", "c-2"], expect.any(Function));
  });
});

/* ---------------- FND-001 · shareToStory never hangs ---------------- */

describe("FND-001 useShare.shareToStory settles within a bounded time", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("resolves optimistically when no story event fires", async () => {
    const mock = createMockTelegram();
    const { result } = renderHook(() => useShare(), { wrapper: wrapperFor(mock.webApp) });
    let settled: boolean | undefined;
    let p!: Promise<boolean>;
    act(() => {
      p = result.current.shareToStory("https://x/y.jpg").then((ok) => (settled = ok));
    });
    expect(settled).toBeUndefined(); // still pending
    await act(async () => {
      vi.advanceTimersByTime(1500);
      await p;
    });
    expect(settled).toBe(true);
    expect(result.current.status).toBe("success");
  });

  it("settles a pending promise on unmount instead of leaking it", async () => {
    const mock = createMockTelegram();
    const { result, unmount } = renderHook(() => useShare(), { wrapper: wrapperFor(mock.webApp) });
    let settled: boolean | undefined;
    let p!: Promise<boolean>;
    act(() => {
      p = result.current.shareToStory("https://x/y.jpg").then((ok) => (settled = ok));
    });
    unmount();
    await act(async () => {
      await p;
    });
    expect(settled).toBe(false);
  });
});

/* ---------------- FND-004 · back-intercept singleton ---------------- */

function Intercept({ active }: { active: boolean }) {
  useBackIntercept(active, () => {});
  return null;
}

describe("FND-004 back-intercept state lives on a shared singleton", () => {
  beforeEach(() => __tkResetBackState());

  it("parks want/queue on a globalThis Symbol slot", () => {
    expect((globalThis as Record<symbol, unknown>)[Symbol.for("tg-mini-app/telegram/back-registry")]).toBeDefined();
  });

  it("an intercept bumps the want-count the provider reads, showing native Back", () => {
    const mock = createMockTelegram();
    render(
      <TKTelegramProvider webApp={mock.webApp} signalReady={false}>
        <Intercept active />
      </TKTelegramProvider>,
    );
    expect(tkBackState().want).toBe(1);
    expect(mock.getState().back.visible).toBe(true);
  });

  it("__tkResetBackState clears the shared state", () => {
    tkBackState().want = 3;
    tkBackState().queue.push(() => {});
    __tkResetBackState();
    expect(tkBackState().want).toBe(0);
    expect(tkBackState().queue).toHaveLength(0);
  });

  it("LIFO dispatch still runs the top interceptor", () => {
    const calls: string[] = [];
    function Probe() {
      useBackIntercept(true, () => calls.push("a"));
      useBackIntercept(true, () => calls.push("b"));
      const dispatch = useBackDispatcher();
      return (
        <button type="button" onClick={() => dispatch()}>
          back
        </button>
      );
    }
    render(<Probe />);
    screen.getByRole("button").click();
    expect(calls).toEqual(["b"]);
  });
});

/* ---------------- FND-009 · keyboard class scoped to the focused root ---------------- */

describe("FND-009 .tk-kb-open scopes to the root owning the focused editable", () => {
  let rootA: HTMLElement;
  let rootB: HTMLElement;
  let inputA: HTMLInputElement;
  let inputB: HTMLInputElement;
  let listeners: Map<string, () => void>;

  beforeEach(() => {
    listeners = new Map();
    const vv = {
      height: 600,
      offsetTop: 0,
      addEventListener: (e: string, cb: () => void) => listeners.set(e, cb),
      removeEventListener: vi.fn(),
    };
    Object.defineProperty(window, "innerHeight", { value: 800, configurable: true });
    Object.defineProperty(window, "visualViewport", { value: vv, configurable: true });
    rootA = document.createElement("div");
    rootA.className = "tk";
    inputA = document.createElement("input");
    rootA.append(inputA);
    rootB = document.createElement("div");
    rootB.className = "tk";
    inputB = document.createElement("input");
    rootB.append(inputB);
    document.body.append(rootA, rootB);
  });
  afterEach(() => {
    rootA.remove();
    rootB.remove();
    Reflect.deleteProperty(window, "visualViewport");
  });

  it("lifts only the root containing the focused input", async () => {
    const { useKeyboard } = await import("@tg-mini-app/telegram");
    renderHook(() => useKeyboard(80));
    act(() => {
      inputA.focus();
      listeners.get("resize")?.();
    });
    expect(rootA.classList.contains("tk-kb-open")).toBe(true);
    expect(rootB.classList.contains("tk-kb-open")).toBe(false);

    act(() => {
      inputB.focus();
      listeners.get("resize")?.();
    });
    expect(rootA.classList.contains("tk-kb-open")).toBe(false);
    expect(rootB.classList.contains("tk-kb-open")).toBe(true);
  });

  it("falls back to the sole root when the focused input is portalled outside it", async () => {
    rootB.remove(); // single .tk root now
    const portalled = document.createElement("input");
    document.body.append(portalled); // focused editable outside every .tk
    const { useKeyboard } = await import("@tg-mini-app/telegram");
    renderHook(() => useKeyboard(80));
    act(() => {
      portalled.focus();
      listeners.get("resize")?.();
    });
    expect(rootA.classList.contains("tk-kb-open")).toBe(true);
    portalled.remove();
  });
});

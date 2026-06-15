import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createMockGate, MockGateError, useAsync, useTKInfiniteData, type Page } from "../src/index";

describe("createMockGate", () => {
  it("resolves normally and throws MockGateError when failing", async () => {
    const gate = createMockGate();
    await expect(gate()).resolves.toBeUndefined();
    gate.configure({ fail: true });
    await expect(gate()).rejects.toBeInstanceOf(MockGateError);
    expect(gate.getConfig().fail).toBe(true);
  });
});

describe("useAsync", () => {
  it("loads, then reloads on demand", async () => {
    let calls = 0;
    const { result } = renderHook(() => useAsync(async () => ++calls, []));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBe(1);
    expect(result.current.error).toBe(false);

    act(() => result.current.reload());
    await waitFor(() => expect(result.current.data).toBe(2));
  });

  it("surfaces an error", async () => {
    const { result } = renderHook(() => useAsync(async () => { throw new Error("nope"); }, []));
    await waitFor(() => expect(result.current.error).toBe(true));
    expect(result.current.loading).toBe(false);
  });
});

describe("useTKInfiniteData", () => {
  const PAGE = 2;
  const all = ["a", "b", "c", "d", "e"]; // pages [a,b] [c,d] [e]
  const ok = async (cursor: number): Promise<Page<string>> => {
    const next = cursor + PAGE;
    return { items: all.slice(cursor, cursor + PAGE), nextCursor: next < all.length ? next : null };
  };

  it("loads the first page then pages to exhaustion", async () => {
    const { result } = renderHook(() => useTKInfiniteData(ok, []));
    await waitFor(() => expect(result.current.phase).toBe("ready"));
    expect(result.current.items).toEqual(["a", "b"]);
    expect(result.current.hasMore).toBe(true);

    await act(async () => void result.current.loadMore());
    await waitFor(() => expect(result.current.items).toEqual(["a", "b", "c", "d"]));

    await act(async () => void result.current.loadMore());
    await waitFor(() => expect(result.current.hasMore).toBe(false));
    expect(result.current.items).toEqual(all);
  });

  it("page-error does not advance the cursor; retryPage recovers", async () => {
    let failNext = false;
    const fetchPage = async (cursor: number): Promise<Page<string>> => {
      if (failNext) {
        failNext = false;
        throw new Error("boom");
      }
      return ok(cursor);
    };
    const { result } = renderHook(() => useTKInfiniteData(fetchPage, []));
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    failNext = true;
    await act(async () => void result.current.loadMore());
    await waitFor(() => expect(result.current.phase).toBe("page-error"));
    expect(result.current.items).toEqual(["a", "b"]); // unchanged — cursor held
    expect(result.current.hasMore).toBe(true);

    await act(async () => void result.current.retryPage());
    await waitFor(() => expect(result.current.items).toEqual(["a", "b", "c", "d"]));
    expect(result.current.phase).toBe("ready");
  });

  it("dedupes by key across pages", async () => {
    const dupes = async (cursor: number): Promise<Page<string>> => ({
      items: cursor === 0 ? ["a", "b"] : ["b", "c"],
      nextCursor: cursor === 0 ? 2 : null,
    });
    const { result } = renderHook(() => useTKInfiniteData(dupes, [], { getKey: (s) => s }));
    await waitFor(() => expect(result.current.phase).toBe("ready"));
    await act(async () => void result.current.loadMore());
    await waitFor(() => expect(result.current.hasMore).toBe(false));
    expect(result.current.items).toEqual(["a", "b", "c"]); // the duplicate "b" dropped
  });
});

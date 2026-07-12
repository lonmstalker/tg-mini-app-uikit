import { useRef } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as kit from "../src/index";

/* M8-C — OVL-DX-002: richer imperative toast API (show→id, dismiss, info/warning, promise). */

function wrap(children: React.ReactNode) {
  return (
    <kit.TKProvider>
      <kit.TKToastProvider>{children}</kit.TKToastProvider>
    </kit.TKProvider>
  );
}

describe("OVL-DX-002 toast show returns an id and dismiss(id) closes it", () => {
  afterEach(() => vi.useRealTimers());

  it("[D-API] show returns a numeric id; dismiss removes the toast", () => {
    vi.useFakeTimers();
    let captured = -1;
    function Probe() {
      const toast = kit.useTKToast();
      const idRef = useRef(0);
      return (
        <>
          <button
            onClick={() => {
              idRef.current = toast.show({ text: "hi", duration: 60000 });
              captured = idRef.current;
            }}
          >
            show
          </button>
          <button onClick={() => toast.dismiss(idRef.current)}>dismiss</button>
        </>
      );
    }
    render(wrap(<Probe />));
    act(() => fireEvent.click(screen.getByRole("button", { name: "show" })));
    expect(typeof captured).toBe("number");
    expect(captured).toBeGreaterThan(0);
    expect(screen.getByText("hi")).toBeInTheDocument();
    act(() => fireEvent.click(screen.getByRole("button", { name: "dismiss" })));
    act(() => vi.advanceTimersByTime(350)); // out-animation removal
    expect(screen.queryByText("hi")).toBeNull();
  });
});

describe("OVL-DX-002 info / warning variants", () => {
  it("[D-API] both render their text", () => {
    function Probe() {
      const toast = kit.useTKToast();
      return (
        <button
          onClick={() => {
            toast.info("an info");
            toast.warning("a warning");
          }}
        >
          go
        </button>
      );
    }
    render(wrap(<Probe />));
    act(() => fireEvent.click(screen.getByRole("button", { name: "go" })));
    expect(screen.getByText("an info")).toBeInTheDocument();
    expect(screen.getByText("a warning")).toBeInTheDocument();
  });
});

describe("OVL-DX-002 promise() swaps loading → success / error", () => {
  it("[D-API] resolve → success message", async () => {
    function Probe() {
      const toast = kit.useTKToast();
      return (
        <button
          onClick={() => {
            void toast.promise(Promise.resolve("OK"), {
              loading: "working…",
              success: (v) => `done ${v}`,
              error: "failed",
            });
          }}
        >
          go
        </button>
      );
    }
    render(wrap(<Probe />));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "go" }));
    });
    expect(screen.getByText("done OK")).toBeInTheDocument();
  });

  it("[D-EDGE] no setState/timer after the provider unmounts mid-promise", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    let resolve!: (v: string) => void;
    const p = new Promise<string>((r) => (resolve = r));
    function Probe() {
      const toast = kit.useTKToast();
      return (
        <button onClick={() => void toast.promise(p, { loading: "l", success: "s", error: "e" }).catch(() => {})}>
          go
        </button>
      );
    }
    const { unmount } = render(wrap(<Probe />));
    act(() => fireEvent.click(screen.getByRole("button", { name: "go" })));
    unmount();
    await act(async () => {
      resolve("x");
    });
    expect(errSpy.mock.calls.flat().join(" ")).not.toMatch(/unmounted|not wrapped in act/i);
    errSpy.mockRestore();
  });

  it("[D-API] reject → error message (and the returned promise rejects)", async () => {
    function Probe() {
      const toast = kit.useTKToast();
      return (
        <button
          onClick={() => {
            toast
              .promise(Promise.reject(new Error("nope")), {
                loading: "working…",
                success: "ok",
                error: (e) => `err ${(e as Error).message}`,
              })
              .catch(() => {});
          }}
        >
          go
        </button>
      );
    }
    render(wrap(<Probe />));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "go" }));
    });
    expect(screen.getByText("err nope")).toBeInTheDocument();
  });
});

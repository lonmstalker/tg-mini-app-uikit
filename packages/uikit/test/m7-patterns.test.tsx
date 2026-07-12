import { act, fireEvent, render, screen } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as kit from "../src/index";

afterEach(() => vi.useRealTimers());

/* ---------------- M7.1 chat ---------------- */

describe("M7.1 TKMessages / TKWriteBar", () => {
  const msgs: kit.TKMessage[] = [
    { id: "1", text: "Привет!", out: false, time: "12:01" },
    { id: "2", text: "Это вторая подряд", out: false, time: "12:01" },
    { id: "3", text: "Здравствуйте", out: true, time: "12:02", status: "read" },
  ];

  it("groups consecutive messages and marks the tail one", () => {
    render(<kit.TKMessages messages={msgs} testId="chat" />);
    const bubbles = screen.getByTestId("chat").querySelectorAll("[data-tk-bubble]");
    expect(bubbles).toHaveLength(3);
    expect(bubbles[0].getAttribute("data-tk-tail")).toBe("false");
    expect(bubbles[1].getAttribute("data-tk-tail")).toBe("true");
    expect(bubbles[2].getAttribute("data-tk-tail")).toBe("true");
  });

  it("outgoing read message shows double ticks", () => {
    render(<kit.TKMessages messages={msgs} />);
    expect(document.querySelectorAll("[data-tk-ticks]")).toHaveLength(1);
  });

  it("TKWriteBar sends on the send button and clears", () => {
    const onSend = vi.fn();
    render(<kit.TKWriteBar onSend={onSend} placeholder="Message" />);
    const input = screen.getByPlaceholderText("Message");
    fireEvent.change(input, { target: { value: "hello" } });
    fireEvent.click(screen.getByRole("button", { name: /send/i }));
    expect(onSend).toHaveBeenCalledWith("hello");
    expect((input as HTMLTextAreaElement).value).toBe("");
  });

  it("TKWriteBar sends on Enter, keeps newline on Shift+Enter, ignores empty", () => {
    const onSend = vi.fn();
    render(<kit.TKWriteBar onSend={onSend} placeholder="Message" />);
    const input = screen.getByPlaceholderText("Message");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSend).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: "line" } });
    fireEvent.keyDown(input, { key: "Enter", shiftKey: true });
    expect(onSend).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSend).toHaveBeenCalledWith("line");
  });
});

/* ---------------- M7.2 onboarding coach marks ---------------- */

describe("M7.2 TKOnboardingTooltip", () => {
  function Demo({ onFinish, storage }: { onFinish?: () => void; storage?: kit.TKOnboardingStorage }) {
    const ref1 = useRef<HTMLButtonElement>(null);
    const ref2 = useRef<HTMLButtonElement>(null);
    return (
      <>
        <button ref={ref1} type="button">
          first target
        </button>
        <button ref={ref2} type="button">
          second target
        </button>
        <kit.TKOnboardingTooltip
          steps={[
            { target: ref1, title: "Шаг 1", text: "Это первая кнопка" },
            { target: ref2, title: "Шаг 2", text: "Это вторая" },
          ]}
          storageKey="demo-tour"
          storage={storage}
          onFinish={onFinish}
        />
      </>
    );
  }

  it("walks through the steps and finishes", () => {
    const onFinish = vi.fn();
    render(<Demo onFinish={onFinish} />);
    expect(screen.getByText("Шаг 1")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByText("Шаг 2")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /done/i }));
    expect(onFinish).toHaveBeenCalledOnce();
    expect(screen.queryByText("Шаг 2")).not.toBeInTheDocument();
  });

  it("skip ends the tour and persists 'seen' through the storage adapter", async () => {
    const store: Record<string, string> = {};
    const storage: kit.TKOnboardingStorage = {
      get: async (k) => store[k] ?? null,
      set: async (k, v) => {
        store[k] = v;
      },
    };
    render(<Demo storage={storage} />);
    fireEvent.click(await screen.findByRole("button", { name: /skip/i }));
    await act(async () => {});
    expect(store["demo-tour"]).toBe("1");
  });

  it("does not show again when storage says seen", async () => {
    const storage: kit.TKOnboardingStorage = {
      get: async () => "1",
      set: async () => {},
    };
    render(<Demo storage={storage} />);
    await act(async () => {});
    expect(screen.queryByText("Шаг 1")).not.toBeInTheDocument();
  });
});

/* ---------------- M7.3 confetti ---------------- */

describe("M7.3 TKConfetti", () => {
  it("renders a canvas burst and cleans itself up", () => {
    vi.useFakeTimers();
    const onDone = vi.fn();
    render(<kit.TKConfetti onDone={onDone} duration={500} testId="boom" />);
    expect(screen.getByTestId("boom").querySelector("canvas")).not.toBeNull();
    act(() => vi.advanceTimersByTime(700));
    expect(onDone).toHaveBeenCalledOnce();
    expect(screen.queryByTestId("boom")).not.toBeInTheDocument();
  });

  it("renders nothing under prefers-reduced-motion", () => {
    const original = window.matchMedia;
    window.matchMedia = ((q: string) =>
      ({ matches: q.includes("prefers-reduced-motion"), addEventListener: () => {}, removeEventListener: () => {} })) as never;
    const onDone = vi.fn();
    render(<kit.TKConfetti onDone={onDone} testId="boom" />);
    expect(screen.queryByTestId("boom")).not.toBeInTheDocument();
    expect(onDone).toHaveBeenCalledOnce(); // resolves immediately so flows continue
    window.matchMedia = original;
  });
});

/* ---------------- M7.4 optional haptics ---------------- */

function hapticWebApp() {
  const calls: string[] = [];
  const webApp = {
    ready: vi.fn(),
    HapticFeedback: {
      impactOccurred: (s: string) => calls.push(`impact:${s}`),
      notificationOccurred: (s: string) => calls.push(`notification:${s}`),
      selectionChanged: () => calls.push("selection"),
    },
  } as unknown as kit.TelegramWebApp;
  return { webApp, calls };
}

describe("M7.4 optional haptics", () => {
  it("is off by default", () => {
    const { webApp, calls } = hapticWebApp();
    render(
      <kit.TKTelegramProvider webApp={webApp} signalReady={false}>
        <kit.TKSwitch label="Sound" defaultChecked={false} />
      </kit.TKTelegramProvider>,
    );
    fireEvent.click(screen.getByRole("switch"));
    expect(calls).toHaveLength(0);
  });

  it("selection haptics fire for switch/segmented when enabled on the provider", () => {
    const { webApp, calls } = hapticWebApp();
    render(
      <kit.TKTelegramProvider webApp={webApp} signalReady={false} haptics>
        <kit.TKSwitch label="Sound" defaultChecked={false} />
        <kit.TKSegmented options={["a", "b"]} />
      </kit.TKTelegramProvider>,
    );
    fireEvent.click(screen.getByRole("switch"));
    expect(calls).toContain("selection");
    fireEvent.click(screen.getByRole("radio", { name: "b" })); // NAV-002: segmented radiogroup
    expect(calls.filter((c) => c === "selection")).toHaveLength(2);
  });

  it("pin error fires a notification haptic", () => {
    const { webApp, calls } = hapticWebApp();
    const { rerender } = render(
      <kit.TKTelegramProvider webApp={webApp} signalReady={false} haptics>
        <kit.TKPinInput length={4} error={false} />
      </kit.TKTelegramProvider>,
    );
    rerender(
      <kit.TKTelegramProvider webApp={webApp} signalReady={false} haptics>
        <kit.TKPinInput length={4} error />
      </kit.TKTelegramProvider>,
    );
    expect(calls).toContain("notification:error");
  });
});

/* ---------------- M7.5 theme presets ---------------- */

describe("M7.5 TKProvider presets", () => {
  it("material preset flattens radii and smooths motion", () => {
    render(<kit.TKProvider preset="material" testId="root" />);
    const root = screen.getByTestId("root");
    expect(root.style.getPropertyValue("--tk-rx")).not.toBe("");
    expect(parseFloat(root.style.getPropertyValue("--tk-rx"))).toBeLessThan(1);
    expect(root.style.getPropertyValue("--tk-spring")).toContain("cubic-bezier");
  });

  it("explicit knobs win over the preset", () => {
    render(<kit.TKProvider preset="material" roundness={1.4} testId="root" />);
    expect(screen.getByTestId("root").style.getPropertyValue("--tk-rx")).toBe("1.4");
  });
});

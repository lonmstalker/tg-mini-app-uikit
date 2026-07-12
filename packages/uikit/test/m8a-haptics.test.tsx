import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as kit from "../src/index";

/* M8-A — haptics consistency: carousel page change (CRS-006/CRS-DX-004) and
 * long-press fire (GES-009) buzz like the rest of the kit, no-op off-runtime. */

const slides = (n: number) => Array.from({ length: n }, (_, i) => <div key={i}>{i}</div>);

function withHaptics(buzz: string[], children: React.ReactNode, kind: "selection" | "impact" = "selection") {
  const HapticFeedback =
    kind === "selection"
      ? { selectionChanged: () => buzz.push("sel") }
      : { impactOccurred: (s: string) => buzz.push(s) };
  return (
    <kit.TKTelegramProvider haptics signalReady={false} webApp={{ HapticFeedback } as never}>
      {children}
    </kit.TKTelegramProvider>
  );
}

describe("CRS-006 carousel fires the selection haptic on a landed page change", () => {
  it("[D-TG] a dot tap buzzes selection exactly once", () => {
    const buzz: string[] = [];
    render(withHaptics(buzz, <kit.TKGallery testId="g" gap={10}>{slides(3)}</kit.TKGallery>));
    fireEvent.click(screen.getByRole("button", { name: "Page 2" }));
    expect(buzz).toEqual(["sel"]);
  });

  it("[D-TG] haptics={false} opts out", () => {
    const buzz: string[] = [];
    render(withHaptics(buzz, <kit.TKGallery testId="g" gap={10} haptics={false}>{slides(3)}</kit.TKGallery>));
    fireEvent.click(screen.getByRole("button", { name: "Page 2" }));
    expect(buzz).toEqual([]);
  });

  it("[D-TG] no throw when the runtime is absent (no provider)", () => {
    expect(() =>
      render(
        <kit.TKGallery testId="g" gap={10}>
          {slides(3)}
        </kit.TKGallery>,
      ),
    ).not.toThrow();
    // a dot tap is a safe no-op
    fireEvent.click(screen.getByRole("button", { name: "Page 2" }));
  });
});

describe("GES-009 long-press buzzes an impact haptic when it fires", () => {
  afterEach(() => vi.useRealTimers());

  function LP({ haptic }: { haptic?: boolean }) {
    const h = kit.useLongPress(() => {}, haptic === undefined ? undefined : { haptic });
    return (
      <button type="button" {...h}>
        hold
      </button>
    );
  }

  it("[D-TG] a fired press calls impact('medium') once", () => {
    vi.useFakeTimers();
    const buzz: string[] = [];
    render(withHaptics(buzz, <LP />, "impact"));
    fireEvent.pointerDown(screen.getByRole("button"), { isPrimary: true, clientX: 0, clientY: 0 });
    act(() => vi.advanceTimersByTime(500));
    expect(buzz).toEqual(["medium"]);
  });

  it("[D-TG] haptic:false opts out", () => {
    vi.useFakeTimers();
    const buzz: string[] = [];
    render(withHaptics(buzz, <LP haptic={false} />, "impact"));
    fireEvent.pointerDown(screen.getByRole("button"), { isPrimary: true, clientX: 0, clientY: 0 });
    act(() => vi.advanceTimersByTime(500));
    expect(buzz).toEqual([]);
  });
});

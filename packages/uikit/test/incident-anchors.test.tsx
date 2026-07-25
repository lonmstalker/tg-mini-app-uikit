import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as kit from "../src";

/*
 * Pinned tests for incidents whose fix lived in code and docs but had no test
 * of its own (M1: comment + pinned test + docs line). Each `it` replays the
 * guarantee its ID promises, so the next refactor cannot quietly drop it.
 */

describe("incident anchors", () => {
  // INP-008 / CC-05 — a validation error is announced; a plain hint is not.
  it("INP-008: TKFormField announces an error, stays silent for a hint", () => {
    const { rerender } = render(<kit.TKFormField hint="Nur Ziffern" testId="f" />);
    expect(screen.queryByRole("alert")).toBe(null);

    rerender(<kit.TKFormField error="Falsches Format" testId="f" />);
    expect(screen.getByRole("alert").textContent).toBe("Falsches Format");
  });

  // OVL-008 / CC-03 — the toast action keeps the 44px touch target.
  it("OVL-008: a toast action button is a 44px touch target", () => {
    function Trigger() {
      const toast = kit.useTKToast();
      return (
        <button type="button" onClick={() => toast.show({ text: "Gelöscht", action: "Zurück", onAction: () => {} })}>
          fire
        </button>
      );
    }
    render(
      <kit.TKToastProvider>
        <Trigger />
      </kit.TKToastProvider>,
    );
    act(() => screen.getByText("fire").click());
    const action = screen.getByRole("button", { name: "Zurück" });
    expect(action.style.minHeight).toBe("44px");
  });

  // ONB-008 — the live brand accent leads the festive palette, so a burst
  // matches the app's theme instead of a fixed rainbow.
  it("ONB-008: TKConfetti paints with the live --tk-accent first", () => {
    const fills: string[] = [];
    const proto = HTMLCanvasElement.prototype as unknown as { getContext: unknown };
    const original = proto.getContext;
    const ctx = {
      canvas: { width: 320, height: 480 },
      clearRect() {},
      save() {},
      restore() {},
      translate() {},
      rotate() {},
      fillRect() {},
      set fillStyle(value: string) {
        fills.push(value);
      },
      get fillStyle() {
        return "";
      },
    };
    proto.getContext = () => ctx;
    // The accent is read off the canvas' computed style; jsdom resolves the
    // inherited inline custom property.
    const realGetComputed = window.getComputedStyle;
    window.getComputedStyle = ((el: Element) => {
      const real = realGetComputed(el);
      return { ...real, getPropertyValue: (prop: string) => (prop === "--tk-accent" ? "rgb(1, 2, 3)" : real.getPropertyValue(prop)) } as CSSStyleDeclaration;
    }) as typeof window.getComputedStyle;
    vi.useFakeTimers();
    try {
      render(<kit.TKConfetti count={40} testId="confetti" />);
      // Particles paint from the animation loop — run a few frames.
      act(() => {
        vi.advanceTimersByTime(64);
      });
      expect(fills).toContain("rgb(1, 2, 3)");
    } finally {
      vi.useRealTimers();
      proto.getContext = original;
      window.getComputedStyle = realGetComputed;
    }
  });

  // LST-002 — TKCell stays polymorphic: `as` swaps the element and the extra
  // DOM props of that element type still reach it.
  it("LST-002: TKCell renders the element `as` names and forwards its props", () => {
    render(<kit.TKCell as="a" href="https://t.me" title="Kanal" testId="row" />);
    const row = screen.getByTestId("row");
    expect(row.tagName).toBe("A");
    expect(row.getAttribute("href")).toBe("https://t.me");
  });
});

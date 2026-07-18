import { render, renderHook, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TKAppShell, useTKHostBackground } from "../src";

/* App-level viewport learnings promoted into the kit (wiki/ios-debugging.md):
 * TKAppShell carries the stable-viewport cap + keyboard-riding ease via the
 * .tk-app-shell class (the CSS itself — min(100dvh, --tg-viewport-stable-
 * height) and the t3/ease transition — lives in tokens.css and is asserted
 * there by the tokens contract of the stylesheet, which jsdom cannot
 * compute); useTKHostBackground paints html/body so nothing the host reveals
 * flashes UA-white. */

describe("TKAppShell", () => {
  it("renders the .tk-app-shell class, children, testId and merges className", () => {
    render(
      <TKAppShell testId="shell" className="custom">
        <span>content</span>
      </TKAppShell>,
    );
    const shell = screen.getByTestId("shell");
    expect(shell.className).toBe("tk-app-shell custom");
    expect(shell).toHaveTextContent("content");
  });
});

describe("useTKHostBackground", () => {
  it("paints html/body with the host theme vars and the kit's dark fallback", () => {
    const { unmount } = renderHook(() => useTKHostBackground("dark"));
    expect(document.body.style.background).toContain("--tg-theme-secondary-bg-color");
    expect(document.body.style.background).toContain("#0e1621");
    expect(document.documentElement.style.overscrollBehavior).toBe("none");
    unmount();
    expect(document.body.style.background).toBe("");
    expect(document.documentElement.style.overscrollBehavior).toBe("");
  });

  it("switches the fallback with the resolved theme (light mirrors --tk-bg)", () => {
    const { unmount } = renderHook(() => useTKHostBackground("light"));
    expect(document.body.style.background).toContain("#eef1f6");
    unmount();
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as kit from "../src/index";

/* M9-G — HIGH non-a11y: FRM-001 (mask inputMode forward), INP-003 (OTP autofill),
 * TYP-003 (multi-line clamp), NAV2-004 (swipe-back touch-action). */

describe("FRM-001 TKMaskedInput forwards inputMode", () => {
  it("[D-TG] the inner input carries the requested inputmode", () => {
    const { container } = render(<kit.TKMaskedInput mask="#### #### #### ####" inputMode="numeric" />);
    expect(container.querySelector("input")).toHaveAttribute("inputmode", "numeric");
  });
});

describe("INP-003 TKOTP is autofill/one-time-code friendly", () => {
  it("[D-TG] exposes autocomplete=one-time-code + name, and autofill populates it", () => {
    const onChange = vi.fn();
    const onComplete = vi.fn();
    const { container } = render(<kit.TKOTP length={5} name="code" onChange={onChange} onComplete={onComplete} />);
    const input = container.querySelector("input")!;
    expect(input).toHaveAttribute("autocomplete", "one-time-code");
    expect(input).toHaveAttribute("name", "code");
    // a programmatic value (autofill) flows through
    fireEvent.change(input, { target: { value: "12345" } });
    expect(onChange).toHaveBeenLastCalledWith("12345");
    expect(onComplete).toHaveBeenCalledWith("12345");
  });

  it("[D-A11Y] the hidden input stays focusable (no pointerEvents:none)", () => {
    const { container } = render(<kit.TKOTP />);
    expect((container.querySelector("input") as HTMLInputElement).style.pointerEvents).not.toBe("none");
  });
});

describe("TYP-003 TKText supports a multi-line clamp", () => {
  it("[D-RESP] truncate + lines>1 → -webkit-line-clamp box; single-line stays nowrap", () => {
    const { rerender } = render(
      <kit.TKText truncate lines={2} testId="t">
        long long text
      </kit.TKText>,
    );
    const el = screen.getByTestId("t");
    expect(el.style.display).toBe("-webkit-box");
    expect(el.style.webkitLineClamp).toBe("2");
    expect(el.style.whiteSpace).toBe("normal");

    rerender(
      <kit.TKText truncate testId="t">
        long long text
      </kit.TKText>,
    );
    expect(screen.getByTestId("t").style.whiteSpace).toBe("nowrap");
  });
});

describe("NAV2-004 swipe-back stack yields the right gesture axis", () => {
  it("[D-GESTURE] root is touch-action:pan-y + overscroll contain when swipeBack is on", () => {
    const { rerender } = render(
      <kit.TKNavStack initial="home" testId="stack">
        <kit.TKNavPanel id="home">home</kit.TKNavPanel>
      </kit.TKNavStack>,
    );
    const root = screen.getByTestId("stack");
    expect(root.style.touchAction).toBe("pan-y");
    expect(root.style.overscrollBehavior).toBe("contain");

    rerender(
      <kit.TKNavStack initial="home" swipeBack={false} testId="stack">
        <kit.TKNavPanel id="home">home</kit.TKNavPanel>
      </kit.TKNavStack>,
    );
    expect(screen.getByTestId("stack").style.touchAction).toBe("");
  });
});

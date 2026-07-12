import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as kit from "../src/index";

/* M8-F — CRD-001/CC-13: TKCard (and TKCardChip) forward ref + native/aria props. */

describe("CRD-001 TKCard forwards native + aria props", () => {
  it("[D-API] a clickable card gets aria-label / data / id and stays role=button", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <kit.TKCard ref={ref} onClick={() => {}} aria-label="Open" data-x="1" id="c" testId="card">
        body
      </kit.TKCard>,
    );
    const el = screen.getByTestId("card");
    expect(ref.current).toBe(el);
    expect(el.getAttribute("aria-label")).toBe("Open");
    expect(el.getAttribute("data-x")).toBe("1");
    expect(el.getAttribute("id")).toBe("c");
    expect(el.getAttribute("role")).toBe("button");
    // the role=button now has an accessible name (was the unlabeled-button gap)
    expect(screen.getByRole("button", { name: "Open" })).toBe(el);
  });

  it("[D-API] rest is spread before the controlled props (component keeps its role)", () => {
    // a consumer can't accidentally strip the interactive role via rest
    render(
      <kit.TKCard onClick={() => {}} role="article" aria-label="x" testId="card2">
        c
      </kit.TKCard>,
    );
    // component's role=button wins over the rest-supplied role
    expect(screen.getByTestId("card2").getAttribute("role")).toBe("button");
  });

  it("[D-API] TKCardChip forwards native props and click still fires", () => {
    const ref = createRef<HTMLButtonElement>();
    const onClick = vi.fn();
    render(
      <kit.TKCardChip ref={ref} onClick={onClick} aria-label="Filter" data-y="2" testId="chip">
        Tag
      </kit.TKCardChip>,
    );
    const el = screen.getByTestId("chip");
    expect(ref.current).toBe(el);
    expect(el.getAttribute("aria-label")).toBe("Filter");
    expect(el.getAttribute("data-y")).toBe("2");
    fireEvent.click(el);
    expect(onClick).toHaveBeenCalledOnce();
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as kit from "../src/index";

/* M4 state & field contract: kill auto-select-first, render falsy values,
 * controlled modes, slot reconciliation. */

/* ---------------- INP-001 ---------------- */

describe("INP-001 uncontrolled TKSelect shows the placeholder, never auto-selects", () => {
  it("renders the placeholder and does not fire onChange on mount", () => {
    const onChange = vi.fn();
    render(<kit.TKSelect options={["Lisbon", "Berlin"]} placeholder="Choose…" onChange={onChange} />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Choose…");
    expect(screen.getByRole("combobox")).not.toHaveTextContent("Lisbon");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("explicit defaultValue still pre-selects without firing onChange", () => {
    const onChange = vi.fn();
    render(<kit.TKSelect options={["Lisbon", "Berlin"]} defaultValue="Berlin" onChange={onChange} />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Berlin");
    expect(onChange).not.toHaveBeenCalled();
  });
});

/* ---------------- CTL-002 ---------------- */

describe("CTL-002 uncontrolled TKRadioGroup starts blank", () => {
  it("renders zero checked radios with no defaultValue and no onChange on mount", () => {
    const onChange = vi.fn();
    render(<kit.TKRadioGroup options={["a", "b", "c"]} onChange={onChange} />);
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(3);
    expect(radios.filter((r) => r.getAttribute("aria-checked") === "true")).toHaveLength(0);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("explicit defaultValue selects exactly that option", () => {
    render(<kit.TKRadioGroup options={["a", "b", "c"]} defaultValue="b" />);
    const radios = screen.getAllByRole("radio");
    expect(radios[1]).toHaveAttribute("aria-checked", "true");
    expect(radios[0]).toHaveAttribute("aria-checked", "false");
  });
});

/* ---------------- LST-003 ---------------- */

describe("LST-003 TKCell renders falsy value/badge", () => {
  it("renders value={0} and badge={0}", () => {
    render(<kit.TKCell title="Unread" value={0} badge={0} testId="cell" />);
    const cell = screen.getByTestId("cell");
    expect(cell.querySelector("[data-tk-cell-value]")?.textContent).toBe("0");
    // badge "0" also rendered somewhere in the cell
    expect(cell).toHaveTextContent("0");
  });

  it("renders an empty-string value span", () => {
    render(<kit.TKCell title="Note" value="" testId="cell" />);
    expect(screen.getByTestId("cell").querySelector("[data-tk-cell-value]")).not.toBeNull();
  });

  it("omits the value span when value is absent (null/undefined)", () => {
    render(<kit.TKCell title="Empty" testId="cell" />);
    expect(screen.getByTestId("cell").querySelector("[data-tk-cell-value]")).toBeNull();
  });
});

/* ---------------- NAV-005 ---------------- */

describe("NAV-005 TKTabView works uncontrolled", () => {
  const tabs = [
    { label: "A", icon: "home" as const },
    { label: "B", icon: "search" as const },
  ];
  const panels = [<div key="a">Panel A</div>, <div key="b">Panel B</div>];

  it("uses defaultValue and switches panels on tap with no value/onChange", () => {
    render(<kit.TKTabView tabs={tabs} panels={panels} defaultValue={1} panelTestId={(i) => `p-${i}`} />);
    // Hidden panels keep layout (visibility, not display:none) so inner
    // scroll positions survive a tab switch (2026-07-14 smoothness plan).
    expect(screen.getByTestId("p-1").style.visibility).toBe("visible");
    expect(screen.getByTestId("p-0").style.visibility).toBe("hidden");
    fireEvent.click(screen.getAllByRole("button")[0]); // tab A
    expect(screen.getByTestId("p-0").style.visibility).toBe("visible");
    expect(screen.getByTestId("p-1").style.visibility).toBe("hidden");
  });

  it("controlled mode still delegates to the parent", () => {
    const onChange = vi.fn();
    render(<kit.TKTabView tabs={tabs} panels={panels} value={0} onChange={onChange} panelTestId={(i) => `p-${i}`} />);
    fireEvent.click(screen.getAllByRole("button")[1]);
    expect(onChange).toHaveBeenCalledWith(1);
    expect(screen.getByTestId("p-0").style.visibility).toBe("visible"); // stays until parent updates
  });
});

/* ---------------- CRS-002 ---------------- */

describe("CRS-002 TKGallery controlled page", () => {
  const origScrollTo = (HTMLDivElement.prototype as unknown as { scrollTo?: unknown }).scrollTo;
  const origClientWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientWidth");
  afterEach(() => {
    (HTMLDivElement.prototype as unknown as { scrollTo?: unknown }).scrollTo = origScrollTo;
    if (origClientWidth) Object.defineProperty(HTMLElement.prototype, "clientWidth", origClientWidth);
  });
  function setupTrack(width = 120) {
    const scrollTo = vi.fn();
    (HTMLDivElement.prototype as unknown as { scrollTo: unknown }).scrollTo = scrollTo;
    Object.defineProperty(HTMLDivElement.prototype, "clientWidth", { value: width, configurable: true });
    return scrollTo;
  }

  it("drives the active dot and scrolls when the controlled page changes", () => {
    const scrollTo = setupTrack();
    const slides = [<div key="0">0</div>, <div key="1">1</div>, <div key="2">2</div>];
    const { rerender } = render(
      <kit.TKGallery page={1} testId="g" height={120}>
        {slides}
      </kit.TKGallery>,
    );
    // dot for page 2 (index 1) is current
    expect(screen.getByRole("button", { name: "Page 2" })).toHaveAttribute("aria-current", "true");
    scrollTo.mockClear();
    rerender(
      <kit.TKGallery page={2} testId="g" height={120}>
        {slides}
      </kit.TKGallery>,
    );
    // stride = clientWidth(120) + gap(10) = 130, controlled page 2 → 260 (CRS-001)
    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ left: 260 }));
    expect(screen.getByRole("button", { name: "Page 3" })).toHaveAttribute("aria-current", "true");
  });
});

/* ---------------- PTN-004 ---------------- */

describe("PTN-004 TKSlotPicker reconciles a stale selection", () => {
  const days = [{ label: "Mon", date: "1" }];

  it("clears the selection (and emits cleared) when the slot disappears", () => {
    const onSlotChange = vi.fn();
    const { rerender } = render(
      <kit.TKSlotPicker days={days} slots={["11:00", "12:00", "13:00"]} onSlotChange={onSlotChange} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "12:00" }));
    expect(onSlotChange).toHaveBeenLastCalledWith("12:00");
    rerender(<kit.TKSlotPicker days={days} slots={["11:00", "13:00"]} onSlotChange={onSlotChange} />);
    expect(onSlotChange).toHaveBeenLastCalledWith("");
  });

  it("clears when the slot becomes busy", () => {
    const onSlotChange = vi.fn();
    const { rerender } = render(
      <kit.TKSlotPicker days={days} slots={["11:00", "12:00"]} onSlotChange={onSlotChange} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "12:00" }));
    rerender(<kit.TKSlotPicker days={days} slots={["11:00", "12:00"]} busy={["12:00"]} onSlotChange={onSlotChange} />);
    expect(onSlotChange).toHaveBeenLastCalledWith("");
    // PTN-002: busy slots stay focusable with aria-disabled + an "unavailable" suffix
    // in the name (not native disabled), so AT users perceive them.
    const busySlot = screen.getByRole("button", { name: /12:00.*unavailable/i });
    expect(busySlot).toHaveAttribute("aria-disabled", "true");
  });

  it("keeps a still-valid selection", () => {
    const onSlotChange = vi.fn();
    const { rerender } = render(
      <kit.TKSlotPicker days={days} slots={["11:00", "12:00"]} onSlotChange={onSlotChange} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "12:00" }));
    onSlotChange.mockClear();
    rerender(<kit.TKSlotPicker days={days} slots={["11:00", "12:00"]} onSlotChange={onSlotChange} />);
    expect(onSlotChange).not.toHaveBeenCalled();
  });
});

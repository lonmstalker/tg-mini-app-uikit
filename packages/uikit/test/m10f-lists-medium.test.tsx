import { readFileSync } from "node:fs";
import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as kit from "../src/index";

/* M10-F — lists MEDIUM: LST-008 (accordion reduced-motion), LST-009 (ListGroup
 * keyed reorder), LST-010 (controlled single-mode accordion doesn't self-commit). */

const items = [
  { id: "a", title: "Alpha", content: "CA" },
  { id: "b", title: "Bravo", content: "CB" },
];

describe("LST-008 accordion transitions are class-driven + reduced-motion off", () => {
  const css = readFileSync("src/tokens/tokens.css", "utf8");

  it("[D-MOTION] reduced-motion paths switch the accordion transitions off", () => {
    expect(css).toMatch(/prefers-reduced-motion: reduce[\s\S]*?\.tk-accordion-panel[\s\S]*?transition: none/);
    expect(css).toMatch(/data-tk-motion="off"\][\s\S]*?\.tk-accordion-panel[\s\S]*?transition: none/);
  });

  it("[D-MOTION] the panel uses the class, not an inline transition", () => {
    render(<kit.TKAccordion items={items} defaultValue={["a"]} />);
    const panel = screen.getAllByRole("region")[0];
    expect(panel.classList.contains("tk-accordion-panel")).toBe(true);
    expect((panel as HTMLElement).style.transition).toBe("");
  });
});

describe("LST-009 TKListGroup preserves keyed children across reorder", () => {
  it("[D-STATE] a keyed wrapped input keeps its value when siblings reorder", () => {
    function Harness() {
      const [order, setOrder] = useState(["a", "b"]);
      return (
        <>
          <button onClick={() => setOrder((o) => [...o].reverse())}>reorder</button>
          <kit.TKListGroup>
            {order.map((id) => (
              <input key={id} data-testid={`in-${id}`} defaultValue="" />
            ))}
          </kit.TKListGroup>
        </>
      );
    }
    render(<Harness />);
    const a = screen.getByTestId("in-a") as HTMLInputElement;
    fireEvent.change(a, { target: { value: "typed" } });
    fireEvent.click(screen.getByText("reorder"));
    // moved (key stable), not remounted → value survives
    expect((screen.getByTestId("in-a") as HTMLInputElement).value).toBe("typed");
  });

  it("[D-EDGE] conditional null/false children leave no empty wrapper or leading separator", () => {
    const { container } = render(
      <kit.TKListGroup>
        {false}
        {null}
        <input data-testid="only" defaultValue="x" />
      </kit.TKListGroup>,
    );
    expect(container.querySelectorAll("input")).toHaveLength(1);
    // the single real row is at index 0 → no hairline separator above it
    expect(container.querySelectorAll('div[style*="height: 0.5"]')).toHaveLength(0);
  });
});

describe("LST-010 controlled single-mode accordion doesn't self-commit", () => {
  it("[D-STATE] value=['a','b'] renders only 'a' open and never calls onChange on mount", () => {
    const onChange = vi.fn();
    render(<kit.TKAccordion items={items} value={["a", "b"]} onChange={onChange} />);
    expect(screen.getByRole("button", { name: /Alpha/ }).getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("button", { name: /Bravo/ }).getAttribute("aria-expanded")).toBe("false");
    expect(onChange).not.toHaveBeenCalled();
  });
});

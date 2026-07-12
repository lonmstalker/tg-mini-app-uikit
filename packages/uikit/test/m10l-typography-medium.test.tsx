import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import * as kit from "../src/index";

/* M10-L — typography MEDIUM: TYP-005 (ref forwarding), TYP-006 (heading semantics
 * survive a non-heading `as`), TYP-007 (TKTitle weight + TKText leading override). */

describe("TYP-005 typography forwards refs", () => {
  it("[D-API] TKText/TKTitle/TKCaption forward their ref to the DOM node", () => {
    const t = createRef<HTMLElement>();
    const h = createRef<HTMLElement>();
    const c = createRef<HTMLSpanElement>();
    render(
      <>
        <kit.TKText ref={t}>t</kit.TKText>
        <kit.TKTitle ref={h}>h</kit.TKTitle>
        <kit.TKCaption ref={c}>c</kit.TKCaption>
      </>,
    );
    expect(t.current?.tagName).toBe("SPAN");
    expect(h.current?.tagName).toBe("H2");
    expect(c.current?.tagName).toBe("SPAN");
  });
});

describe("TYP-006 TKTitle keeps heading semantics with a non-heading element", () => {
  it("[D-A11Y] as='div' still exposes role=heading with the level", () => {
    render(
      <kit.TKTitle as="div" level={2}>
        Section
      </kit.TKTitle>,
    );
    expect(screen.getByRole("heading", { level: 2, name: "Section" })).toBeInTheDocument();
  });

  it("[D-A11Y] a native heading element carries no redundant role", () => {
    render(<kit.TKTitle level={1}>Page</kit.TKTitle>);
    const el = screen.getByRole("heading", { level: 1, name: "Page" });
    expect(el.tagName).toBe("H1");
    expect(el.getAttribute("role")).toBeNull();
  });
});

describe("TYP-007 weight + leading overrides", () => {
  it("[D-API] TKTitle weight overrides the hard-coded bold", () => {
    render(
      <kit.TKTitle weight={500} testId="t">
        Light title
      </kit.TKTitle>,
    );
    expect((screen.getByTestId("t") as HTMLElement).style.fontWeight).toBe("500");
  });

  it("[D-API] TKText leading overrides the default line-height", () => {
    render(
      <kit.TKText leading={2} testId="x">
        spaced
      </kit.TKText>,
    );
    expect((screen.getByTestId("x") as HTMLElement).style.lineHeight).toBe("2");
  });
});

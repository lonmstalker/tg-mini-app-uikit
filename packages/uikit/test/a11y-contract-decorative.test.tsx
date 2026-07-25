import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import * as kit from "../src";

/* [D-A11Y] Decorative-contract pins: visual-only components stay OUT of the
   accessibility tree (aria-hidden, no roles), and text-bearing atoms expose
   their content as plain readable text — never information by color alone. */

describe("skeletons are aria-hidden placeholders", () => {
  it("[D-A11Y] every skeleton root is aria-hidden and text-free", () => {
    render(
      <>
        <kit.TKSkeleton testId="s1" />
        <kit.TKSkeletonCard testId="s2" />
        <kit.TKSkeletonList testId="s3" />
        <kit.TKSkeletonTable testId="s4" />
        <kit.TKSkeletonText testId="s5" />
      </>,
    );
    for (const id of ["s1", "s2", "s3", "s4", "s5"]) {
      const el = screen.getByTestId(id);
      expect(el).toHaveAttribute("aria-hidden", "true");
      expect(el.textContent).toBe("");
    }
  });

  it("[D-A11Y] a consumer can re-expose a skeleton via the rest spread", () => {
    render(<kit.TKSkeleton testId="s" aria-hidden={false} role="status" aria-label="Loading" />);
    expect(screen.getByRole("status", { name: "Loading" })).toBe(screen.getByTestId("s"));
  });
});

describe("pure-visual components stay out of the tree", () => {
  it("[D-A11Y] TKDot is roleless and text-free; consumer aria-label passes through", () => {
    render(<kit.TKDot testId="dot" />);
    const dot = screen.getByTestId("dot");
    expect(dot).not.toHaveAttribute("role");
    expect(dot.textContent).toBe("");
    render(<kit.TKDot testId="dot2" aria-label="Online" />);
    expect(screen.getByTestId("dot2")).toHaveAttribute("aria-label", "Online");
  });

  it("[D-A11Y] TKConfetti renders aria-hidden (celebration is visual-only)", () => {
    render(<kit.TKConfetti count={0} testId="confetti" />);
    const el = screen.queryByTestId("confetti");
    // Under prefers-reduced-motion (or after settling with count=0) it renders
    // nothing at all — both outcomes keep it out of the accessibility tree.
    if (el) expect(el).toHaveAttribute("aria-hidden", "true");
  });

  it("[D-A11Y] TKViewportForensics debug overlay is aria-hidden", () => {
    render(<kit.TKViewportForensics testId="vf" />);
    expect(screen.getByTestId("vf")).toHaveAttribute("aria-hidden", "true");
  });

  it("[D-A11Y] TKSafeArea adds layout only — children keep their semantics, root has no role", () => {
    render(
      <kit.TKSafeArea testId="sa">
        <button type="button">Inside</button>
      </kit.TKSafeArea>,
    );
    expect(screen.getByTestId("sa")).not.toHaveAttribute("role");
    expect(screen.getByRole("button", { name: "Inside" })).toBeInTheDocument();
  });
});

describe("text-bearing display atoms read as plain text", () => {
  it("[D-A11Y] TKBadge exposes its children as text; aria-label passes through", () => {
    render(<kit.TKBadge testId="b">New</kit.TKBadge>);
    expect(screen.getByText("New")).toBeInTheDocument();
    render(<kit.TKBadge testId="b2" aria-label="3 unread" />);
    expect(screen.getByTestId("b2")).toHaveAttribute("aria-label", "3 unread");
  });

  it("[D-A11Y] TKCounter renders the (capped) value as text", () => {
    render(<kit.TKCounter value={120} max={99} testId="c" />);
    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  it("[D-A11Y] TKImg placeholder announces itself via its visible label", () => {
    render(<kit.TKImg testId="img" />);
    expect(screen.getByTestId("img").textContent).toBe("image");
    render(<kit.TKImg testId="img2" label="Product photo" />);
    expect(screen.getByText("Product photo")).toBeInTheDocument();
  });

  it("[D-A11Y] TKAvatarStack overflow renders as readable +N text", () => {
    render(
      <kit.TKAvatarStack
        max={2}
        avatars={[{ initials: "AK" }, { initials: "BL" }, { initials: "CM" }, { initials: "DN" }]}
        testId="stack"
      />,
    );
    expect(screen.getByText("+2")).toBeInTheDocument();
    expect(screen.getByText("AK")).toBeInTheDocument();
  });

  it("[D-A11Y] TKBlockquote keeps the semantic <blockquote> element", () => {
    render(<kit.TKBlockquote testId="q">Quoted line</kit.TKBlockquote>);
    expect(document.querySelector("blockquote")).not.toBeNull();
    expect(screen.getByText("Quoted line")).toBeInTheDocument();
  });
});

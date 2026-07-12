import { type ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as kit from "../src/index";
import { TKLocaleProvider, ruLocale } from "../src/foundation/i18n";

/* M10-A — feedback MEDIUM: FBK-004 (bars selection a11y), FBK-005 (localized
 * async defaults), FBK-010 (EmptyState heading). */

describe("FBK-004 TKBars selection semantics", () => {
  it("[D-A11Y] action bars without selectedIndex expose NO aria-pressed", () => {
    render(<kit.TKBars data={[1, 2]} onBarClick={vi.fn()} />);
    for (const b of screen.getAllByRole("button")) expect(b).not.toHaveAttribute("aria-pressed");
  });

  it("[D-STATE] selectedIndex marks only the chosen bar aria-pressed=true", () => {
    render(<kit.TKBars data={[10, 20, 30]} selectedIndex={1} onBarClick={vi.fn()} />);
    const [b0, b1, b2] = screen.getAllByRole("button");
    expect(b1).toHaveAttribute("aria-pressed", "true");
    expect(b0).toHaveAttribute("aria-pressed", "false");
    expect(b2).toHaveAttribute("aria-pressed", "false");
  });

  it("[D-EDGE] out-of-range selectedIndex leaves every bar aria-pressed=false", () => {
    render(<kit.TKBars data={[1, 2]} selectedIndex={99} onBarClick={vi.fn()} />);
    for (const b of screen.getAllByRole("button")) expect(b).toHaveAttribute("aria-pressed", "false");
  });
});

describe("FBK-005 TKAsyncState localized defaults", () => {
  const ru = (ui: ReactNode) => <TKLocaleProvider locale={ruLocale}>{ui}</TKLocaleProvider>;

  it("[D-I18N] ru error defaults are Russian, not hardcoded English", () => {
    render(ru(<kit.TKAsyncState status="error" onRetry={vi.fn()} />));
    expect(screen.queryByText("Something went wrong")).toBeNull();
    expect(screen.getByText(ruLocale.asyncErrorTitle)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: ruLocale.asyncRetry })).toBeInTheDocument();
  });

  it("[D-API] an explicit errorTitle prop overrides the locale default", () => {
    render(ru(<kit.TKAsyncState status="error" errorTitle="Кастомный сбой" onRetry={vi.fn()} />));
    expect(screen.getByText("Кастомный сбой")).toBeInTheDocument();
    expect(screen.queryByText(ruLocale.asyncErrorTitle)).toBeNull();
  });

  it("[D-I18N] empty status pulls localized emptyTitle by default", () => {
    render(ru(<kit.TKAsyncState status="empty" />));
    expect(screen.queryByText("Nothing here yet")).toBeNull();
    expect(screen.getByText(ruLocale.asyncEmptyTitle)).toBeInTheDocument();
  });

  it("[D-API] testId anchors the error state's alert root", () => {
    render(<kit.TKAsyncState status="error" onRetry={vi.fn()} testId="async" />);
    expect(screen.getByTestId("async")).toHaveAttribute("role", "alert");
  });
});

describe("FBK-010 TKEmptyState heading semantics", () => {
  it("[D-A11Y] title is exposed as a heading", () => {
    render(<kit.TKEmptyState title="No orders" />);
    expect(screen.getByRole("heading", { name: "No orders" })).toBeInTheDocument();
  });

  it("[D-API] default heading level is 2; headingLevel overrides it", () => {
    const { rerender } = render(<kit.TKEmptyState title="A" />);
    expect(screen.getByRole("heading", { name: "A" })).toHaveAttribute("aria-level", "2");
    rerender(<kit.TKEmptyState title="A" headingLevel={3} />);
    expect(screen.getByRole("heading", { name: "A" })).toHaveAttribute("aria-level", "3");
  });

  it("[D-EDGE] no title renders no heading", () => {
    render(<kit.TKEmptyState text="Just text" />);
    expect(screen.queryByRole("heading")).toBeNull();
  });

  it("[D-EDGE] out-of-range headingLevel is clamped into 1–6", () => {
    const { rerender } = render(<kit.TKEmptyState title="A" headingLevel={9} />);
    expect(screen.getByRole("heading", { name: "A" })).toHaveAttribute("aria-level", "6");
    rerender(<kit.TKEmptyState title="A" headingLevel={0} />);
    expect(screen.getByRole("heading", { name: "A" })).toHaveAttribute("aria-level", "1");
  });
});

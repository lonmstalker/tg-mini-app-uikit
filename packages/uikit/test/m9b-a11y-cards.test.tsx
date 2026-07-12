import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as kit from "../src/index";

/* M9-B — card a11y: CRD-002 (chip disabled + name), TCRD-003 (booking action
 * is a real button), TCRD-004 (clickable product card is keyboard-operable). */

describe("CRD-002 TKCardChip disabled + accessible name", () => {
  it("[D-A11Y] disabled chip has the disabled attribute and doesn't fire onClick", () => {
    const onClick = vi.fn();
    render(
      <kit.TKCardChip disabled onClick={onClick} testId="chip">
        Tag
      </kit.TKCardChip>,
    );
    const btn = screen.getByTestId("chip") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("[D-A11Y] aria-label gives the chip an accessible name", () => {
    render(<kit.TKCardChip aria-label="Filter">★</kit.TKCardChip>);
    expect(screen.getByRole("button", { name: "Filter" })).toBeInTheDocument();
  });
});

describe("TCRD-003 TKBookingCard action is a real button", () => {
  it("[D-A11Y] role=button with an accessible name; activates onAction", () => {
    const onAction = vi.fn();
    render(<kit.TKBookingCard name="Meeting" actionLabel="Check in" onAction={onAction} />);
    const btn = screen.getByRole("button", { name: "Check in" });
    expect(btn.tagName).toBe("BUTTON"); // native → keyboard-operable
    fireEvent.click(btn);
    expect(onAction).toHaveBeenCalledOnce();
  });
});

describe("TCRD-004 TKProductCardA clickable card is keyboard-operable", () => {
  it("[D-A11Y] a real overlay button (named by title) makes the card operable; the card div is not a nested role=button", () => {
    const onClick = vi.fn();
    render(<kit.TKProductCardA title="P" price="$1" onClick={onClick} testId="card" />);
    // the card div itself is NOT role=button (would nest the add button — a11y bug)
    expect(screen.getByTestId("card").getAttribute("role")).toBeNull();
    // a real <button> overlay, named by the title, drives the click + keyboard
    const overlay = screen.getByRole("button", { name: "P" });
    expect(overlay.tagName).toBe("BUTTON");
    fireEvent.click(overlay);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("[D-EDGE] the add button is a separate sibling control, not nested in the card button", () => {
    const onClick = vi.fn();
    const onAdd = vi.fn();
    render(<kit.TKProductCardA title="P" price="$1" onClick={onClick} onAdd={onAdd} testId="card" />);
    const add = screen.getByRole("button", { name: /add to cart|в корзину/i });
    const overlay = screen.getByRole("button", { name: "P" });
    expect(overlay.contains(add)).toBe(false); // not nested
    fireEvent.click(add);
    expect(onAdd).toHaveBeenCalledOnce();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("[D-A11Y] a non-clickable card has no overlay button", () => {
    render(<kit.TKProductCardA title="P" price="$1" testId="card" />);
    expect(screen.queryByRole("button", { name: "P" })).toBeNull();
  });
});

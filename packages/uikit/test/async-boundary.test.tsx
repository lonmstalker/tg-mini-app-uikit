import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AsyncBoundary, TKAsyncBoundary } from "../src/index";

describe("TKAsyncBoundary", () => {
  it("shows the loader while loading, never the children", () => {
    render(
      <TKAsyncBoundary loading testId="state">
        <div>ready content</div>
      </TKAsyncBoundary>,
    );
    expect(screen.queryByText("ready content")).not.toBeInTheDocument();
  });

  it("shows an error state with a working retry", () => {
    const onRetry = vi.fn();
    render(
      <TKAsyncBoundary error onRetry={onRetry} errorTitle="Failed" retryLabel="Again">
        <div>ready content</div>
      </TKAsyncBoundary>,
    );
    expect(screen.getByText("Failed")).toBeInTheDocument();
    expect(screen.queryByText("ready content")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Again" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("shows the empty state when empty", () => {
    render(
      <TKAsyncBoundary empty emptyTitle="Nothing">
        <div>ready content</div>
      </TKAsyncBoundary>,
    );
    expect(screen.getByText("Nothing")).toBeInTheDocument();
    expect(screen.queryByText("ready content")).not.toBeInTheDocument();
  });

  it("renders children when ready (loading > error > empty precedence)", () => {
    render(
      <TKAsyncBoundary loading={false} error={false} empty={false}>
        <div>ready content</div>
      </TKAsyncBoundary>,
    );
    expect(screen.getByText("ready content")).toBeInTheDocument();
  });
});

// A8: the un-prefixed export stays as a deprecated alias so existing imports
// keep working until the next major.
describe("AsyncBoundary (deprecated alias)", () => {
  it("is the same component as TKAsyncBoundary", () => {
    expect(AsyncBoundary).toBe(TKAsyncBoundary);
  });
});

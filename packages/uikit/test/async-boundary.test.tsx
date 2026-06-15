import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AsyncBoundary } from "../src/index";

describe("AsyncBoundary", () => {
  it("shows the loader while loading, never the children", () => {
    render(
      <AsyncBoundary loading testId="state">
        <div>ready content</div>
      </AsyncBoundary>,
    );
    expect(screen.queryByText("ready content")).not.toBeInTheDocument();
  });

  it("shows an error state with a working retry", () => {
    const onRetry = vi.fn();
    render(
      <AsyncBoundary error onRetry={onRetry} errorTitle="Failed" retryLabel="Again">
        <div>ready content</div>
      </AsyncBoundary>,
    );
    expect(screen.getByText("Failed")).toBeInTheDocument();
    expect(screen.queryByText("ready content")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Again" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("shows the empty state when empty", () => {
    render(
      <AsyncBoundary empty emptyTitle="Nothing">
        <div>ready content</div>
      </AsyncBoundary>,
    );
    expect(screen.getByText("Nothing")).toBeInTheDocument();
    expect(screen.queryByText("ready content")).not.toBeInTheDocument();
  });

  it("renders children when ready (loading > error > empty precedence)", () => {
    render(
      <AsyncBoundary loading={false} error={false} empty={false}>
        <div>ready content</div>
      </AsyncBoundary>,
    );
    expect(screen.getByText("ready content")).toBeInTheDocument();
  });
});

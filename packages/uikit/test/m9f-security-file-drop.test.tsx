import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as kit from "../src/index";

/* M9-F — INP-005 (D-SEC): a drop bypasses the picker's native `accept` filter,
 * so TKFileInput must enforce the allowlist itself on the drop path. */

const drop = (el: Element, files: File[]) => fireEvent.drop(el, { dataTransfer: { files } });

describe("INP-005 TKFileInput drop path enforces `accept`", () => {
  it("[D-SEC] a disallowed type dropped onto an image-only zone is rejected", () => {
    const onFilesChange = vi.fn();
    render(<kit.TKFileInput dropZone accept="image/*" onFilesChange={onFilesChange} />);
    const zone = screen.getByRole("button");

    drop(zone, [new File(["%PDF"], "doc.pdf", { type: "application/pdf" })]);
    expect(onFilesChange).not.toHaveBeenCalled();

    const png = new File(["x"], "pic.png", { type: "image/png" });
    drop(zone, [png]);
    expect(onFilesChange).toHaveBeenCalledWith([png]);
  });

  it("[D-SEC] a mixed drop keeps only the allowed files", () => {
    const onFilesChange = vi.fn();
    render(<kit.TKFileInput dropZone multiple accept=".png,image/jpeg" onFilesChange={onFilesChange} />);
    const png = new File(["x"], "a.png", { type: "image/png" });
    const jpg = new File(["x"], "b.jpg", { type: "image/jpeg" });
    const pdf = new File(["x"], "c.pdf", { type: "application/pdf" });
    drop(screen.getByRole("button"), [png, pdf, jpg]);
    expect(onFilesChange).toHaveBeenCalledWith([png, jpg]);
  });

  it("[D-EDGE] with no `accept`, anything is allowed", () => {
    const onFilesChange = vi.fn();
    render(<kit.TKFileInput dropZone onFilesChange={onFilesChange} />);
    const pdf = new File(["x"], "c.pdf", { type: "application/pdf" });
    drop(screen.getByRole("button"), [pdf]);
    expect(onFilesChange).toHaveBeenCalledWith([pdf]);
  });

  it("[D-EDGE] accept='*/*' means everything (not nothing)", () => {
    const onFilesChange = vi.fn();
    render(<kit.TKFileInput dropZone accept="*/*" onFilesChange={onFilesChange} />);
    const pdf = new File(["x"], "c.pdf", { type: "application/pdf" });
    drop(screen.getByRole("button"), [pdf]);
    expect(onFilesChange).toHaveBeenCalledWith([pdf]);
  });

  it("[D-SEC] an SVG is not auto-previewed via createObjectURL", () => {
    const create = vi.spyOn(URL, "createObjectURL");
    const svg = new File(["<svg/>"], "x.svg", { type: "image/svg+xml" });
    render(<kit.TKFileInput dropZone accept="image/*" onFilesChange={() => {}} testId="f" />);
    drop(screen.getByRole("button"), [svg]);
    expect(create).not.toHaveBeenCalled();
    create.mockRestore();
  });
});

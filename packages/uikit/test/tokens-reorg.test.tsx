import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import * as kit from "../src";
import {
  TKCaption,
  TKText,
  TKTitle,
  type TKTextProps,
  type TKTitleProps,
} from "../src/tokens/typography";

const testDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(testDir, "..");
const tokensPath = join(packageRoot, "src/tokens/tokens.css");
const oldTokensPath = join(packageRoot, "src/styles/tokens.css");

describe("tokens module reorganization", () => {
  it("publishes typography components from the token category and root package", () => {
    expect(TKText).toBe(kit.TKText);
    expect(TKTitle).toBe(kit.TKTitle);
    expect(TKCaption).toBe(kit.TKCaption);

    const textProps = { tone: "accent", weight: 600 } satisfies TKTextProps;
    const titleProps = { level: 1, tone: "primary" } satisfies TKTitleProps;
    expect(textProps).toEqual({ tone: "accent", weight: 600 });
    expect(titleProps).toEqual({ level: 1, tone: "primary" });
  });

  it("keeps the design token stylesheet in the token category only", () => {
    expect(existsSync(tokensPath)).toBe(true);
    expect(existsSync(oldTokensPath)).toBe(false);
    expect(readFileSync(tokensPath, "utf8")).toContain("@layer tk");
  });

  it("renders typography through token variables", () => {
    render(
      <div>
        <TKTitle level={1}>Token title</TKTitle>
        <TKText as="p" tone="secondary">
          Token text
        </TKText>
        <TKCaption uppercase>Token caption</TKCaption>
      </div>,
    );

    expect(screen.getByRole("heading", { name: "Token title", level: 1 })).toBeVisible();
    expect(screen.getByText("Token text")).toHaveStyle({ color: "var(--tk-text-2)" });
    expect(screen.getByText("Token caption")).toHaveStyle({ textTransform: "uppercase" });
  });
});

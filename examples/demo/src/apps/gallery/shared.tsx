import { useState, type ReactNode } from "react";
import { TKButton, TKIcon, TKSheet, useTKToast } from "tg-mini-app-uikit";
import { SECTION_SNIPPETS } from "./snippets";

export const LONG_TITLE = "Hand-thrown stoneware mug with a reactive glaze, 350 ml, dishwasher safe";

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function sectionSlug(title: string): string {
  return title.split("·")[0].trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function SectionCode({ slug }: { slug: string }) {
  const toast = useTKToast();
  const [open, setOpen] = useState(false);
  const code = SECTION_SNIPPETS[slug];
  if (!code) return null;
  return (
    <>
      <button
        type="button"
        className="tk-press"
        data-demo-section-code={slug}
        onClick={() => setOpen(true)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          border: "none",
          background: "transparent",
          color: "var(--tk-accent-ink)",
          fontFamily: "inherit",
          fontSize: "var(--tk-fz-caption)",
          fontWeight: 700,
          cursor: "pointer",
          padding: 0,
        }}
      >
        <TKIcon name="copy" size={13} /> code
      </button>
      <TKSheet open={open} onClose={() => setOpen(false)} title={`${slug} · JSX`} testId="demo-snippet-sheet">
        <pre
          style={{
            margin: "0 0 12px",
            padding: "12px 14px",
            borderRadius: "var(--tk-r-md)",
            background: "var(--tk-surface-2)",
            overflowX: "auto",
            fontSize: "var(--tk-fz-caption)",
            fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
            lineHeight: 1.5,
            maxHeight: 320,
          }}
        >
          {code}
        </pre>
        <TKButton
          full
          variant="tonal"
          icon="copy"
          testId="demo-snippet-copy"
          onClick={() => {
            void navigator.clipboard?.writeText(code).catch(() => {});
            toast.show({ icon: "copy", text: "Snippet copied" });
          }}
        >
          Copy snippet
        </TKButton>
      </TKSheet>
    </>
  );
}

export function Section({
  title,
  children,
  pad = true,
  lazy = true,
}: {
  title: string;
  children: ReactNode;
  pad?: boolean;
  /** Skip offscreen layout/paint. Off for sections with overflowing popovers. */
  lazy?: boolean;
}) {
  return (
    <section
      data-demo-section={sectionSlug(title)}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        ...(lazy
          ? {
              contentVisibility: "auto" as const,
              containIntrinsicSize: "auto 320px",
              // paint-box buffer: focus rings, pulse rings and card shadows would otherwise clip
              padding: 10,
              margin: -10,
            }
          : null),
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          padding: pad ? 0 : "0 16px",
        }}
      >
        <span
          style={{
            fontSize: "var(--tk-fz-caption)",
            fontWeight: 600,
            letterSpacing: ".05em",
            textTransform: "uppercase",
            color: "var(--tk-text-3)",
          }}
        >
          {title}
        </span>
        <SectionCode slug={sectionSlug(title)} />
      </div>
      {children}
    </section>
  );
}

import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type CSSProperties, type ReactNode } from "react";
import { TKButton } from "tg-mini-app-uikit";
import { AppScreen, Narrow } from "../story-helpers";

const meta = {
  title: "Foundation/Motion",
  parameters: {
    docs: {
      description: {
        component:
          "Motion tokens and the shared keyframe library. Durations `--tk-t1/t2/t3` (140/260/440ms ÷ the `--tk-ms` speed multiplier), easings `--tk-spring` / `--tk-ease`. Everything collapses to ~1ms under `prefers-reduced-motion` or `TKProvider reduceMotion` (toolbar → Motion → Reduced).",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

const SHAPE: CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: "var(--tk-r-sm)",
  background: "var(--tk-accent)",
};

function kf(name: string, t = "var(--tk-t2)", ease = "var(--tk-spring)"): CSSProperties {
  return { ...SHAPE, animation: `${name} ${t} ${ease} both` };
}

function Tile({ label, note, children }: { label: string; note: string; children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        padding: 12,
        background: "var(--tk-surface)",
        borderRadius: "var(--tk-r-md)",
        boxShadow: "var(--tk-shadow-sm)",
        overflow: "hidden",
      }}
    >
      <div aria-hidden="true" style={{ height: 52, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {children}
      </div>
      <code style={{ fontSize: "var(--tk-fz-caption2)" }}>{label}</code>
      <span style={{ fontSize: "var(--tk-fz-caption2)", color: "var(--tk-text-2)", textAlign: "center" }}>{note}</span>
    </div>
  );
}

function KeyframesPreview() {
  // Bumping the key remounts every tile, so the one-shot animations re-play.
  const [run, setRun] = useState(0);
  return (
    <AppScreen>
      <Narrow>
        <TKButton onClick={() => setRun((n) => n + 1)}>Replay</TKButton>
      </Narrow>
      <div key={run} style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        <Tile label=".tk-pop" note="badges, checkmarks">
          <div className="tk-pop" style={SHAPE} />
        </Tile>
        <Tile label=".tk-rise" note="list/screen entrances">
          <div className="tk-rise" style={SHAPE} />
        </Tile>
        <Tile label=".tk-shake" note="TKPinInput error">
          <div className="tk-shake" style={SHAPE} />
        </Tile>
        <Tile label="tk-fade-in" note="scrims, overlays">
          <div style={kf("tk-fade-in", "var(--tk-t2)", "var(--tk-ease)")} />
        </Tile>
        <Tile label="tk-modal-in" note="TKDialog enter">
          <div style={kf("tk-modal-in")} />
        </Tile>
        <Tile label="tk-toast-in" note="toast enter">
          <div style={kf("tk-toast-in")} />
        </Tile>
        <Tile label="tk-nav-in" note="TKNavStack push">
          <div style={{ ...kf("tk-nav-in", "var(--tk-t3)", "var(--tk-ease)"), width: 52 }} />
        </Tile>
        <Tile label="tk-sheet-up" note="TKSheet enter">
          <div style={{ ...kf("tk-sheet-up", "var(--tk-t3)"), height: 40 }} />
        </Tile>
        <Tile label="tk-spin" note="TKSpinner (stays on under reduced motion)">
          <div style={{ ...SHAPE, borderRadius: "50%", background: "none", border: "3px solid var(--tk-accent-20)", borderTopColor: "var(--tk-accent)", animation: "tk-spin 900ms linear infinite" }} />
        </Tile>
        <Tile label="tk-shimmer" note="skeletons (.tk-skel)">
          <div className="tk-skel" style={{ width: 72, height: 16 }} />
        </Tile>
        <Tile label="tk-pulse" note="TKDot pulse, timeline node">
          <span className="tk-pulse" style={{ display: "block", width: 12, height: 12, borderRadius: "50%", background: "var(--tk-accent)" }} />
        </Tile>
        <Tile label="tk-marquee" note="TKNoticeBar overflow ticker (.tk-marquee-track)">
          <div aria-hidden="true" style={{ width: 72, overflow: "hidden" }}>
            <div className="tk-marquee-track" style={{ display: "flex", width: "max-content", ["--tk-marquee-dur" as string]: "4s" }}>
              <span style={{ whiteSpace: "nowrap", paddingRight: 24 }}>Season sale — up to 40% off</span>
              <span style={{ whiteSpace: "nowrap", paddingRight: 24 }}>Season sale — up to 40% off</span>
            </div>
          </div>
        </Tile>
      </div>
    </AppScreen>
  );
}

export const KeyframeLibrary = {
  parameters: { fullBleed: true },
  render: () => <KeyframesPreview />,
} satisfies Story;

function TimingRow({ label, t, ease, on }: { label: string; t: string; ease: string; on: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <code style={{ width: 120, fontSize: "var(--tk-fz-caption2)", flexShrink: 0 }}>{label}</code>
      {/* containerType on the track so the puck travels `100cqw - track padding - puck` of its own width */}
      <div aria-hidden="true" style={{ flex: 1, height: 28, borderRadius: "var(--tk-r-pill)", background: "var(--tk-surface-2)", padding: 4, containerType: "inline-size" }}>
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "var(--tk-accent)",
            transform: on ? "translateX(calc(100cqw - 20px))" : "none",
            transition: `transform ${t} ${ease}`,
          }}
        />
      </div>
    </div>
  );
}

function TimingPreview() {
  const [on, setOn] = useState(false);
  return (
    <AppScreen>
      <Narrow>
        <TKButton onClick={() => setOn((v) => !v)}>Run</TKButton>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <TimingRow label="--tk-t1 · 140ms" t="var(--tk-t1)" ease="var(--tk-ease)" on={on} />
          <TimingRow label="--tk-t2 · 260ms" t="var(--tk-t2)" ease="var(--tk-ease)" on={on} />
          <TimingRow label="--tk-t3 · 440ms" t="var(--tk-t3)" ease="var(--tk-ease)" on={on} />
          <TimingRow label="--tk-spring" t="var(--tk-t3)" ease="var(--tk-spring)" on={on} />
          <TimingRow label="--tk-ease" t="var(--tk-t3)" ease="var(--tk-ease)" on={on} />
        </div>
      </Narrow>
    </AppScreen>
  );
}

export const DurationsAndEasings = {
  parameters: { fullBleed: true },
  render: () => <TimingPreview />,
} satisfies Story;

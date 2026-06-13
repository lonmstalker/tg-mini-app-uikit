import { useState, type ReactNode } from "react";
import {
  TKAvatar,
  TKBadge,
  TKButton,
  TKCardCell,
  TKCell,
  TKFrame,
  TKListGroup,
  TKNavPanel,
  TKNavStack,
  TKSheet,
  useNav,
} from "tg-mini-app-uikit";
import type { MockSensorState, MockSensorValues } from "../../telegram/mock";

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        style={{
          fontSize: "var(--tk-fz-caption)",
          fontWeight: 600,
          letterSpacing: ".05em",
          textTransform: "uppercase",
          color: "var(--tk-text-3)",
        }}
      >
        {title}
      </div>
      {children}
    </section>
  );
}

export function BackPriorityDemo({ onPressBack, backVisible }: { onPressBack: () => void; backVisible: boolean }) {
  const [pushed, setPushed] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  return (
    <div data-demo-back-priority style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <TKFrame height={210}>
        <TKNavStack initial="list" backButton={false} testId="bp-stack" onStackChange={(s) => setPushed(s.length > 1)}>
          <TKNavPanel id="list">
            <BPList />
          </TKNavPanel>
          <TKNavPanel id="details">
            <BPDetails onOpenSheet={() => setSheetOpen(true)} />
          </TKNavPanel>
        </TKNavStack>
        <TKSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Filters" testId="bp-sheet">
          <div style={{ fontSize: "var(--tk-fz-sub)", color: "var(--tk-text-2)", paddingBottom: 10 }}>
            While this sheet is open it owns the Back press.
          </div>
        </TKSheet>
      </TKFrame>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <TKButton size="sm" variant="surface" onClick={onPressBack} testId="bp-press-back">
          Press native Back
        </TKButton>
        <span style={{ fontSize: "var(--tk-fz-caption)", color: "var(--tk-text-3)" }}>
          {sheetOpen ? "→ closes the sheet" : pushed ? "→ pops the stack" : backVisible ? "→ host handles it" : "queue is empty"}
        </span>
      </div>
    </div>
  );
}

export function BPList() {
  const nav = useNav();
  return (
    <div style={{ padding: 10 }}>
      <TKListGroup>
        <TKCell icon="document" title="Open details" chevron onClick={() => nav.push("details")} testId="bp-open-details" />
      </TKListGroup>
    </div>
  );
}

export function BPDetails({ onOpenSheet }: { onOpenSheet: () => void }) {
  const nav = useNav();
  return (
    <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
      <TKCardCell title="Details screen" subtitle="depth 2 — Back pops to the list" before={<TKAvatar initials="D" size={32} />} />
      <TKButton size="sm" variant="tonal" onClick={onOpenSheet} testId="bp-open-sheet">
        Open sheet
      </TKButton>
      <TKButton size="sm" variant="plain" onClick={() => nav.pop()}>
        Pop
      </TKButton>
    </div>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        background: "var(--tk-surface)",
        borderRadius: "var(--tk-r-md)",
        boxShadow: "var(--tk-shadow-sm)",
        padding: "12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {children}
    </div>
  );
}

export function KV({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: "var(--tk-fz-sub)" }}>
      <span style={{ color: "var(--tk-text-2)" }}>{label}</span>
      <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  );
}

export function ColorKV({ label, value }: { label: string; value?: string }) {
  return (
    <KV
      label={label}
      value={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span
            aria-hidden
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: value,
              boxShadow: "inset 0 0 0 1px var(--tk-sep)",
            }}
          />
          {value ?? "—"}
        </span>
      }
    />
  );
}

export const fmtReading = (n?: number) => (n == null ? "—" : n.toFixed(2));

export function SensorRow({
  label,
  sensor,
  format,
  onStart,
  onStop,
  testId,
}: {
  label: string;
  sensor: MockSensorState;
  format: (values: MockSensorValues) => string;
  onStart: () => void;
  onStop: () => void;
  testId: string;
}) {
  return (
    <div data-demo-sensor={testId} style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "var(--tk-fz-sub)", fontWeight: 600 }}>{label}</div>
        <div
          style={{
            fontSize: "var(--tk-fz-caption)",
            color: "var(--tk-text-2)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {sensor.isStarted ? format(sensor.values) : "not started"}
        </div>
      </div>
      <TKButton size="sm" variant={sensor.isStarted ? "tonal" : "filled"} onClick={sensor.isStarted ? onStop : onStart}>
        {sensor.isStarted ? "Stop" : "Start"}
      </TKButton>
    </div>
  );
}

export function HookStatus({
  label,
  hook,
}: {
  label: string;
  hook: { isSupported: boolean; status?: ReactNode; error?: ReactNode };
}) {
  return (
    <KV
      label={label}
      value={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <TKBadge tone={hook.isSupported ? "green" : "gray"} soft>
            {hook.isSupported ? "supported" : "fallback"}
          </TKBadge>
          <span>{hook.status ?? "idle"}</span>
          {hook.error ? <span style={{ color: "var(--tk-red)" }}>{hook.error}</span> : null}
        </span>
      }
    />
  );
}

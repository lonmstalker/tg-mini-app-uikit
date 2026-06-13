import { useMemo, useState, type ReactNode } from "react";
import {
  TKButton,
  TKCalendar,
  TKCell,
  TKInput,
  TKListGroup,
  TKNavPanel,
  TKNavStack,
  TKSegmented,
  TKSheet,
  TKSwitch,
  TKFrame,
  useNav,
  useTKToast,
  type TKButtonSize,
  type TKButtonVariant,
} from "tg-mini-app-uikit";

/*
 * Prop playground (M8.3): live preview + knob controls (built from the kit
 * itself) + a generated, copyable snippet for 6 key components.
 */

type PlaygroundTarget = "Button" | "Input" | "Sheet" | "Cell" | "Calendar" | "NavStack";

const TARGETS: PlaygroundTarget[] = ["Button", "Input", "Sheet", "Cell", "Calendar", "NavStack"];

function Snippet({ code }: { code: string }) {
  const toast = useTKToast();
  return (
    <div style={{ position: "relative" }}>
      <pre
        data-demo-playground-code
        style={{
          margin: 0,
          padding: "12px 14px",
          borderRadius: "var(--tk-r-md)",
          background: "var(--tk-surface)",
          boxShadow: "inset 0 0 0 1px var(--tk-sep)",
          overflowX: "auto",
          fontSize: "var(--tk-fz-caption)",
          fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
          lineHeight: 1.5,
        }}
      >
        {code}
      </pre>
      <span style={{ position: "absolute", top: 6, right: 6 }}>
        <TKButton
          size="sm"
          variant="surface"
          icon="copy"
          testId="playground-copy"
          onClick={() => {
            void navigator.clipboard?.writeText(code).catch(() => {});
            toast.show({ icon: "copy", text: "Copied" });
          }}
        >
          Copy
        </TKButton>
      </span>
    </div>
  );
}

function Knob({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: "var(--tk-fz-caption2)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--tk-text-3)" }}>
        {label}
      </span>
      {children}
    </div>
  );
}

function ButtonPlayground() {
  const [variant, setVariant] = useState<TKButtonVariant>("filled");
  const [size, setSize] = useState<TKButtonSize>("md");
  const [pill, setPill] = useState(false);
  const [loading, setLoading] = useState(false);
  const code = `<TKButton variant="${variant}" size="${size}"${pill ? " pill" : ""}${loading ? " loading" : ""}>\n  Pay $42\n</TKButton>`;
  return (
    <>
      <div style={{ display: "flex", justifyContent: "center", padding: 18 }}>
        <TKButton variant={variant} size={size} pill={pill} loading={loading} testId="playground-button">
          Pay $42
        </TKButton>
      </div>
      <Knob label="variant">
        <TKSegmented full options={["filled", "tonal", "plain", "outline", "destructive"]} value={variant} onChange={(v) => setVariant(v as TKButtonVariant)} />
      </Knob>
      <Knob label="size">
        <TKSegmented full options={["sm", "md", "lg"]} value={size} onChange={(v) => setSize(v as TKButtonSize)} />
      </Knob>
      <div style={{ display: "flex", gap: 16 }}>
        <TKSwitch label="pill" checked={pill} onChange={setPill} />
        <TKSwitch label="loading" checked={loading} onChange={setLoading} />
      </div>
      <Snippet code={code} />
    </>
  );
}

function InputPlayground() {
  const [password, setPassword] = useState(false);
  const [counter, setCounter] = useState(true);
  const [error, setError] = useState(false);
  const code = `<TKInput\n  label="Name"${password ? '\n  type="password"' : ""}${counter ? "\n  maxLength={24}" : ""}${error ? '\n  error="Required field"' : ""}\n/>`;
  return (
    <>
      <TKInput label="Name" type={password ? "password" : "text"} maxLength={counter ? 24 : undefined} error={error ? "Required field" : undefined} placeholder="Anna" />
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <TKSwitch label="password" checked={password} onChange={setPassword} />
        <TKSwitch label="counter" checked={counter} onChange={setCounter} />
        <TKSwitch label="error" checked={error} onChange={setError} />
      </div>
      <Snippet code={code} />
    </>
  );
}

function SheetPlayground() {
  const [open, setOpen] = useState(false);
  const [snaps, setSnaps] = useState(true);
  const [dismissible, setDismissible] = useState(true);
  const code = `<TKSheet\n  open={open}\n  onClose={() => setOpen(false)}\n  title="Order"${snaps ? "\n  snapPoints={[0.45, 0.85]}" : ""}${dismissible ? "" : "\n  dismissible={false}"}\n/>`;
  return (
    <>
      <TKButton variant="tonal" onClick={() => setOpen(true)} testId="playground-sheet-open">
        Open sheet
      </TKButton>
      <div style={{ display: "flex", gap: 16 }}>
        <TKSwitch label="snapPoints" checked={snaps} onChange={setSnaps} />
        <TKSwitch label="dismissible" checked={dismissible} onChange={setDismissible} />
      </div>
      <Snippet code={code} />
      <TKSheet open={open} onClose={() => setOpen(false)} title="Order" snapPoints={snaps ? [0.45, 0.85] : undefined} dismissible={dismissible}>
        <div style={{ paddingBottom: 12, color: "var(--tk-text-2)", fontSize: "var(--tk-fz-sub)" }}>
          {dismissible ? "Swipe down, tap the scrim or press Escape to close." : "Use the × button — the sheet is not dismissible."}
        </div>
        {!dismissible ? (
          <TKButton full variant="tonal" onClick={() => setOpen(false)}>
            Close
          </TKButton>
        ) : null}
      </TKSheet>
    </>
  );
}

function CellPlayground() {
  const [chevron, setChevron] = useState(true);
  const [toggle, setToggle] = useState(false);
  const [danger, setDanger] = useState(false);
  const code = `<TKCell\n  icon="bell"\n  title="Notifications"${chevron ? "\n  chevron" : ""}${toggle ? "\n  defaultToggle" : ""}${danger ? "\n  danger" : ""}\n/>`;
  return (
    <>
      <TKListGroup>
        <TKCell icon="bell" title="Notifications" chevron={chevron} defaultToggle={toggle ? true : undefined} danger={danger} onClick={chevron ? () => {} : undefined} />
      </TKListGroup>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <TKSwitch label="chevron" checked={chevron} onChange={setChevron} />
        <TKSwitch label="toggle" checked={toggle} onChange={setToggle} />
        <TKSwitch label="danger" checked={danger} onChange={setDanger} />
      </div>
      <Snippet code={code} />
    </>
  );
}

function CalendarPlayground() {
  const [range, setRange] = useState(true);
  const [monday, setMonday] = useState(true);
  const code = `<TKCalendar${range ? ' mode="range"' : ""} weekStartsOn={${monday ? 1 : 0}} />`;
  return (
    <>
      <TKCalendar mode={range ? "range" : "single"} weekStartsOn={monday ? 1 : 0} defaultMonth={new Date(2026, 5, 1)} />
      <div style={{ display: "flex", gap: 16 }}>
        <TKSwitch label="range" checked={range} onChange={setRange} />
        <TKSwitch label="week starts Mon" checked={monday} onChange={setMonday} />
      </div>
      <Snippet code={code} />
    </>
  );
}

function NavDemoHome() {
  const nav = useNav();
  return (
    <div style={{ padding: 10 }}>
      <TKListGroup>
        <TKCell icon="user" title="Open profile" chevron onClick={() => nav.push("profile")} />
      </TKListGroup>
    </div>
  );
}

function NavDemoProfile() {
  const nav = useNav();
  return (
    <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
      <TKCell icon="user" title="Profile" subtitle="swipe from the left edge to go back" />
      <TKButton size="sm" variant="tonal" onClick={() => nav.pop()}>
        Pop
      </TKButton>
    </div>
  );
}

function NavStackPlayground() {
  const [swipe, setSwipe] = useState<"edge" | "anywhere">("edge");
  const code = `<TKNavStack initial="home" swipeBack="${swipe}">\n  <TKNavPanel id="home"><Home /></TKNavPanel>\n  <TKNavPanel id="profile"><Profile /></TKNavPanel>\n</TKNavStack>`;
  return (
    <>
      <TKFrame height={190}>
        <TKNavStack initial="home" swipeBack={swipe} backButton={false}>
          <TKNavPanel id="home">
            <NavDemoHome />
          </TKNavPanel>
          <TKNavPanel id="profile">
            <NavDemoProfile />
          </TKNavPanel>
        </TKNavStack>
      </TKFrame>
      <Knob label="swipeBack">
        <TKSegmented full options={["edge", "anywhere"]} value={swipe} onChange={(v) => setSwipe(v as "edge" | "anywhere")} />
      </Knob>
      <Snippet code={code} />
    </>
  );
}

export function Playground() {
  const [target, setTarget] = useState<PlaygroundTarget>("Button");
  const body = useMemo(() => {
    switch (target) {
      case "Button":
        return <ButtonPlayground />;
      case "Input":
        return <InputPlayground />;
      case "Sheet":
        return <SheetPlayground />;
      case "Cell":
        return <CellPlayground />;
      case "Calendar":
        return <CalendarPlayground />;
      case "NavStack":
        return <NavStackPlayground />;
    }
  }, [target]);
  return (
    <div data-demo-playground style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <TKSegmented full options={TARGETS} value={target} onChange={(v) => setTarget(v as PlaygroundTarget)} />
      {body}
    </div>
  );
}

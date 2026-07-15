import {
  Profiler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ProfilerOnRenderCallback,
  type ReactNode,
  type RefObject,
} from "react";
import { createMockTelegram } from "@tg-mini-app/telegram/testing";
import {
  TKButton,
  TKMainButton,
  TKProvider,
  TKSegmented,
  TKSheet,
  TKSwitch,
  TKTelegramProvider,
  useReducedMotion,
  useTKBusyAnnounce,
  type TKBusyState,
  type TKTheme,
} from "tg-mini-app-uikit";
import { SectionTitle } from "../shared/layout";
import { useReveal } from "../shared/useReveal";

const FEATURE_STAGGER_MS = 60;
const busyCopy = {
  loading: "Checking the accessible flow…",
  done: "Accessibility check complete.",
} as const;

interface GestureCounter {
  onRender: ProfilerOnRenderCallback;
  onPointerDown: (event: PointerEvent) => void;
  onPointerMove: (event: PointerEvent) => void;
  onPointerEnd: (event: PointerEvent) => void;
}

export function Features({ theme }: { theme: TKTheme }) {
  const commitValueRef = useRef<HTMLSpanElement>(null);
  const commitStatusRef = useRef<HTMLParagraphElement>(null);
  const gestureCounter = useGestureCommitCounter(commitValueRef, commitStatusRef);

  return (
    <>
      <div className="features-heading">
        <SectionTitle id="features-title">Features, proven live</SectionTitle>
        <p>Try the same interaction, theme, performance, and accessibility contracts your Mini App ships.</p>
      </div>

      <div className="features-grid">
        <FeatureCard
          index={0}
          title="Native-feel gestures"
          description="Open the sheet, then drag its handle. The UIKit owns the gesture physics, focus trap, and dismissal."
        >
          <Profiler id="feature-sheet" onRender={gestureCounter.onRender}>
            <GestureDemo theme={theme} counter={gestureCounter} />
          </Profiler>
        </FeatureCard>

        <FeatureCard
          index={1}
          title="Telegram out of the box"
          description="Switch token sources. Telegram uses a real injected WebApp mock and the same provider path as production."
        >
          <ThemeDemo />
        </FeatureCard>

        <FeatureCard
          index={2}
          title="Compositor-only motion"
          description="The moving layer stays on transform and opacity while React watches the sheet demo next door."
        >
          <MotionDemo commitValueRef={commitValueRef} commitStatusRef={commitStatusRef} />
        </FeatureCard>

        <FeatureCard
          index={3}
          title="Accessible by default"
          description="Tab through real UIKit controls, then run an async action to see exactly what assistive tech hears."
        >
          <AccessibilityDemo />
        </FeatureCard>
      </div>
    </>
  );
}

function FeatureCard({
  index,
  title,
  description,
  children,
}: {
  index: number;
  title: string;
  description: string;
  children: ReactNode;
}) {
  const revealRef = useReveal<HTMLElement>();

  return (
    <article
      ref={revealRef}
      className="feature-card reveal"
      style={{ transitionDelay: `${index * FEATURE_STAGGER_MS}ms` }}
    >
      <div className="feature-card-copy">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <div className="feature-demo">{children}</div>
    </article>
  );
}

function GestureDemo({ theme, counter }: { theme: TKTheme; counter: GestureCounter }) {
  const [open, setOpen] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    host.addEventListener("pointerdown", counter.onPointerDown, true);
    host.addEventListener("pointermove", counter.onPointerMove, true);
    host.addEventListener("pointerup", counter.onPointerEnd, true);
    host.addEventListener("pointercancel", counter.onPointerEnd, true);
    return () => {
      host.removeEventListener("pointerdown", counter.onPointerDown, true);
      host.removeEventListener("pointermove", counter.onPointerMove, true);
      host.removeEventListener("pointerup", counter.onPointerEnd, true);
      host.removeEventListener("pointercancel", counter.onPointerEnd, true);
    };
  }, [counter.onPointerDown, counter.onPointerEnd, counter.onPointerMove]);

  return (
    <div ref={hostRef} className="feature-gesture-demo" data-sheet-open={open ? "true" : "false"}>
      <div className="feature-phone-shell">
        <TKProvider theme={theme} className="feature-phone-screen">
          <div className="feature-phone-content" data-tk-portal-root>
            <div className="feature-phone-toolbar">
              <span>Trip planner</span>
              <span aria-hidden="true">•••</span>
            </div>
            <div className="feature-phone-body">
              <strong>Weekend in Lisbon</strong>
              <p>Everything stays inside this mini viewport.</p>
              <TKButton full onClick={() => setOpen(true)}>
                Open draggable sheet
              </TKButton>
            </div>

            <TKSheet
              open={open}
              onClose={() => setOpen(false)}
              title="Your itinerary"
              testId="feature-sheet"
            >
              <div className="feature-sheet-body">
                <p>Drag this header down to dismiss, or press Escape.</p>
                <TKButton full variant="tonal" onClick={() => setOpen(false)}>
                  Done
                </TKButton>
              </div>
            </TKSheet>
          </div>
        </TKProvider>
      </div>
      <p className="feature-hint">Pointer or touch to drag · Enter to open · Escape to close</p>
    </div>
  );
}

type ThemeMode = "light" | "dark" | "telegram";

function ThemeDemo() {
  const [mode, setMode] = useState<ThemeMode>("light");
  const telegram = useMemo(() => createMockTelegram({ colorScheme: "dark" }), []);
  const previewTheme = mode === "light" ? "light" : "dark";
  const source = mode === "telegram" ? "Telegram themeParams" : `${mode} UIKit tokens`;

  return (
    <div className="feature-theme-demo" data-theme-mode={mode}>
      <TKSegmented
        ariaLabel="Mini app theme"
        full
        options={[
          { value: "light", label: "Light" },
          { value: "dark", label: "Dark" },
          { value: "telegram", label: "Telegram" },
        ]}
        value={mode}
        onChange={(value) => setMode(value as ThemeMode)}
        testId="feature-theme-switch"
      />

      <TKTelegramProvider webApp={telegram.webApp} signalReady={false}>
        <TKProvider
          theme={previewTheme}
          telegram={mode === "telegram"}
          accent={mode === "telegram" ? undefined : "var(--tk-green)"}
          className="feature-theme-preview"
          testId="feature-theme-preview"
        >
          <div className="feature-theme-meta">
            <span>Expense approval</span>
            <span>{source}</span>
          </div>
          <div className="feature-theme-amount">
            <span>Team offsite</span>
            <strong>$640</strong>
          </div>
          <TKMainButton
            label="Approve expense"
            successLabel="Approved"
            onClick={() => new Promise<void>((resolve) => window.setTimeout(resolve, 650))}
            style={{ background: "var(--tk-accent)" }}
            testId="feature-main-button"
          />
        </TKProvider>
      </TKTelegramProvider>
      <p className="feature-hint">Use arrow keys inside the segmented control</p>
    </div>
  );
}

function MotionDemo({
  commitValueRef,
  commitStatusRef,
}: {
  commitValueRef: RefObject<HTMLSpanElement | null>;
  commitStatusRef: RefObject<HTMLParagraphElement | null>;
}) {
  const playback = useViewportPlayback<HTMLDivElement>();
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const motionState =
    playback.state === "running" && manuallyPaused ? "paused" : playback.state;

  return (
    <div className="feature-motion-demo" ref={playback.ref} data-motion-state={motionState}>
      <div className="feature-motion-track" aria-hidden="true">
        <span className="feature-motion-pulse" />
      </div>
      <TKButton
        variant="outline"
        aria-pressed={manuallyPaused}
        onClick={() => setManuallyPaused((paused) => !paused)}
      >
        {manuallyPaused ? "Play motion" : "Pause motion"}
      </TKButton>
      <div className="feature-commit-readout">
        <span
          ref={commitValueRef}
          className="feature-commit-value"
          data-commit-count="0"
          data-drag-state="idle"
          data-testid="feature-commit-count"
        >
          0
        </span>
        <div>
          <strong>React commits while pixels move</strong>
          <p ref={commitStatusRef} role="status" aria-live="polite">
            Open and drag the sheet to measure.
          </p>
        </div>
      </div>
      <p className="feature-ci-line">Transform + opacity only · enforced by CI</p>
    </div>
  );
}

function AccessibilityDemo() {
  const [busy, setBusy] = useState<TKBusyState>("idle");
  const [focusRings, setFocusRings] = useState(true);
  const timerRef = useRef<number | undefined>(undefined);
  const liveRegion = useTKBusyAnnounce(busy, {
    loadingText: busyCopy.loading,
    doneText: busyCopy.done,
  });
  const visibleAnnouncement =
    busy === "loading"
      ? busyCopy.loading
      : busy === "done"
        ? busyCopy.done
        : "The next status will appear here.";

  useEffect(
    () => () => {
      window.clearTimeout(timerRef.current);
    },
    [],
  );

  const runAnnouncement = () => {
    window.clearTimeout(timerRef.current);
    setBusy("loading");
    timerRef.current = window.setTimeout(() => setBusy("done"), 900);
  };

  return (
    <div className="feature-a11y-demo">
      <div className="feature-focus-controls">
        <TKButton variant="outline" onClick={runAnnouncement}>
          Run async announcement
        </TKButton>
        <TKSwitch checked={focusRings} onChange={setFocusRings} label="Focus rings use --tk-ring" />
      </div>
      <div className="feature-live-copy" data-testid="feature-visible-announcement">
        <span aria-hidden="true">AT hears</span>
        <strong>{visibleAnnouncement}</strong>
      </div>
      <div data-testid="feature-live-region">{liveRegion}</div>
      <p className="feature-hint">Press Tab to see the same focus treatment on every control</p>
    </div>
  );
}

function useViewportPlayback<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const reducedMotion = useReducedMotion();
  const [inViewport, setInViewport] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(
    () => typeof document === "undefined" || !document.hidden,
  );

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setInViewport(entry?.isIntersecting ?? false),
      { threshold: 0.45 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onVisibilityChange = () => setDocumentVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  return {
    ref,
    state: reducedMotion ? "reduced" : inViewport && documentVisible ? "running" : "paused",
  } as const;
}

function useGestureCommitCounter(
  valueRef: RefObject<HTMLSpanElement | null>,
  statusRef: RefObject<HTMLParagraphElement | null>,
): GestureCounter {
  const activeRef = useRef(false);
  const armingRef = useRef(false);
  const pointerRef = useRef<number | null>(null);
  const startYRef = useRef(0);
  const commitsRef = useRef(0);
  const startFrameRef = useRef<number | undefined>(undefined);

  const paint = useCallback(
    (dragState: "idle" | "armed" | "dragging" | "complete") => {
      const value =
        valueRef.current ?? document.querySelector<HTMLSpanElement>("[data-testid='feature-commit-count']");
      if (value) {
        const commits = String(commitsRef.current);
        value.textContent = commits;
        value.dataset.commitCount = commits;
        value.dataset.dragState = dragState;
      }

      const status =
        statusRef.current ?? document.querySelector<HTMLParagraphElement>(".feature-commit-readout [role='status']");
      if (!status) return;
      if (dragState === "armed") status.textContent = "Move the sheet to start measuring.";
      if (dragState === "dragging") status.textContent = "Measuring move-frame commits…";
      if (dragState === "complete") {
        status.textContent =
          commitsRef.current === 0
            ? "Last drag: zero move-frame commits."
            : `Last drag: ${commitsRef.current} move-frame commits.`;
      }
    },
    [statusRef, valueRef],
  );

  const onPointerDown = useCallback(
    (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.closest(".feature-gesture-demo [data-tk-sheet-grab]")) return;
      pointerRef.current = event.pointerId;
      startYRef.current = event.clientY;
      activeRef.current = false;
      armingRef.current = false;
      window.cancelAnimationFrame(startFrameRef.current ?? 0);
      commitsRef.current = 0;
      paint("armed");
    },
    [paint],
  );

  const onPointerMove = useCallback(
    (event: PointerEvent) => {
      if (pointerRef.current !== event.pointerId || activeRef.current || armingRef.current) return;
      if (Math.abs(event.clientY - startYRef.current) < 8) return;
      armingRef.current = true;
      startFrameRef.current = window.requestAnimationFrame(() => {
        armingRef.current = false;
        if (pointerRef.current !== event.pointerId) return;
        activeRef.current = true;
        commitsRef.current = 0;
        paint("dragging");
      });
    },
    [paint],
  );

  const onPointerEnd = useCallback(
    (event: PointerEvent) => {
      if (pointerRef.current !== event.pointerId) return;
      activeRef.current = false;
      armingRef.current = false;
      window.cancelAnimationFrame(startFrameRef.current ?? 0);
      pointerRef.current = null;
      paint("complete");
    },
    [paint],
  );

  const onRender = useCallback<ProfilerOnRenderCallback>(() => {
    if (!activeRef.current) return;
    commitsRef.current += 1;
    paint("dragging");
  }, [paint]);

  useEffect(
    () => () => window.cancelAnimationFrame(startFrameRef.current ?? 0),
    [],
  );

  return { onRender, onPointerDown, onPointerMove, onPointerEnd };
}

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
import { formatSiteString, useSiteLocale } from "../shared/i18n";
import { useReveal } from "../shared/useReveal";

const FEATURE_STAGGER_MS = 60;

interface GestureCounter {
  onRender: ProfilerOnRenderCallback;
  onPointerDown: (event: PointerEvent) => void;
  onPointerMove: (event: PointerEvent) => void;
  onPointerEnd: (event: PointerEvent) => void;
}

export function Features({ theme }: { theme: TKTheme }) {
  const { strings } = useSiteLocale();
  const copy = strings.demo.features;
  const commitValueRef = useRef<HTMLSpanElement>(null);
  const commitStatusRef = useRef<HTMLParagraphElement>(null);
  const gestureCounter = useGestureCommitCounter(commitValueRef, commitStatusRef);

  return (
    <>
      <div className="features-heading">
        <SectionTitle id="features-title">{copy.title}</SectionTitle>
        <p>{copy.intro}</p>
      </div>

      <div className="features-grid">
        <FeatureCard
          index={0}
          title={copy.gesturesTitle}
          description={copy.gesturesCopy}
        >
          <Profiler id="feature-sheet" onRender={gestureCounter.onRender}>
            <GestureDemo theme={theme} counter={gestureCounter} />
          </Profiler>
        </FeatureCard>

        <FeatureCard
          index={1}
          title={copy.telegramTitle}
          description={copy.telegramCopy}
        >
          <ThemeDemo />
        </FeatureCard>

        <FeatureCard
          index={2}
          title={copy.motionTitle}
          description={copy.motionCopy}
        >
          <MotionDemo commitValueRef={commitValueRef} commitStatusRef={commitStatusRef} />
        </FeatureCard>

        <FeatureCard
          index={3}
          title={copy.accessibilityTitle}
          description={copy.accessibilityCopy}
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
  const { strings } = useSiteLocale();
  const copy = strings.demo.features;
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
              <span>{copy.tripPlanner}</span>
              <span aria-hidden="true">•••</span>
            </div>
            <div className="feature-phone-body">
              <strong>{copy.lisbonWeekend}</strong>
              <p>{copy.viewportCopy}</p>
              <TKButton full onClick={() => setOpen(true)}>
                {copy.openSheet}
              </TKButton>
            </div>

            <TKSheet
              open={open}
              onClose={() => setOpen(false)}
              title={copy.itinerary}
              testId="feature-sheet"
            >
              <div className="feature-sheet-body">
                <p>{copy.dismissSheet}</p>
                <TKButton full variant="tonal" onClick={() => setOpen(false)}>
                  {copy.done}
                </TKButton>
              </div>
            </TKSheet>
          </div>
        </TKProvider>
      </div>
      <p className="feature-hint">{copy.gestureHint}</p>
    </div>
  );
}

type ThemeMode = "light" | "dark" | "telegram";

function ThemeDemo() {
  const { strings } = useSiteLocale();
  const copy = strings.demo.features;
  const [mode, setMode] = useState<ThemeMode>("light");
  const telegram = useMemo(() => createMockTelegram({ colorScheme: "dark" }), []);
  const previewTheme = mode === "light" ? "light" : "dark";
  const source =
    mode === "telegram"
      ? copy.telegramTokens
      : mode === "light"
        ? copy.lightTokens
        : copy.darkTokens;

  return (
    <div className="feature-theme-demo" data-theme-mode={mode}>
      <TKSegmented
        ariaLabel={copy.themeAria}
        full
        options={[
          { value: "light", label: copy.light },
          { value: "dark", label: copy.dark },
          { value: "telegram", label: copy.telegram },
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
            <span>{copy.expenseApproval}</span>
            <span>{source}</span>
          </div>
          <div className="feature-theme-amount">
            <span>{copy.teamOffsite}</span>
            <strong>$640</strong>
          </div>
          <TKMainButton
            label={copy.approveExpense}
            successLabel={copy.approved}
            onClick={() => new Promise<void>((resolve) => window.setTimeout(resolve, 650))}
            style={{ background: "var(--tk-accent)" }}
            testId="feature-main-button"
          />
        </TKProvider>
      </TKTelegramProvider>
      <p className="feature-hint">{copy.themeHint}</p>
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
  const { strings } = useSiteLocale();
  const copy = strings.demo.features;
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
        {manuallyPaused ? copy.playMotion : copy.pauseMotion}
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
          <strong>{copy.commitsTitle}</strong>
          <p ref={commitStatusRef} role="status" aria-live="polite">
            {copy.commitsInitial}
          </p>
        </div>
      </div>
      <p className="feature-ci-line">{copy.ciLine}</p>
    </div>
  );
}

function AccessibilityDemo() {
  const { strings } = useSiteLocale();
  const copy = strings.demo.features;
  const [busy, setBusy] = useState<TKBusyState>("idle");
  const [focusRings, setFocusRings] = useState(true);
  const timerRef = useRef<number | undefined>(undefined);
  const liveRegion = useTKBusyAnnounce(busy, {
    loadingText: copy.checking,
    doneText: copy.checkComplete,
  });
  const visibleAnnouncement =
    busy === "loading"
      ? copy.checking
      : busy === "done"
        ? copy.checkComplete
        : copy.nextStatus;

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
          {copy.runAnnouncement}
        </TKButton>
        <TKSwitch checked={focusRings} onChange={setFocusRings} label={copy.focusRings} />
      </div>
      <div className="feature-live-copy" data-testid="feature-visible-announcement">
        <span aria-hidden="true">{copy.assistiveTechHears}</span>
        <strong>{visibleAnnouncement}</strong>
      </div>
      <div data-testid="feature-live-region">{liveRegion}</div>
      <p className="feature-hint">{copy.focusHint}</p>
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
  const { strings } = useSiteLocale();
  const copy = strings.demo.features;
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
      if (dragState === "armed") status.textContent = copy.commitsArmed;
      if (dragState === "dragging") status.textContent = copy.commitsMeasuring;
      if (dragState === "complete") {
        status.textContent =
          commitsRef.current === 0
            ? copy.commitsZero
            : formatSiteString(copy.commitsResult, { count: commitsRef.current });
      }
    },
    [copy, statusRef, valueRef],
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

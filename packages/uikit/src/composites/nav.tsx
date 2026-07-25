import {
  Children,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import { tkShouldCommit, useDragGesture } from "../internal/useDragGesture";
import { useLatest } from "../internal/useLatest";
import { useBackIntercept, useWebApp } from "../foundation/telegram";
import { useHasNativeChrome } from "../foundation/chrome";
import { useReducedMotion } from "../foundation/theme";

export interface TKNavApi<TParams = unknown> {
  push: (panel: string, params?: TParams) => void;
  pop: () => void;
  replace: (panel: string, params?: TParams) => void;
  /** Unwinds the stack down to the given panel. */
  popTo: (panel: string) => void;
  /** Replace the whole stack (deep-link / history restore — NAV2-007). */
  reset: (entries: TKNavStackEntry[]) => void;
  depth: number;
  activePanel: string;
  /** Params of the current stack entry — type it via `useNav<MyParams>()` (NAV2-006). */
  params: TParams;
  /**
   * True while the stack drives the NATIVE Telegram Back button for its depth
   * (`backButton` on, depth > 1, a `BackButton` API present). `TKHeader
   * back="auto"` reads it to hide its own arrow — otherwise Telegram shows
   * TWO back controls (the chrome one and the header one) for the same pop.
   */
  nativeBack: boolean;
}

/** A stack entry for controlled-mode / `reset()` (NAV2-007). */
export interface TKNavStackEntry {
  panel: string;
  params?: unknown;
}

interface NavEntry {
  panel: string;
  params?: unknown;
  key: number;
}

const TKNavContext = /* @__PURE__ */ createContext<TKNavApi | null>(null);

/** Stack navigation API of the nearest `TKNavStack`. Type the active panel's
 *  params with the generic: `useNav<{ id: string }>().params.id` (NAV2-006). */
export function useNav<TParams = unknown>(): TKNavApi<TParams> {
  const api = useContext(TKNavContext);
  if (!api) throw new Error("useNav must be used inside <TKNavStack>");
  return api as TKNavApi<TParams>;
}

/** Like `useNav`, but returns null outside a `<TKNavStack>` instead of throwing — for components (e.g. `TKHeader back="auto"`) that adapt to a nav stack when present. */
export function useOptionalNav<TParams = unknown>(): TKNavApi<TParams> | null {
  return useContext(TKNavContext) as TKNavApi<TParams> | null;
}

export interface TKNavPanelProps {
  id: string;
  /**
   * Human-readable screen name for the panel's `role="region"` landmark. Screen
   * readers announce it when the panel becomes active (NAV2-001/002). Falls back
   * to `id`, but `id` is usually a machine slug — set this for real users.
   */
  label?: string;
  children?: ReactNode;
}

/** Declares a screen of a `TKNavStack`. */
export function TKNavPanel({ children }: TKNavPanelProps) {
  return <>{children}</>;
}

/**
 * Publishes the nav api scoped to ONE panel (its own id/params/depth). A
 * component (not an inline `{ ...api }` in the map) so the derived value can
 * be memoized: the stack re-renders with a stable api on every drag start/end
 * and settle-guard update, and a fresh object each time would re-render every
 * `useNav` consumer in the still-mounted under panels. The SAME type serves
 * the top, under and exit renders — a panel changing role must never remount
 * its live subtree (typed input, scroll, in-flight requests).
 */
function NavScope({
  api,
  top = false,
  panel,
  params,
  depth,
  children,
}: {
  api: TKNavApi;
  /** The top panel publishes the stack's own (already memoized) api as-is. */
  top?: boolean;
  panel: string;
  params: unknown;
  depth: number;
  children: ReactNode;
}) {
  const scoped = useMemo<TKNavApi>(
    () => ({ ...api, activePanel: panel, params, depth }),
    [api, panel, params, depth],
  );
  return <TKNavContext.Provider value={top ? api : scoped}>{children}</TKNavContext.Provider>;
}

export interface TKNavStackProps {
  /** Panel id shown first (uncontrolled). */
  initial: string;
  /**
   * Controlled stack (deep-link / history sync — NAV2-007). When set, the panels
   * render from it and every `useNav()` call becomes a REQUEST: it fires
   * `onChange` with the next stack but does not move until you feed that stack
   * back. Treat it append/truncate-style (entries are matched to their mount
   * keys positionally by panel id); reordering can mis-key panels. An empty
   * array falls back to `initial`.
   */
  stack?: TKNavStackEntry[];
  /** Fired with the new stack on any navigation (controlled change callback). */
  onChange?: (stack: TKNavStackEntry[]) => void;
  children?: ReactNode;
  onStackChange?: (panels: string[]) => void;
  /**
   * Swipe-back gesture: `"edge"` (default) starts from the left 28px,
   * `"anywhere"` from any point, `false` disables it.
   */
  swipeBack?: "edge" | "anywhere" | false;
  /** Show the native Telegram Back button while depth > 1 (default true). */
  backButton?: boolean;
  testId?: string;
  className?: string;
  /** Merged onto the root LAST — consumer values win (REU-007). */
  style?: CSSProperties;
}

const EDGE_ZONE = 28;

// Resolved animation duration in ms, with the kit's default nav timing as the
// fallback (jsdom / detached nodes report an empty string).
function tkAnimationMs(node: Element | null): number {
  const css = node ? getComputedStyle(node).animationDuration : "";
  return css.endsWith("ms") ? parseFloat(css) : css.endsWith("s") ? parseFloat(css) * 1000 : 260;
}

/**
 * Screen stack with preserved panel state, directional transitions and an
 * interactive swipe-back gesture. Integrates with the Telegram Back button
 * through the provider's back-handler queue (overlays intercept first).
 */
export function TKNavStack({
  initial,
  stack: stackProp,
  onChange,
  children,
  onStackChange,
  swipeBack = "edge",
  backButton = true,
  testId,
  className,
  style,
}: TKNavStackProps) {
  const keyRef = useRef(1);
  // Dedup a rapid double-push of the same panel+params (laggy WebView double-tap):
  // a second identical push within the transition window is ignored so the stack
  // doesn't gain a duplicate entry and desync depth (NAV2-009).
  const navLockRef = useRef<string | null>(null);
  const lockTimerRef = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(lockTimerRef.current), []);
  const [internalStack, setInternalStack] = useState<NavEntry[]>([{ panel: initial, key: 0 }]);
  // Controlled when `stack` is provided: render from props, route mutations
  // through `onChange` so deep-link / history restore works (NAV2-007).
  const isControlled = stackProp !== undefined;
  const isControlledRef = useLatest(isControlled);
  // Controlled entries get stable keys via an append/truncate diff against
  // the previously keyed stack — never the array index: an index key returns
  // on the next push to the same depth, which poisons the settled-guard (a
  // "warmed" depth loses its entrance animation forever) and could collide
  // with the exit layer's preserved key. The mapping (and its key counter)
  // lives in STATE adjusted during render — the prevStack pattern below — so
  // a discarded concurrent render discards its mapping too; a render-body ref
  // mutation would leak keys from the discarded pass and remount a live panel
  // on the next one. Controlled keys count down from -1: they can never
  // collide with the handler-issued keyRef keys (positive) or the initial
  // internal entry (0) across a controlled/uncontrolled flip.
  const [controlledKeyed, setControlledKeyed] = useState<{ entries: NavEntry[]; nextKey: number }>({
    entries: [],
    nextKey: -1,
  });
  let stack: NavEntry[];
  if (isControlled) {
    // Fall back to `initial` if a controlled host transiently feeds an empty
    // stack (e.g. mid-hydration) so the api's `top` never reads undefined.
    const entries: TKNavStackEntry[] = stackProp!.length > 0 ? stackProp! : [{ panel: initial }];
    const prev = controlledKeyed.entries;
    let nextKey = controlledKeyed.nextKey;
    let changed = entries.length !== prev.length;
    const next = entries.map((entry, index) => {
      const kept = prev[index];
      if (kept && kept.panel === entry.panel) {
        if (kept.params === entry.params) return kept;
        changed = true;
        return { panel: entry.panel, params: entry.params, key: kept.key };
      }
      changed = true;
      return { panel: entry.panel, params: entry.params, key: nextKey-- };
    });
    // Same content → keep the previous array identity so the render-adjust
    // below reads "no navigation happened".
    if (changed) setControlledKeyed({ entries: next, nextKey });
    stack = changed ? next : prev;
  } else {
    stack = internalStack;
  }
  const [dragging, setDragging] = useState(false);
  // Swipe-back moves panels through imperative transform writes — the width and
  // the panel nodes are cached once at drag start, so a frame does no layout
  // reads, no setState and no context re-publish.
  const dragCache = useRef<{ width: number; top: HTMLDivElement | null; under: HTMLDivElement | null } | null>(null);
  // Once a panel's push entrance has played, never re-apply the animation on
  // later renders: `fill-mode: both` otherwise keeps a resolved transform on
  // the panel forever — a permanent containing block for position:fixed
  // children and a leaked compositor layer per panel (sheet.tsx settled-guard).
  const [settledKeys, setSettledKeys] = useState<ReadonlySet<number>>(() => new Set());
  const rootRef = useRef<HTMLDivElement>(null);
  const changeRef = useLatest(onStackChange);
  const onChangeRef = useLatest(onChange);

  const commit = useCallback((next: NavEntry[]) => {
    if (!isControlledRef.current) setInternalStack(next);
    onChangeRef.current?.(next.map((entry) => ({ panel: entry.panel, params: entry.params })));
    changeRef.current?.(next.map((entry) => entry.panel));
  }, []);

  const stackRef = useLatest(stack);
  // Last navigation direction, read during render to pick the slide animation.
  // A push enters from the right (tk-nav-in); a pop must NOT replay that — the
  // revealed panel instead transitions from its -30% "under" offset back to 0,
  // so going back slides in from the left like the platform expects.
  const dirRef = useRef<"push" | "pop">("push");

  // Whether a REAL Telegram client hosts the app (useHasNativeChrome) and its
  // Back button API is reachable. Injected mocks (storybook, demos, tests
  // without window.Telegram) count as "no native chrome": their in-DOM header
  // arrow is the only visible back control, so it must stay.
  const hasNativeChrome = useHasNativeChrome();
  const webApp = useWebApp();
  const hasNativeBack = hasNativeChrome && !!webApp?.BackButton;

  const api = useMemo<TKNavApi>(() => {
    const top = stack[stack.length - 1];
    return {
      push: (panel, params) => {
        // Dedup a rapid double-push of the SAME panel+params (NAV2-009). Serialize
        // params for the compare; if they can't be serialized (cyclic / BigInt /
        // function-only) skip the dedup rather than risk swallowing a legitimate
        // push. Key order isn't normalized, so reordered-keys params is a harmless
        // dedup miss, never a false positive.
        let lockKey: string | null = `${panel}::`;
        if (params != null) {
          try {
            lockKey = `${panel}::${JSON.stringify(params)}`;
          } catch {
            lockKey = null;
          }
        }
        if (lockKey !== null) {
          if (navLockRef.current === lockKey) return;
          navLockRef.current = lockKey;
          window.clearTimeout(lockTimerRef.current);
          lockTimerRef.current = window.setTimeout(() => {
            navLockRef.current = null;
          }, 300);
        } else {
          navLockRef.current = null;
        }
        dirRef.current = "push";
        commit([...stackRef.current, { panel, params, key: keyRef.current++ }]);
      },
      pop: () => {
        navLockRef.current = null;
        if (stackRef.current.length > 1) {
          dirRef.current = "pop";
          commit(stackRef.current.slice(0, -1));
        }
      },
      replace: (panel, params) => {
        navLockRef.current = null;
        dirRef.current = "push";
        commit([...stackRef.current.slice(0, -1), { panel, params, key: keyRef.current++ }]);
      },
      popTo: (panel) => {
        navLockRef.current = null;
        const index = stackRef.current.findIndex((entry) => entry.panel === panel);
        if (index >= 0) {
          dirRef.current = "pop";
          commit(stackRef.current.slice(0, index + 1));
        }
      },
      reset: (entries) => {
        navLockRef.current = null;
        dirRef.current = "push";
        commit(entries.map((entry) => ({ panel: entry.panel, params: entry.params, key: keyRef.current++ })));
      },
      depth: stack.length,
      activePanel: top.panel,
      params: top.params,
      nativeBack: backButton && hasNativeBack && stack.length > 1,
    };
  }, [commit, stack, backButton, hasNativeBack]);

  // Telegram Back button: intercept while the stack is deep; the provider's
  // back queue lets open overlays (sheets, dialogs) intercept first, and shows
  // the native button when `backButton` is on (the provider owns visibility).
  useBackIntercept(stack.length > 1, api.pop, backButton);

  const panels = useMemo(() => {
    const map = new Map<string, ReactElement<TKNavPanelProps>>();
    Children.forEach(children, (child) => {
      if (isValidElement<TKNavPanelProps>(child) && child.props.id) map.set(child.props.id, child);
    });
    return map;
  }, [children]);

  // Dev guard: a stack entry pointing at an unregistered panel id renders a blank
  // screen — warn (with the available ids) instead of failing silently (NAV2-008).
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    for (const entry of stack) {
      if (!panels.has(entry.panel)) {
        // eslint-disable-next-line no-console
        console.warn(
          `TKNavStack: no panel registered for id "${entry.panel}". Available: [${[...panels.keys()].join(", ")}].`,
        );
      }
    }
  }, [stack, panels]);

  // Exit animation: when the top entry leaves the stack (pop / popTo /
  // committed swipe-back) it would otherwise vanish from the DOM in the same
  // commit — an old-screen flash on every "back". The departed entry keeps
  // rendering on top of the stack and slides out to the right.
  const [exiting, setExiting] = useState<{ entry: NavEntry; fromX: number } | null>(null);
  const exitRef = useRef<HTMLDivElement>(null);
  // The committed swipe-back's finger offset, handed to the NEXT departure so
  // the exit picks the slide up from under the finger. State (not a ref): it
  // must be consumed/dropped through the render-adjust below, or a
  // host-rejected pop would leak the offset into a later unrelated exit.
  const [pendingFromX, setPendingFromX] = useState(0);
  const reducedMotion = useReducedMotion();
  // Detect the departure against the previous stack IN RENDER (an effect would
  // still flash the old screen for one commit), via the canonical
  // adjust-state-during-render pattern — state, not a render-body ref
  // mutation, so a discarded concurrent render cannot eat the exit animation.
  // Comparing stacks (not hooking pop()) also covers controlled mode, where a
  // pop() is only a request until the host feeds the shorter stack back.
  const [prevStack, setPrevStack] = useState(stack);
  if (prevStack !== stack) {
    setPrevStack(stack);
    const prevTop = prevStack[prevStack.length - 1];
    if (prevTop && stack.length < prevStack.length && !stack.some((entry) => entry.key === prevTop.key)) {
      if (!reducedMotion) setExiting({ entry: prevTop, fromX: pendingFromX });
    }
    if (pendingFromX !== 0) setPendingFromX(0);
    // Keys are monotonic, so a departed key never comes back: drop it from the
    // settled set to keep the set from growing for the app's whole lifetime.
    setSettledKeys((prev) => {
      if (prev.size === 0) return prev;
      const alive = new Set([...prev].filter((key) => stack.some((entry) => entry.key === key)));
      return alive.size === prev.size ? prev : alive;
    });
  } else if (pendingFromX !== 0) {
    // The stack did not shrink after the swipe committed (host rejected the
    // pop) — drop the finger offset so a later button pop exits from 0.
    setPendingFromX(0);
  }
  useEffect(() => {
    if (!exiting) return;
    const node = exitRef.current;
    // Native listener, not React's onAnimationEnd — React resolves animation
    // events to a vendor-prefixed name in environments without AnimationEvent
    // (the shared.tsx overlay-exit pattern).
    const onEnd = (e: Event) => {
      if ((e as AnimationEvent).animationName === "tk-nav-out" && e.target === node) setExiting(null);
    };
    node?.addEventListener("animationend", onEnd);
    // Removal fallback: a backgrounded WKWebView swallows animation events, so
    // a timer at duration+80ms guarantees the panel leaves the DOM.
    const timer = window.setTimeout(() => setExiting(null), tkAnimationMs(node) + 80);
    return () => {
      node?.removeEventListener("animationend", onEnd);
      window.clearTimeout(timer);
    };
  }, [exiting]);

  // Settled-guard listener for the panels' entrance keyframes (same native-
  // listener rationale as above); the panel is identified by data-tk-nav-key.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onEnd = (e: Event) => {
      if ((e as AnimationEvent).animationName !== "tk-nav-in") return;
      const key = e.target instanceof HTMLElement ? e.target.dataset.tkNavKey : undefined;
      if (key === undefined) return;
      const num = Number(key);
      setSettledKeys((prev) => (prev.has(num) ? prev : new Set(prev).add(num)));
    };
    root.addEventListener("animationend", onEnd);
    return () => root.removeEventListener("animationend", onEnd);
  }, []);

  const underPanelRef = useRef<HTMLDivElement>(null);
  const drag = useDragGesture({
    axis: "x",
    enabled: !!swipeBack && stack.length > 1,
    onStart: () => {
      const top = topPanelRef.current;
      const under = underPanelRef.current;
      dragCache.current = { width: rootRef.current?.clientWidth ?? 360, top, under };
      // Reveal the under panel and kill the transitions before the first move —
      // React's `dragging` commit lands a beat later.
      if (top) top.style.transitionDuration = "0s";
      if (under) {
        under.style.transitionDuration = "0s";
        under.style.visibility = "visible";
      }
      setDragging(true);
    },
    onMove: (state) => {
      const c = dragCache.current;
      if (!c) return;
      const x = Math.max(0, state.delta);
      // 1:1 behind the finger, compositor-only; the under panel parallaxes
      // from -30% toward 0 as the top panel uncovers it.
      if (c.top) c.top.style.transform = `translateX(${x}px)`;
      if (c.under) c.under.style.transform = `translateX(${-30 + (x / Math.max(1, c.width)) * 30}%)`;
    },
    onEnd: (state) => {
      const c = dragCache.current;
      dragCache.current = null;
      setDragging(false);
      const width = c?.width ?? rootRef.current?.clientWidth ?? 360;
      // Glide both panels back imperatively in EVERY case — React's rendered
      // transform values never changed during the drag, so it skips the writes.
      // On a committed pop the exit-layer styles React writes in the same
      // commit override this before paint; but a controlled host may REJECT
      // the pop (stack unchanged → no React style writes at all), and the
      // dragged transform must never linger on a live panel.
      if (c?.top) {
        const topEl = c.top;
        topEl.style.transitionDuration = "";
        topEl.style.transform = "translateX(0px)";
        // Clear the transform once the glide settles so the panel doesn't keep
        // a containing block / compositor layer at rest. Timer fallback: a
        // backgrounded WKWebView swallows transition events.
        const clear = () => {
          topEl.removeEventListener("transitionend", clear);
          window.clearTimeout(timer);
          if (dragCache.current) return; // re-grabbed mid-glide — the new drag owns the transform
          topEl.style.transform = "";
        };
        const timer = window.setTimeout(clear, 700);
        topEl.addEventListener("transitionend", clear);
      }
      if (c?.under) {
        c.under.style.transitionDuration = "";
        c.under.style.transform = "translateX(-30%)";
      }
      if (tkShouldCommit(state.delta, state.velocity, width)) {
        // The exit layer picks the slide up from under the finger, not from 0.
        setPendingFromX(state.delta);
        api.pop();
      }
    },
  });

  // Edge-zone gate: only begin the swipe-back drag from the left EDGE_ZONE. We
  // can't veto via preventDefault here (that would block taps/focus across the
  // whole panel), so conditionally forward to the drag's own onPointerDown.
  const dragHandlers = drag.bind();
  const handlers =
    swipeBack === "edge"
      ? {
          ...dragHandlers,
          onPointerDown: (event: Parameters<typeof dragHandlers.onPointerDown>[0]) => {
            const left = rootRef.current?.getBoundingClientRect().left ?? 0;
            if (event.clientX - left > EDGE_ZONE) return;
            dragHandlers.onPointerDown(event);
          },
        }
      : swipeBack === "anywhere"
        ? dragHandlers
        : {};

  // Move focus into the newly-active panel on navigation so keyboard / screen-reader
  // users aren't stranded on the now-hidden panel — and SR announces the panel's
  // landmark name, which doubles as the navigation announcement (NAV2-001/002).
  // The signature changes on push/pop (depth) and on replace() (top panel id, which
  // keeps depth and, in controlled mode, the index key); the first render matches
  // the initial ref so a page load never steals focus.
  const topPanelRef = useRef<HTMLDivElement>(null);
  const navSig = `${stack.length}:${stack[stack.length - 1]?.panel ?? ""}`;
  const prevSig = useRef(navSig);
  useEffect(() => {
    if (prevSig.current === navSig) return;
    prevSig.current = navSig;
    const el = topPanelRef.current;
    // Don't steal focus the consumer already placed inside the new panel (e.g. an
    // autoFocus input); preventScroll so the move can't jolt the WebView viewport
    // or raise the keyboard on push.
    if (el && !el.contains(document.activeElement)) el.focus({ preventScroll: true });
  }, [navSig]);

  // The entrance gets the same swallowed-event fallback as the exit layer: a
  // backgrounded WKWebView drops animation events, which would otherwise leave
  // `animation … both` on the panel forever — a permanent containing block for
  // position:fixed children and a leaked compositor layer.
  const topKey = stack[stack.length - 1]?.key;
  useEffect(() => {
    const node = topPanelRef.current;
    if (topKey === undefined || !node || !String(node.style.animation).includes("tk-nav-in")) return;
    const timer = window.setTimeout(() => {
      setSettledKeys((prev) => (prev.has(topKey) ? prev : new Set(prev).add(topKey)));
    }, tkAnimationMs(node) + 80);
    return () => window.clearTimeout(timer);
  }, [topKey]);

  // One keyed list for live AND exiting panels: reusing the departed entry's
  // key is what lets React move the subtree instead of remounting it. A key
  // collision with a live entry (controlled host re-feeding a popped depth
  // mid-exit) drops the exit layer for that pop — instant swap, never a
  // duplicate key.
  const rendered: { entry: NavEntry; exit?: { fromX: number } }[] = stack.map((entry) => ({ entry }));
  const topEntry = stack[stack.length - 1];
  // A quick pop → re-PUSH of the same panel would briefly render the screen
  // TWICE (the dying exit copy plus the fresh top) — duplicated test ids,
  // duplicated queries, a ghost copy sliding away behind the real one. Drop
  // the exit instantly then. A pop REVEALING the same panel (detail→detail
  // chains) keeps its slide: dir is "pop" there.
  const exitDuplicatesTop = exiting && topEntry && exiting.entry.panel === topEntry.panel && dirRef.current === "push";
  if (exiting && !stack.some((entry) => entry.key === exiting.entry.key) && !exitDuplicatesTop) {
    rendered.push({ entry: exiting.entry, exit: { fromX: exiting.fromX } });
  }

  return (
    <TKNavContext.Provider value={api}>
      <div
        ref={rootRef}
        // Self-apply the `.tk` token scope so the stack's tokens resolve even when
        // it's mounted outside a TKProvider subtree (NAV2-003).
        className={["tk", className].filter(Boolean).join(" ")}
        data-testid={testId}
        {...handlers}
        style={{
          position: "relative",
          height: "100%",
          overflow: "hidden",
          // x-axis swipe-back claims the horizontal gesture and releases
          // vertical pan to native scroll / Telegram swipe-to-minimize (INT-003);
          // contain overscroll so a horizontal drag never bubbles to the page (NAV2-004).
          ...(swipeBack ? { touchAction: "pan-y" as const, overscrollBehavior: "contain" as const } : null),
          ...style,
        }}
      >
        {rendered.map(({ entry, exit }, index) => {
          if (exit) {
            // The dying panel stays in the SAME keyed array under its original
            // key, so React keeps the live subtree (typed input, scroll,
            // in-flight requests) instead of mounting a fresh clone whose
            // mount effects (fetch!) would re-run for a screen gone in 260ms.
            return (
              <div
                key={entry.key}
                ref={exitRef}
                data-tk-nav-exit={entry.panel}
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "var(--tk-bg)",
                  zIndex: stack.length,
                  pointerEvents: "none",
                  // tk-nav-out has no `from`: the slide starts at the computed
                  // transform, i.e. exactly where the finger / pop left the panel.
                  // Always explicit (0px for a button pop) so it overrides any
                  // imperative transform a rejected swipe left on this node.
                  transform: `translateX(${exit.fromX}px)`,
                  animation: "tk-nav-out var(--tk-t2) var(--tk-ease) forwards",
                  // Scoped by the node's own lifetime, not a settled-guard: this
                  // layer leaves the DOM when tk-nav-out ends (animationend +
                  // timer fallback), so the hint can never pin a resting layer.
                  willChange: "transform",
                }}
              >
                <NavScope api={api} panel={entry.panel} params={entry.params} depth={stack.length + 1}>
                  {panels.get(entry.panel) ?? null}
                </NavScope>
              </div>
            );
          }
          const top = index === stack.length - 1;
          const under = index === stack.length - 2;
          // Human label for the region landmark; the active region gets focus on
          // navigation, so SR reads this name as the screen-change announcement —
          // no separate live-region needed, which would double-announce (NAV2-002).
          const label = panels.get(entry.panel)?.props.label ?? entry.panel;
          return (
            <div
              key={entry.key}
              ref={top ? topPanelRef : under ? underPanelRef : undefined}
              data-tk-nav-panel={entry.panel}
              data-tk-nav-key={entry.key}
              role="region"
              aria-label={label}
              tabIndex={top ? -1 : undefined}
              aria-hidden={top ? undefined : true}
              style={{
                position: "absolute",
                inset: 0,
                background: "var(--tk-bg)",
                // lower panels stay mounted (state + scroll preserved) but
                // hidden from paint and the accessibility tree; a swipe-back
                // reveals the under panel imperatively (drag onStart).
                visibility: top || (under && dragging) ? "visible" : "hidden",
                // The top panel carries NO resting transform (a resolved transform
                // is a permanent containing block for position:fixed children and
                // a leaked compositor layer — the settled-guard rationale); the
                // swipe-back writes it imperatively and clears it after the glide.
                transform: under ? "translateX(-30%)" : undefined,
                transition: "transform var(--tk-t2) var(--tk-ease)",
                transitionDuration: dragging ? "0s" : undefined,
                // Compositor promotion only while a swipe or entrance moves the
                // panel — never at rest (leaked layer per panel otherwise).
                willChange:
                  dragging || (top && index > 0 && !settledKeys.has(entry.key)) ? "transform" : undefined,
                zIndex: index,
                // Only the forward push enters from the right (and only until the
                // entrance settles). On pop the revealed panel rides its -30%→0
                // transform transition in from the left.
                ...(top && index > 0 && !dragging && dirRef.current === "push" && !settledKeys.has(entry.key)
                  ? { animation: "tk-nav-in var(--tk-t2) var(--tk-ease) both" }
                  : null),
              }}
            >
              <NavScope api={api} top={top} panel={entry.panel} params={entry.params} depth={index + 1}>
                {panels.get(entry.panel) ?? null}
              </NavScope>
            </div>
          );
        })}
      </div>
    </TKNavContext.Provider>
  );
}

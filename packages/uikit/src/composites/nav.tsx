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
import { useBackIntercept } from "../foundation/telegram";
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

export interface TKNavStackProps {
  /** Panel id shown first (uncontrolled). */
  initial: string;
  /**
   * Controlled stack (deep-link / history sync — NAV2-007). When set, the panels
   * render from it and every `useNav()` call becomes a REQUEST: it fires
   * `onChange` with the next stack but does not move until you feed that stack
   * back. Treat it append/truncate-style (keys are by index); reordering can
   * mis-key panels. An empty array falls back to `initial`.
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
  style?: CSSProperties;
}

const EDGE_ZONE = 28;

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
  const isControlledRef = useRef(isControlled);
  isControlledRef.current = isControlled;
  // Fall back to `initial` if a controlled host transiently feeds an empty stack
  // (e.g. mid-hydration) so the api's `top` never reads undefined and crashes.
  const stack: NavEntry[] =
    isControlled && stackProp!.length > 0
      ? stackProp!.map((entry, index) => ({ panel: entry.panel, params: entry.params, key: index }))
      : isControlled
        ? [{ panel: initial, key: 0 }]
        : internalStack;
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  // Once a panel's push entrance has played, never re-apply the animation on
  // later renders: `fill-mode: both` otherwise keeps a resolved transform on
  // the panel forever — a permanent containing block for position:fixed
  // children and a leaked compositor layer per panel (sheet.tsx settled-guard).
  const [settledKeys, setSettledKeys] = useState<ReadonlySet<number>>(() => new Set());
  const rootRef = useRef<HTMLDivElement>(null);
  const changeRef = useRef(onStackChange);
  changeRef.current = onStackChange;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const commit = useCallback((next: NavEntry[]) => {
    if (!isControlledRef.current) setInternalStack(next);
    onChangeRef.current?.(next.map((entry) => ({ panel: entry.panel, params: entry.params })));
    changeRef.current?.(next.map((entry) => entry.panel));
  }, []);

  const stackRef = useRef(stack);
  stackRef.current = stack;
  // Last navigation direction, read during render to pick the slide animation.
  // A push enters from the right (tk-nav-in); a pop must NOT replay that — the
  // revealed panel instead transitions from its -30% "under" offset back to 0,
  // so going back slides in from the left like the platform expects.
  const dirRef = useRef<"push" | "pop">("push");

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
    };
  }, [commit, stack]);

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
  const exitFromXRef = useRef(0);
  const reducedMotion = useReducedMotion();
  // Detect the departure against the previous stack IN RENDER (an effect would
  // still flash the old screen for one commit). Comparing stacks (not hooking
  // pop()) also covers controlled mode, where a pop() is only a request until
  // the host feeds the shorter stack back.
  const prevStackRef = useRef(stack);
  if (prevStackRef.current !== stack) {
    const prev = prevStackRef.current;
    prevStackRef.current = stack;
    const prevTop = prev[prev.length - 1];
    if (prevTop && stack.length < prev.length && !stack.some((entry) => entry.key === prevTop.key)) {
      if (!reducedMotion) setExiting({ entry: prevTop, fromX: exitFromXRef.current });
      exitFromXRef.current = 0;
    }
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
    const css = node ? getComputedStyle(node).animationDuration : "";
    const duration = css.endsWith("ms") ? parseFloat(css) : css.endsWith("s") ? parseFloat(css) * 1000 : 260;
    const timer = window.setTimeout(() => setExiting(null), duration + 80);
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

  const drag = useDragGesture({
    axis: "x",
    enabled: !!swipeBack && stack.length > 1,
    onStart: () => setDragging(true),
    onMove: (state) => setDragX(Math.max(0, state.delta)),
    onEnd: (state) => {
      setDragging(false);
      setDragX(0);
      const width = rootRef.current?.clientWidth ?? 360;
      if (tkShouldCommit(state.delta, state.velocity, width)) {
        // The exit layer picks the slide up from under the finger, not from 0.
        exitFromXRef.current = state.delta;
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

  return (
    <TKNavContext.Provider value={api}>
      <div
        ref={rootRef}
        // Self-apply the `.tk` token scope so the stack's tokens resolve even when
        // it's mounted outside a TKProvider subtree (NAV2-003).
        className="tk"
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
        {stack.map((entry, index) => {
          const top = index === stack.length - 1;
          const under = index === stack.length - 2;
          // Human label for the region landmark; the active region gets focus on
          // navigation, so SR reads this name as the screen-change announcement —
          // no separate live-region needed, which would double-announce (NAV2-002).
          const label = panels.get(entry.panel)?.props.label ?? entry.panel;
          return (
            <div
              key={entry.key}
              ref={top ? topPanelRef : undefined}
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
                // hidden from paint and the accessibility tree
                visibility: top || (under && (dragging || dragX > 0)) ? "visible" : "hidden",
                transform: top
                  ? dragX
                    ? `translateX(${dragX}px)`
                    : undefined
                  : under
                    ? `translateX(${dragX ? -30 + (dragX / Math.max(1, rootRef.current?.clientWidth ?? 360)) * 30 : -30}%)`
                    : undefined,
                transition: dragging ? "none" : "transform var(--tk-t2) var(--tk-ease)",
                zIndex: index,
                // Only the forward push enters from the right (and only until the
                // entrance settles). On pop the revealed panel rides its -30%→0
                // transform transition in from the left.
                ...(top && index > 0 && !dragging && !dragX && dirRef.current === "push" && !settledKeys.has(entry.key)
                  ? { animation: "tk-nav-in var(--tk-t2) var(--tk-ease) both" }
                  : null),
              }}
            >
              <TKNavContext.Provider
                value={top ? api : { ...api, activePanel: entry.panel, params: entry.params, depth: index + 1 }}
              >
                {panels.get(entry.panel) ?? null}
              </TKNavContext.Provider>
            </div>
          );
        })}
        {exiting ? (
          <div
            key={`exit-${exiting.entry.key}`}
            ref={exitRef}
            data-tk-nav-exit={exiting.entry.panel}
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background: "var(--tk-bg)",
              zIndex: stack.length,
              pointerEvents: "none",
              // tk-nav-out has no `from`: the slide starts at the computed
              // transform, i.e. exactly where the finger / pop left the panel.
              transform: exiting.fromX ? `translateX(${exiting.fromX}px)` : undefined,
              animation: "tk-nav-out var(--tk-t2) var(--tk-ease) forwards",
            }}
          >
            <TKNavContext.Provider
              value={{ ...api, activePanel: exiting.entry.panel, params: exiting.entry.params, depth: stack.length + 1 }}
            >
              {panels.get(exiting.entry.panel) ?? null}
            </TKNavContext.Provider>
          </div>
        ) : null}
      </div>
    </TKNavContext.Provider>
  );
}

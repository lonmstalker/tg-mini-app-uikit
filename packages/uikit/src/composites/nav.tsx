import {
  Children,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import { tkShouldCommit, useDragGesture } from "../internal/useDragGesture";
import { useBackIntercept } from "../foundation/telegram";

export interface TKNavApi {
  push: (panel: string, params?: unknown) => void;
  pop: () => void;
  replace: (panel: string, params?: unknown) => void;
  /** Unwinds the stack down to the given panel. */
  popTo: (panel: string) => void;
  depth: number;
  activePanel: string;
  /** Params of the current stack entry. */
  params: unknown;
}

interface NavEntry {
  panel: string;
  params?: unknown;
  key: number;
}

const TKNavContext = /* @__PURE__ */ createContext<TKNavApi | null>(null);

/** Stack navigation API of the nearest `TKNavStack`. */
export function useNav(): TKNavApi {
  const api = useContext(TKNavContext);
  if (!api) throw new Error("useNav must be used inside <TKNavStack>");
  return api;
}

/** Like `useNav`, but returns null outside a `<TKNavStack>` instead of throwing — for components (e.g. `TKHeader back="auto"`) that adapt to a nav stack when present. */
export function useOptionalNav(): TKNavApi | null {
  return useContext(TKNavContext);
}

export interface TKNavPanelProps {
  id: string;
  children?: ReactNode;
}

/** Declares a screen of a `TKNavStack`. */
export function TKNavPanel({ children }: TKNavPanelProps) {
  return <>{children}</>;
}

export interface TKNavStackProps {
  /** Panel id shown first. */
  initial: string;
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
  children,
  onStackChange,
  swipeBack = "edge",
  backButton = true,
  testId,
  style,
}: TKNavStackProps) {
  const keyRef = useRef(1);
  const [stack, setStack] = useState<NavEntry[]>([{ panel: initial, key: 0 }]);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const changeRef = useRef(onStackChange);
  changeRef.current = onStackChange;

  const commit = useCallback((next: NavEntry[]) => {
    setStack(next);
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
        dirRef.current = "push";
        commit([...stackRef.current, { panel, params, key: keyRef.current++ }]);
      },
      pop: () => {
        if (stackRef.current.length > 1) {
          dirRef.current = "pop";
          commit(stackRef.current.slice(0, -1));
        }
      },
      replace: (panel, params) => {
        dirRef.current = "push";
        commit([...stackRef.current.slice(0, -1), { panel, params, key: keyRef.current++ }]);
      },
      popTo: (panel) => {
        const index = stackRef.current.findIndex((entry) => entry.panel === panel);
        if (index >= 0) {
          dirRef.current = "pop";
          commit(stackRef.current.slice(0, index + 1));
        }
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

  const drag = useDragGesture({
    axis: "x",
    enabled: !!swipeBack && stack.length > 1,
    onStart: () => setDragging(true),
    onMove: (state) => setDragX(Math.max(0, state.delta)),
    onEnd: (state) => {
      setDragging(false);
      setDragX(0);
      const width = rootRef.current?.clientWidth ?? 360;
      if (tkShouldCommit(state.delta, state.velocity, width)) api.pop();
    },
  });

  const handlers =
    swipeBack === "edge"
      ? {
          ...drag,
          onPointerDown: (event: Parameters<typeof drag.onPointerDown>[0]) => {
            const left = rootRef.current?.getBoundingClientRect().left ?? 0;
            if (event.clientX - left > EDGE_ZONE) return;
            drag.onPointerDown(event);
          },
        }
      : swipeBack === "anywhere"
        ? drag
        : {};

  return (
    <TKNavContext.Provider value={api}>
      <div
        ref={rootRef}
        data-testid={testId}
        {...handlers}
        style={{ position: "relative", height: "100%", overflow: "hidden", ...style }}
      >
        {stack.map((entry, index) => {
          const top = index === stack.length - 1;
          const under = index === stack.length - 2;
          return (
            <div
              key={entry.key}
              data-tk-nav-panel={entry.panel}
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
                // Only the forward push enters from the right. On pop the revealed
                // panel rides its -30%→0 transform transition in from the left.
                ...(top && index > 0 && !dragging && !dragX && dirRef.current === "push"
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
      </div>
    </TKNavContext.Provider>
  );
}

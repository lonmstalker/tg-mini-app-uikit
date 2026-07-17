import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  TelegramBiometricError,
  TelegramBiometricManager,
  TelegramLocationData,
  TelegramLocationError,
  TelegramLocationManager,
  TelegramMotionSensor,
  TelegramMotionSensorError,
  TKTelegramAsyncState,
} from "./types";
import { useTelegramEvent, useWebApp } from "./provider";
import { TK_MIN_VERSION, tkSupports } from "./version";

export interface TKKeyboardState {
  /** True while the on-screen keyboard overlaps the layout. */
  visible: boolean;
  /** Height covered by the keyboard, px (0 when hidden). */
  height: number;
}

// Two thresholds, not one: the OPEN threshold rejects non-keyboard viewport
// noise (Telegram chrome, URL-bar shifts), while the lower CLOSE threshold
// keeps an already-open keyboard from flipping shut when WebKit pans the page
// (`covered` momentarily dips as `vv.height` wobbles mid-animation). A single
// threshold made every wobble around it a visible open/close flicker.
const TK_KB_CLOSE_RATIO = 0.5;

/**
 * Keyboard-aware layout hook driven by `visualViewport` (M6.5): returns the
 * overlap height so inputs can stay above the keyboard. SSR- and
 * plain-browser-safe (reports hidden when `visualViewport` is missing).
 */
export function useKeyboard(threshold = 80): TKKeyboardState {
  const [state, setState] = useState<TKKeyboardState>({ visible: false, height: 0 });
  useEffect(() => {
    const vv = typeof window !== "undefined" ? window.visualViewport : undefined;
    if (!vv) return;
    tkKbConsumers += 1;
    const closeThreshold = threshold * TK_KB_CLOSE_RATIO;
    let visible = false;
    let settleTimer: number | undefined;
    // Undo a leftover WebKit pan once the keyboard is geometrically closed.
    // Deferred and re-checked rather than scrolled synchronously: WebKit runs
    // its own settle animation after the keyboard retracts, and a synchronous
    // scrollTo inside the event handler fights it (visible jump). The snapshot
    // re-check reschedules while vv is still moving.
    let settlePending = false;
    let settleH = 0;
    let settleO = 0;
    let settleS = 0;
    // A leftover scrollY marks the stuck pan only when the document CANNOT be
    // user-scrolled — on a page with real overflow the same scrollY is the
    // user's own position and must never be yanked back to 0.
    const stuckShift = () =>
      (vv.offsetTop ?? 0) > 0 || (window.scrollY > 0 && !tkIsDocumentScrollable());
    const scheduleSettle = () => {
      const h0 = vv.height;
      const o0 = vv.offsetTop ?? 0;
      const s0 = window.scrollY;
      // Restart the countdown only when the geometry moved — a re-sync at an
      // unchanged viewport (deferred focusout, visibilitychange) must not keep
      // pushing an already-armed settle further out.
      if (settlePending && settleH === h0 && settleO === o0 && settleS === s0) return;
      window.clearTimeout(settleTimer);
      settlePending = true;
      settleH = h0;
      settleO = o0;
      settleS = s0;
      settleTimer = window.setTimeout(() => {
        settlePending = false;
        const stillClosed = Math.max(0, window.innerHeight - vv.height) <= closeThreshold;
        if (!stuckShift() || !stillClosed) return;
        // The snapshot includes scrollY: WebKit walking the scroll back (or the
        // user actively scrolling) restarts the countdown instead of firing.
        if (vv.height !== h0 || (vv.offsetTop ?? 0) !== o0 || window.scrollY !== s0) {
          scheduleSettle();
          return;
        }
        window.scrollTo(0, 0);
      }, 120);
    };
    // Pre-shrink (reference miniapp pattern): the keyboard height is stable per
    // device, so remember it and apply it on focusin BEFORE the vv resize
    // arrives — the layout then shrinks in one movement together with the
    // keyboard instead of jumping after it.
    let knownKbHeight = tkReadStoredKbHeight();
    let preShrunk = false;
    // The hysteresis latch (`visible ? covered > closeThreshold`) may only
    // engage after the keyboard has ACTUALLY opened — i.e. covered crossed the
    // full open threshold at least once since the pre-shrink. Without this a
    // pre-shrink followed by a constant non-keyboard gap in the
    // closeThreshold..threshold band would hold visible=true indefinitely.
    let confirmed = false;
    let revertTimer: number | undefined;
    const sync = () => {
      // Height overlapped by the keyboard. `offsetTop` must NOT be subtracted:
      // when WebKit pans the page toward a bottom field, `offsetTop` grows to
      // roughly the keyboard height, which zeroed `covered` and reported the
      // keyboard closed while it was physically open.
      const covered = Math.max(0, window.innerHeight - vv.height);
      const editableFocused = tkIsEditableActive();
      // The pre-shrink is speculative: focus gone before the confirming resize
      // (deferred focusout re-check) means no keyboard is coming — drop it now
      // instead of holding the layout shrunk until the 600ms revert.
      if (preShrunk && !editableFocused && covered <= closeThreshold) {
        preShrunk = false;
        window.clearTimeout(revertTimer);
      }
      if (covered > threshold) {
        knownKbHeight = Math.round(covered);
        tkStoreKbHeight(knownKbHeight);
        confirmed = true;
        if (preShrunk) {
          // The real resize confirmed the pre-shrink; geometry owns the state now.
          preShrunk = false;
          window.clearTimeout(revertTimer);
        }
      }
      const open =
        preShrunk || (visible && confirmed ? covered > closeThreshold : editableFocused && covered > threshold);
      if (!open) confirmed = false;
      visible = open;
      // Telegram iOS scrolls the page to keep a focused input in view and not
      // always back — the iOS keyboard chevron even closes the keyboard with NO
      // focus events, so the gate is the keyboard's geometry, never focus. The
      // stuck-state signal is the PAN (vv.offsetTop > 0), or a scrollY the user
      // could not have produced; a plain scrolled page must never arm it.
      if (covered <= closeThreshold && stuckShift()) {
        scheduleSettle();
      }
      const height = open ? (covered > closeThreshold ? Math.round(covered) : knownKbHeight) : 0;
      setState((prev) => {
        // Same quantization as the CSS var below (4px, except across the
        // open/close boundary) — a sub-4px vv jitter mid-animation must not
        // re-render every keyboard consumer.
        const crossing = (prev.height === 0) !== (height === 0);
        const quantized = crossing || Math.abs(height - prev.height) >= 4 ? height : prev.height;
        const next = { visible: open, height: quantized };
        return prev.visible === next.visible && prev.height === next.height ? prev : next;
      });
      // recipe hook: `.tk-kb-open` + `--tk-kb-height` let CSS shrink pages and
      // lift bottom bars above the keyboard. Geometry owns the applied height
      // once the real resize confirmed the keyboard; before that (pre-shrink)
      // the height is predictive.
      tkApplyKeyboardState(open, height, covered > closeThreshold);
    };
    const syncFocusIn = () => {
      if (!preShrunk && !visible && knownKbHeight > 0 && tkIsEditableActive()) {
        preShrunk = true;
        window.clearTimeout(revertTimer);
        // The keyboard never opened (hardware keyboard etc.) — no resize will
        // come; fall back to the actual geometry.
        revertTimer = window.setTimeout(() => {
          preShrunk = false;
          sync();
        }, 600);
      }
      sync();
    };
    // focusout must NOT resync synchronously: when focus moves between fields
    // the blur fires while activeElement is already body, so a synchronous sync
    // saw "no editable + pan" and scrolled to 0 — then WebKit re-panned to the
    // next field, jumping the screen on every form-field hop. Defer ~100ms and
    // re-read activeElement: focus landing in another editable makes it a no-op.
    let focusOutTimer: number | undefined;
    const syncFocusOut = () => {
      window.clearTimeout(focusOutTimer);
      focusOutTimer = window.setTimeout(sync, 100);
    };
    sync();
    // The host can resize a .tk root WITHOUT any visualViewport event —
    // Telegram lowers `--tg-viewport-stable-height` through its own event
    // channel and the capped `#root` shrinks silently. Re-sync so the applied
    // overlap tracks the root's real box, not the last vv snapshot. (Our own
    // writes shrink the PAGE inside the root, not the root's box — no loop.)
    const rootObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => sync()) : undefined;
    if (rootObserver) document.querySelectorAll<HTMLElement>(".tk").forEach((el) => rootObserver.observe(el));
    vv.addEventListener("resize", sync);
    vv.addEventListener("scroll", sync);
    document.addEventListener("focusin", syncFocusIn);
    document.addEventListener("focusout", syncFocusOut);
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("focus", sync);
    return () => {
      rootObserver?.disconnect();
      vv.removeEventListener("resize", sync);
      vv.removeEventListener("scroll", sync);
      document.removeEventListener("focusin", syncFocusIn);
      document.removeEventListener("focusout", syncFocusOut);
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("focus", sync);
      window.clearTimeout(settleTimer);
      window.clearTimeout(focusOutTimer);
      window.clearTimeout(revertTimer);
      tkKbConsumers -= 1;
      // Clear the global class once the LAST keyboard consumer unmounts, so a
      // screen that navigates away while the keyboard is still up doesn't leave
      // `.tk-kb-open` stuck on and lift the next screen by a phantom keyboard.
      if (tkKbConsumers <= 0) {
        tkKbConsumers = 0;
        tkApplyKeyboardState(false, 0);
      }
    };
  }, [threshold]);
  return state;
}

// Focusing these via Tab / click raises no on-screen keyboard — they must not
// pre-shrink the layout.
const TK_NON_TEXT_INPUT = /^(?:button|checkbox|radio|range|color|file|submit|reset|image|hidden)$/;

function tkIsEditableActive(): boolean {
  if (typeof document === "undefined") return false;
  const el = document.activeElement;
  if (el instanceof HTMLInputElement) return !TK_NON_TEXT_INPUT.test(el.type);
  if (el instanceof HTMLTextAreaElement) return true;
  if (!(el instanceof HTMLElement)) return false;
  // isContentEditable honors inheritance and ="false"; environments without it
  // (jsdom) fall back to the attribute, still rejecting an explicit "false".
  return typeof el.isContentEditable === "boolean"
    ? el.isContentEditable
    : el.matches('[contenteditable]:not([contenteditable="false"])');
}

// Whether the page itself is a user scroller. When it is not, any non-zero
// window.scrollY with the keyboard closed can only be a leftover WebKit pan.
function tkIsDocumentScrollable(): boolean {
  const el = document.scrollingElement ?? document.documentElement;
  return !!el && el.scrollHeight > el.clientHeight;
}

/*
 * How much of the keyboard actually overlaps THIS root's box. The raw
 * `height` (innerHeight − vv.height) over-lifts in two real device cases:
 *  - the HOST already shrank the root (Telegram iOS lowers
 *    `--tg-viewport-stable-height` on keyboard, capping `#root`) — the
 *    residual overlap is `rootBottom − visibleBottom`, near 0;
 *  - WebKit PANNED the page toward a bottom field (`vv.offsetTop` ≈ keyboard
 *    height) — the pan already moved the bar up, so subtracting the full
 *    height again drew it a whole keyboard ABOVE the keyboard (the "composer
 *    jumps to the top" report). `offsetTop` stays ignored for DETECTION
 *    (zeroing `covered` there reported the keyboard closed while open) — it
 *    participates only in the applied overlap.
 * Before the confirming resize (pre-shrink) vv is still full-size, so the
 * overlap must be PREDICTED instead: the stored keyboard height minus
 * whatever gap the host already keeps below the root. Roots jsdom/SSR cannot
 * measure (zero-size rect) keep the raw height — the historical behavior.
 */
function tkRootOverlap(root: HTMLElement, height: number, geometryOwns: boolean): number {
  const vv = typeof window !== "undefined" ? window.visualViewport : undefined;
  const rect = root.getBoundingClientRect();
  if (!vv || rect.height <= 0) return height;
  if (!geometryOwns) {
    return Math.max(0, height - Math.max(0, Math.round(window.innerHeight - rect.bottom)));
  }
  const visibleBottom = (vv.offsetTop ?? 0) + vv.height;
  return Math.min(height, Math.max(0, Math.round(rect.bottom - visibleBottom)));
}

// Ref-counted so concurrent consumers don't fight and the class is cleared only
// once they have all unmounted.
let tkKbConsumers = 0;
function tkApplyKeyboardState(open: boolean, height: number, geometryOwns = false): void {
  if (typeof document === "undefined") return;
  const roots = document.querySelectorAll<HTMLElement>(".tk");
  // Scope the lift to the root that actually contains the focused editable, so a
  // keyboard in one .tk subtree doesn't lift an unrelated one (FND-009).
  const active = document.activeElement;
  const target = open && active instanceof HTMLElement ? active.closest(".tk") : null;
  // A portalled editable (focused element outside every .tk) in a single-root
  // app still lifts that lone root, preserving the pre-scoping behavior.
  const sole = open && !target && roots.length === 1 ? roots[0] : null;
  roots.forEach((el) => {
    const lifted = el === target || el === sole;
    // Write only on an actual change: sync() runs on every vv event (and
    // consumer watchdogs ping it on a timer), and an unconditional class write
    // invalidated styles on every .tk root each time.
    if (el.classList.contains("tk-kb-open") !== lifted) el.classList.toggle("tk-kb-open", lifted);
    // `--tk-kb-height` is the single animated height source: TKPage subtracts
    // it via calc() + transition. Written on the .tk root, NOT documentElement
    // (multi-root apps). Sub-4px wobble is ignored so a vv jitter mid-animation
    // doesn't restart the transition — except across the open/close boundary.
    const next = lifted ? tkRootOverlap(el, height, geometryOwns) : 0;
    const prev = parseFloat(el.style.getPropertyValue("--tk-kb-height")) || 0;
    const crossing = (prev === 0) !== (next === 0);
    if (crossing || Math.abs(next - prev) >= 4) {
      el.style.setProperty("--tk-kb-height", `${next}px`);
    }
  });
}

// Keyboard-height memory (reference miniapp pattern): pre-shrink works from the
// very first focus of a session; the actual resize then corrects the value.
const TK_KB_HEIGHT_KEY = "tk:kbHeight";
function tkReadStoredKbHeight(): number {
  try {
    return Number(window.localStorage.getItem(TK_KB_HEIGHT_KEY)) || 0;
  } catch {
    return 0;
  }
}
function tkStoreKbHeight(height: number): void {
  try {
    window.localStorage.setItem(TK_KB_HEIGHT_KEY, String(height));
  } catch {
    /* private mode etc. — pre-shrink simply starts working from the second focus */
  }
}

export function useHideKeyboard(): { hide: () => boolean; isSupported: boolean } {
  const wa = useWebApp();
  return useMemo(
    () => ({
      hide: () => {
        // Today's bridge never throws here (a bare postEvent), but a drifted
        // script/client combination must degrade to the blur fallback, not
        // abort the caller's tap handler mid-flow.
        if (wa?.hideKeyboard) {
          try {
            wa.hideKeyboard();
            return true;
          } catch {
            /* fall through to the DOM blur */
          }
        }
        if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
          return true;
        }
        return false;
      },
      isSupported: !!wa?.hideKeyboard,
    }),
    [wa],
  );
}

export interface TKBiometrics extends TKTelegramAsyncState<TelegramBiometricError> {
  manager: TelegramBiometricManager | undefined;
  init: () => Promise<boolean>;
  requestAccess: (reason?: string) => Promise<boolean>;
  authenticate: (reason?: string) => Promise<{ ok: boolean; token?: string }>;
  updateToken: (token: string) => Promise<boolean>;
  openSettings: () => boolean;
  isSupported: boolean;
  /**
   * Whether the DEVICE actually has usable biometrics — `undefined` until the
   * manager reports it (call `init()` to find out). `isSupported` alone is a
   * trap: the official bridge creates `BiometricManager` on every platform
   * (desktop included), so gate biometric UI on `isAvailable === true`, not on
   * `isSupported`.
   */
  isAvailable: boolean | undefined;
}

export function useBiometrics(): TKBiometrics {
  const wa = useWebApp();
  const manager = wa?.BiometricManager;
  const [state, setState] = useState<TKTelegramAsyncState<TelegramBiometricError>>({ status: "idle" });
  const isSupported = !!manager && tkSupports(wa, TK_MIN_VERSION.biometric);
  // Availability is only known after init(): track it reactively — the manager
  // mutates in place and fires biometricManagerUpdated instead of re-rendering.
  const [isAvailable, setIsAvailable] = useState<boolean | undefined>(() =>
    manager?.isInited ? manager.isBiometricAvailable : undefined,
  );
  const readAvailability = useCallback(() => {
    const m = wa?.BiometricManager;
    setIsAvailable(m?.isInited ? m.isBiometricAvailable : undefined);
  }, [wa]);
  useEffect(() => readAvailability(), [readAvailability]);
  useTelegramEvent("biometricManagerUpdated", readAvailability);
  return useMemo(
    () => ({
      manager,
      init: () => {
        setState({ status: "pending" });
        return new Promise<boolean>((resolve) => {
          if (!isSupported || !manager?.init) {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
            return;
          }
          try {
            manager.init(() => {
              setState({ status: "success" });
              readAvailability();
              resolve(true);
            });
          } catch {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
          }
        });
      },
      requestAccess: (reason) => {
        setState({ status: "pending" });
        return new Promise<boolean>((resolve) => {
          if (!isSupported || !manager?.requestAccess) {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
            return;
          }
          try {
            manager.requestAccess(reason ? { reason } : undefined, (ok) => {
              setState(ok ? { status: "success" } : { status: "error", error: "ACCESS_DENIED" });
              resolve(!!ok);
            });
          } catch {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
          }
        });
      },
      authenticate: (reason) => {
        setState({ status: "pending" });
        return new Promise<{ ok: boolean; token?: string }>((resolve) => {
          if (!isSupported || !manager?.authenticate) {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve({ ok: false });
            return;
          }
          try {
            manager.authenticate(reason ? { reason } : undefined, (ok, token) => {
              setState(ok ? { status: "success" } : { status: "error", error: "AUTH_FAILED" });
              resolve({ ok: !!ok, token });
            });
          } catch {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve({ ok: false });
          }
        });
      },
      updateToken: (token) => {
        setState({ status: "pending" });
        return new Promise<boolean>((resolve) => {
          if (!isSupported || !manager?.updateBiometricToken) {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
            return;
          }
          try {
            manager.updateBiometricToken(token, (ok) => {
              setState(ok ? { status: "success" } : { status: "error", error: "TOKEN_UPDATE_FAILED" });
              resolve(!!ok);
            });
          } catch {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
          }
        });
      },
      openSettings: () => {
        if (!isSupported || !manager?.openSettings) {
          setState({ status: "error", error: "UNSUPPORTED" });
          return false;
        }
        try {
          manager.openSettings();
          return true;
        } catch {
          setState({ status: "error", error: "UNSUPPORTED" });
          return false;
        }
      },
      status: isSupported ? state.status : "unsupported",
      error: isSupported ? state.error : "UNSUPPORTED",
      isSupported,
      isAvailable: isSupported ? isAvailable : false,
    }),
    [isSupported, isAvailable, manager, readAvailability, state.error, state.status],
  );
}

export interface TKLocation extends TKTelegramAsyncState<TelegramLocationError> {
  manager: TelegramLocationManager | undefined;
  init: () => Promise<boolean>;
  getLocation: () => Promise<TelegramLocationData | null>;
  openSettings: () => boolean;
  isSupported: boolean;
}

export function useLocation(): TKLocation {
  const wa = useWebApp();
  const manager = wa?.LocationManager;
  const [state, setState] = useState<TKTelegramAsyncState<TelegramLocationError>>({ status: "idle" });
  const isSupported = !!manager && tkSupports(wa, TK_MIN_VERSION.location);
  return useMemo(
    () => ({
      manager,
      init: () => {
        setState({ status: "pending" });
        return new Promise<boolean>((resolve) => {
          if (!isSupported || !manager?.init) {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
            return;
          }
          try {
            manager.init(() => {
              setState({ status: "success" });
              resolve(true);
            });
          } catch {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
          }
        });
      },
      getLocation: () => {
        setState({ status: "pending" });
        return new Promise<TelegramLocationData | null>((resolve) => {
          if (!isSupported || !manager?.getLocation) {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(null);
            return;
          }
          try {
            manager.getLocation((locationData) => {
              setState(locationData ? { status: "success" } : { status: "error", error: "LOCATION_UNAVAILABLE" });
              resolve(locationData ?? null);
            });
          } catch {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(null);
          }
        });
      },
      openSettings: () => {
        if (!isSupported || !manager?.openSettings) {
          setState({ status: "error", error: "UNSUPPORTED" });
          return false;
        }
        try {
          manager.openSettings();
          return true;
        } catch {
          setState({ status: "error", error: "UNSUPPORTED" });
          return false;
        }
      },
      status: isSupported ? state.status : "unsupported",
      error: isSupported ? state.error : "UNSUPPORTED",
      isSupported,
    }),
    [isSupported, manager, state.error, state.status],
  );
}

interface TKMotionSensorApi<S extends TelegramMotionSensor = TelegramMotionSensor>
  extends TKTelegramAsyncState<TelegramMotionSensorError> {
  sensor: S | undefined;
  /** `needAbsolute` maps to `need_absolute` and is honoured by `DeviceOrientation` only. */
  start: (refreshRate?: number, options?: { needAbsolute?: boolean }) => Promise<boolean>;
  stop: () => Promise<boolean>;
  isSupported: boolean;
}

function sensorApi<S extends TelegramMotionSensor>(
  sensor: S | undefined,
  state: TKTelegramAsyncState<TelegramMotionSensorError>,
  setState: (state: TKTelegramAsyncState<TelegramMotionSensorError>) => void,
  supported: boolean,
): TKMotionSensorApi<S> {
  const isSupported = !!sensor && supported;
  return {
    sensor,
    start: (refreshRate?: number, options?: { needAbsolute?: boolean }) => {
      setState({ status: "pending" });
      return new Promise<boolean>((resolve) => {
        if (!isSupported || !sensor?.start) {
          setState({ status: "error", error: "UNSUPPORTED" });
          resolve(false);
          return;
        }
        const params: { refresh_rate?: number; need_absolute?: boolean } = {};
        if (refreshRate) params.refresh_rate = refreshRate;
        if (options?.needAbsolute != null) params.need_absolute = options.needAbsolute;
        try {
          sensor.start(Object.keys(params).length > 0 ? params : undefined, (ok) => {
            setState(ok ? { status: "success" } : { status: "error", error: "START_FAILED" });
            resolve(!!ok);
          });
        } catch {
          setState({ status: "error", error: "UNSUPPORTED" });
          resolve(false);
        }
      });
    },
    stop: () => {
      setState({ status: "pending" });
      return new Promise<boolean>((resolve) => {
        if (!isSupported || !sensor?.stop) {
          setState({ status: "error", error: "UNSUPPORTED" });
          resolve(false);
          return;
        }
        try {
          sensor.stop((ok) => {
            setState(ok ? { status: "success" } : { status: "error", error: "STOP_FAILED" });
            resolve(!!ok);
          });
        } catch {
          setState({ status: "error", error: "UNSUPPORTED" });
          resolve(false);
        }
      });
    },
    status: isSupported ? state.status : "unsupported",
    error: isSupported ? state.error : "UNSUPPORTED",
    isSupported,
  };
}

type TKSensorKey = "accelerometer" | "deviceOrientation" | "gyroscope";
type TKSensorStates = Record<TKSensorKey, TKTelegramAsyncState<TelegramMotionSensorError>>;

export function useMotionSensors() {
  const wa = useWebApp();
  // One status PER sensor — a single shared state made starting/erroring one
  // sensor overwrite the others' status (any per-sensor spinner/badge lied).
  const [states, setStates] = useState<TKSensorStates>(() => ({
    accelerometer: { status: "idle" },
    deviceOrientation: { status: "idle" },
    gyroscope: { status: "idle" },
  }));
  // All three sensors are Bot API 8.0; gate on version, not method presence.
  const supported = tkSupports(wa, TK_MIN_VERSION.sensors);
  useEffect(() => {
    return () => {
      try {
        wa?.Accelerometer?.stop?.();
        wa?.DeviceOrientation?.stop?.();
        wa?.Gyroscope?.stop?.();
      } catch {
        /* sensors not available on this client version */
      }
    };
  }, [wa]);
  const setAccelerometer = useCallback(
    (s: TKTelegramAsyncState<TelegramMotionSensorError>) => setStates((p) => ({ ...p, accelerometer: s })),
    [],
  );
  const setDeviceOrientation = useCallback(
    (s: TKTelegramAsyncState<TelegramMotionSensorError>) => setStates((p) => ({ ...p, deviceOrientation: s })),
    [],
  );
  const setGyroscope = useCallback(
    (s: TKTelegramAsyncState<TelegramMotionSensorError>) => setStates((p) => ({ ...p, gyroscope: s })),
    [],
  );
  return useMemo(
    () => ({
      accelerometer: sensorApi(wa?.Accelerometer, states.accelerometer, setAccelerometer, supported),
      deviceOrientation: sensorApi(wa?.DeviceOrientation, states.deviceOrientation, setDeviceOrientation, supported),
      gyroscope: sensorApi(wa?.Gyroscope, states.gyroscope, setGyroscope, supported),
    }),
    [states, supported, wa, setAccelerometer, setDeviceOrientation, setGyroscope],
  );
}

export function useVerticalSwipes(): {
  /** Mirrors `WebApp.isVerticalSwipesEnabled` (swipes are enabled by default). */
  isEnabled: boolean;
  enable: () => boolean;
  disable: () => boolean;
  isSupported: boolean;
} {
  const wa = useWebApp();
  const [isEnabled, setIsEnabled] = useState(() => wa?.isVerticalSwipesEnabled ?? true);
  useEffect(() => setIsEnabled(wa?.isVerticalSwipesEnabled ?? true), [wa]);
  return useMemo(
    () => ({
      isEnabled,
      enable: () => {
        if (!wa?.enableVerticalSwipes) return false;
        wa.enableVerticalSwipes();
        setIsEnabled(wa.isVerticalSwipesEnabled ?? true);
        return true;
      },
      disable: () => {
        if (!wa?.disableVerticalSwipes) return false;
        wa.disableVerticalSwipes();
        setIsEnabled(wa.isVerticalSwipesEnabled ?? false);
        return true;
      },
      isSupported: !!(wa?.enableVerticalSwipes || wa?.disableVerticalSwipes),
    }),
    [isEnabled, wa],
  );
}

export function useOrientationLock(): {
  /** Mirrors `WebApp.isOrientationLocked`. */
  isLocked: boolean;
  lock: () => boolean;
  unlock: () => boolean;
  isSupported: boolean;
} {
  const wa = useWebApp();
  const [isLocked, setIsLocked] = useState(() => wa?.isOrientationLocked ?? false);
  useEffect(() => setIsLocked(wa?.isOrientationLocked ?? false), [wa]);
  return useMemo(
    () => ({
      isLocked,
      // Today's bridge never throws here, but callers run these around camera
      // flows (check-in) where an escape would strand their re-entry latch —
      // degrade to false on any drifted script/client combination.
      lock: () => {
        if (!wa?.lockOrientation) return false;
        try {
          wa.lockOrientation();
        } catch {
          return false;
        }
        setIsLocked(wa.isOrientationLocked ?? true);
        return true;
      },
      unlock: () => {
        if (!wa?.unlockOrientation) return false;
        try {
          wa.unlockOrientation();
        } catch {
          return false;
        }
        setIsLocked(wa.isOrientationLocked ?? false);
        return true;
      },
      isSupported: !!(wa?.lockOrientation || wa?.unlockOrientation),
    }),
    [isLocked, wa],
  );
}

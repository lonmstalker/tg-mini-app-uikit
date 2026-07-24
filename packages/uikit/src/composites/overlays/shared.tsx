import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { tkZ } from "../../internal/dom";
import { useScrollLock } from "../../internal/useScrollLock";
import { useOverlayLayer } from "../../internal/useOverlayLayer";
import { useVerticalSwipeGuard } from "../../internal/useVerticalSwipeGuard";
import { useLatest } from "../../internal/useLatest";
import { useBackIntercept, useSuppressNativeButtons } from "../../foundation/telegram";

/*
 * Overlays portal into the nearest `.tk` root or `[data-tk-portal-root]` host
 * (the toast contract, OVL-010) and stay `position: absolute` against it — the
 * `TKProvider` root is `position: relative` by default, so a transformed or
 * positioned ancestor between the consumer and the root can no longer trap or
 * clip them (REU-009). Only when no host exists (bare render, host = body) do
 * they fall back to `position: fixed`, like TKPopper: inside the Telegram iOS
 * webview `fixed` is unreliable while the keyboard or viewport animates, so
 * within a `.tk` host `absolute` stays the contract.
 */

/**
 * Dev guard for the portaled modal overlays (sheet, dialog, action sheet,
 * viewer): they anchor to the portal host and expect it to be viewport-sized.
 * When that host instead grows with the document (a `.tk` root on a scrolling
 * page), the overlay lands partly or fully off-screen. Detect the signature —
 * anchor taller than the viewport AND extending past it — and warn once
 * (REU-006). The `fixed` body fallback has no positioned anchor, so it is
 * naturally exempt.
 */
export function useAnchorGuard(
  name: string,
  mounted: boolean,
  ref: RefObject<HTMLElement | null>,
  host?: HTMLElement | null,
) {
  const warnedRef = useRef(false);
  useEffect(() => {
    if (process.env.NODE_ENV === "production" || !mounted || warnedRef.current) return;
    const anchor = ref.current?.offsetParent;
    if (!(anchor instanceof HTMLElement) || typeof window === "undefined") return;
    const rect = anchor.getBoundingClientRect();
    const vh = window.innerHeight;
    if (rect.height > vh + 1 && rect.bottom > vh + 1) {
      warnedRef.current = true;
      // eslint-disable-next-line no-console
      console.warn(
        `${name}: the overlay portal host is taller than the viewport, so the overlay anchors off-screen. ` +
          "Keep the `.tk` root (or [data-tk-portal-root] host) viewport-sized (TKAppShell, TKFrame, or a 100dvh wrapper) (REU-006).",
      );
    }
  }, [mounted, host]);
}

export interface TKOverlayPortal {
  /** Resolved portal host, or null before mount (SSR renders no overlay). */
  host: HTMLElement | null;
  /** True when the host is `document.body` — position overlay layers `fixed` there. */
  fixed: boolean;
  /** Hidden marker; render it at the overlay's tree position so the host resolves. */
  marker: ReactElement;
  /** Portals `node` into the host (marker included); nothing until the host resolves. */
  render: (node: ReactNode) => ReactElement;
}

/**
 * Resolves the shared overlay portal host — the nearest `.tk` token scope or an
 * explicit `[data-tk-portal-root]` (e.g. TKFrame in demos), falling back to
 * `document.body` (the toast contract, OVL-010). Resolution happens in an
 * effect, so SSR markup contains only the hidden marker and the portal mounts
 * client-side.
 */
export function useOverlayPortal(): TKOverlayPortal {
  const markerRef = useRef<HTMLSpanElement>(null);
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setHost(
      markerRef.current?.closest<HTMLElement>(".tk, [data-tk-portal-root]") ??
        (typeof document !== "undefined" ? document.body : null),
    );
  }, []);
  const marker = <span ref={markerRef} aria-hidden style={{ display: "none" }} />;
  return {
    host,
    fixed: typeof document !== "undefined" && host === document.body,
    marker,
    render: (node: ReactNode) => (
      <>
        {marker}
        {host ? createPortal(node, host) : null}
      </>
    ),
  };
}

/* ---------------- Mini viewport (frame for embedding overlay areas) ---------------- */

export interface TKFrameProps {
  children?: ReactNode;
  height?: number | string;
  /**
   * Inner padding so embedded content clears the frame's rounded border
   * instead of being clipped by `overflow: hidden`. `true` applies a 16px
   * gutter; pass a number for a custom one. Leave unset for edge-to-edge
   * overlay/page demos that fill the frame themselves.
   */
  pad?: number | boolean;
  testId?: string;
  style?: CSSProperties;
}

export function TKFrame({ children, height = 520, pad, testId, style }: TKFrameProps) {
  const padding = pad === true ? 16 : pad || undefined;
  return (
    <div
      data-testid={testId}
      // A portal root so overlays/toasts mounted inside a demo frame anchor to it
      // instead of escaping to the page `.tk` root (OVL-010).
      data-tk-portal-root
      style={{
        position: "relative",
        overflow: "hidden",
        height,
        padding,
        borderRadius: "var(--tk-r-xl)",
        background: "var(--tk-bg)",
        boxShadow: "inset 0 0 0 1px var(--tk-sep)",
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ---------------- Mount/closing transition helper ---------------- */

/** Longest duration in a CSS `animation-duration` list, in ms (0 if unparseable). */
function parseCssDuration(value: string | undefined): number {
  if (!value) return 0;
  return value.split(",").reduce((max, part) => {
    const t = part.trim();
    const n = parseFloat(t);
    if (Number.isNaN(n)) return max;
    return Math.max(max, t.endsWith("ms") ? n : n * 1000);
  }, 0);
}

/**
 * Drives a mount/closing transition. Pass the animated panel `ref` so unmount is
 * tied to the REAL exit: it listens for `animationend` and reads the resolved
 * `animation-duration` (which honors the `--tk-ms` motionSpeed knob) instead of a
 * fixed `closeMs` that desyncs and clips the close (OVL-003). `closeMs` is the
 * fallback when no node/duration is available (SSR, jsdom, reduced-motion).
 */
export function useMountTransition(open: boolean, closeMs: number, ref?: RefObject<HTMLElement | null>) {
  const [state, setState] = useState<"closed" | "open" | "closing">(open ? "open" : "closed");
  const stateRef = useLatest(state);
  useEffect(() => {
    if (open) {
      setState("open");
      return;
    }
    if (stateRef.current === "closed") return;
    setState("closing");
    const node = ref?.current ?? null;
    let ms = closeMs;
    if (node && typeof getComputedStyle === "function") {
      const measured = parseCssDuration(getComputedStyle(node).animationDuration);
      if (measured > 0) ms = measured;
    }
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setState("closed");
    };
    const onEnd = (e: AnimationEvent) => {
      if (e.target === node) finish();
    };
    node?.addEventListener("animationend", onEnd);
    const t = window.setTimeout(finish, ms);
    return () => {
      node?.removeEventListener("animationend", onEnd);
      window.clearTimeout(t);
    };
  }, [open, closeMs, ref]);
  return { mounted: state !== "closed", closing: state === "closing" };
}

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Roles whose own Enter handling must NOT be hijacked by the dialog's primary
// confirm (OVL-007); paired with tagName + contentEditable checks.
const INTERACTIVE_ROLES = new Set([
  "button", "link", "textbox", "searchbox", "combobox", "listbox", "menu", "menuitem",
  "menuitemcheckbox", "menuitemradio", "tab", "checkbox", "radio", "switch", "slider", "spinbutton", "option",
]);

/**
 * Marks everything outside the overlay's ancestor path inert + aria-hidden so AT
 * (rotor/virtual cursor) and pointers can't reach the obscured background — Tab
 * trapping alone doesn't stop the SR cursor (OVL-006). Walks node→root inerting
 * each level's siblings; only touches what it changes (so a consumer's own
 * aria-hidden and a parent overlay's inerting survive) and restores on cleanup.
 */
function applyBackgroundInert(node: HTMLElement): () => void {
  if (typeof document === "undefined") return () => {};
  const root = node.closest<HTMLElement>(".tk") ?? document.body;
  const touched: { el: HTMLElement; hadAria: boolean; prevInert: boolean }[] = [];
  let el: HTMLElement | null = node;
  while (el && el !== root && el.parentElement) {
    for (const sib of Array.from(el.parentElement.children)) {
      if (sib === el || !(sib instanceof HTMLElement)) continue;
      // Never inert a scrim (must stay clickable to dismiss), a live region that
      // belongs above modals (the toast stack, marked `data-tk-live`, or any
      // consumer node opted out with `data-tk-keep-live`), or another live modal
      // overlay (it manages its own a11y and stays reachable when stacked).
      if (sib.hasAttribute("data-tk-scrim") || sib.hasAttribute("data-tk-live") || sib.hasAttribute("data-tk-keep-live")) continue;
      if (sib.getAttribute("aria-modal") === "true" || sib.querySelector('[aria-modal="true"]')) continue;
      // Owned by another live overlay already — leave it for that overlay to restore.
      if (sib.hasAttribute("data-tk-inert") && sib.getAttribute("aria-hidden") === "true") continue;
      const hadAria = sib.hasAttribute("aria-hidden");
      const prevInert = sib.inert;
      if (!hadAria) sib.setAttribute("aria-hidden", "true");
      sib.inert = true;
      sib.setAttribute("data-tk-inert", "");
      touched.push({ el: sib, hadAria, prevInert });
    }
    el = el.parentElement;
  }
  return () => {
    for (const { el, hadAria, prevInert } of touched) {
      if (!hadAria) el.removeAttribute("aria-hidden");
      el.inert = prevInert;
      el.removeAttribute("data-tk-inert");
    }
  };
}

// LIFO stack of mounted modal overlays. Each `useOverlayA11y` adds its own
// document-capture keydown listener; without coordination one Escape would fire
// every listener and collapse the whole stack. Only the top overlay handles
// Escape (and stops the rest), so a nested sheet closes before its parent.
const overlayEscapeStack: object[] = [];

/**
 * Modal keyboard behavior: moves focus into the overlay, traps Tab inside,
 * closes on Escape and returns focus to the previously focused element.
 */
export function useOverlayA11y(
  active: boolean,
  ref: RefObject<HTMLDivElement | null>,
  onClose?: () => void,
  onConfirm?: () => void,
  /**
   * Inert/aria-hide the background while active (OVL-006). Default true. Anchored
   * poppers pass false: they have no scrim, so inerting the background would also
   * kill their click-outside-to-close and make the anchor unreachable (OVL-002).
   */
  inertBackground = true,
) {
  const closeRef = useLatest(onClose);
  const confirmRef = useLatest(onConfirm);
  // captured once on false->true so re-running the effect (e.g. ref change)
  // never overwrites the element we should hand focus back to
  const restoreRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!active) {
      restoreRef.current = null;
      return;
    }
    const node = ref.current;
    if (!restoreRef.current && typeof document !== "undefined") {
      restoreRef.current = document.activeElement as HTMLElement | null;
    }
    const first = node?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? node)?.focus({ preventScroll: true });

    // Inert/aria-hide the background so AT and pointers can't reach behind the
    // scrim (OVL-006); restored on cleanup below.
    const restoreInert = node && inertBackground ? applyBackgroundInert(node) : null;

    // Register this overlay as the new top of the Escape stack.
    const token = {};
    overlayEscapeStack.push(token);

    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        // Only the topmost overlay closes; `stopImmediatePropagation` also
        // prevents the other overlays' (and any app) document listeners from
        // firing, so one Escape closes exactly one layer.
        if (overlayEscapeStack[overlayEscapeStack.length - 1] !== token) return;
        e.stopImmediatePropagation();
        closeRef.current?.();
        return;
      }
      if (e.key === "Enter" && confirmRef.current) {
        // Enter confirms the single primary action — but ONLY from the panel
        // itself or inert content, never from a control that consumes Enter
        // (native form fields, links/buttons, contentEditable, or any element
        // with an interactive ARIA role like role="button"). Gating on tagName
        // alone fired the (often destructive) confirm from custom div-based
        // widgets — a data-loss footgun (OVL-007).
        // Guard for HTMLElement: e.target can be `document` (Enter dispatched on
        // the document), which has no getAttribute — a null target means the
        // panel/non-element, which SHOULD confirm.
        const target = e.target instanceof HTMLElement ? e.target : null;
        const tag = target?.tagName;
        const role = target?.getAttribute("role") ?? "";
        // `isContentEditable` is unreliable across engines (and unimplemented in
        // jsdom), so also read the attribute directly.
        const ce = target?.getAttribute("contenteditable");
        const interactive =
          tag === "TEXTAREA" || tag === "INPUT" || tag === "SELECT" || tag === "A" || tag === "BUTTON" ||
          target?.isContentEditable === true ||
          (ce != null && ce !== "false") ||
          INTERACTIVE_ROLES.has(role);
        if (!interactive) {
          e.preventDefault();
          confirmRef.current();
          return;
        }
      }
      if (e.key !== "Tab" || !node) return;
      const focusables = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!focusables.length) {
        e.preventDefault();
        return;
      }
      const firstEl = focusables[0];
      const lastEl = focusables[focusables.length - 1];
      const current = document.activeElement;
      if (e.shiftKey && (current === firstEl || current === node)) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && current === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      restoreInert?.();
      const i = overlayEscapeStack.indexOf(token);
      if (i !== -1) overlayEscapeStack.splice(i, 1);
      // Only restore on the real teardown (active -> false), and only if the
      // captured element is still in the document and not inside another live
      // overlay that is taking over focus.
      const prev = restoreRef.current;
      if (!prev || typeof document === "undefined") return;
      restoreRef.current = null;
      if (!document.contains(prev)) return;
      if (prev.closest?.('[aria-modal="true"]')) return;
      prev.focus?.({ preventScroll: true });
    };
  }, [active, ref]);
}

export interface TKModalOverlayOptions {
  /** Mounted for the whole lifecycle incl. the close animation (drives layer / scroll-lock / swipe-guard). */
  mounted: boolean;
  /** Truly open (`mounted && !closing`) — drives focus-trap / Escape / Back. */
  active: boolean;
  ref: RefObject<HTMLDivElement | null>;
  onClose?: () => void;
  onConfirm?: () => void;
  /** Panel role for `panelProps` (default `"dialog"`; pass `"alertdialog"` for a confirm). */
  role?: "dialog" | "alertdialog";
  /** id of the panel's labelling element → `panelProps["aria-labelledby"]`. */
  labelledBy?: string;
  /** id of the panel's describing element → `panelProps["aria-describedby"]`. */
  describedBy?: string;
  /** Lock page scroll while mounted (default true). */
  scrollLock?: boolean;
  /** Mute Telegram swipe-to-minimize while mounted (default true). */
  swipeGuard?: boolean;
  /** Inert/aria-hide the background (default true; pass false for a non-scrim anchored modal). */
  inertBackground?: boolean;
  /**
   * Native Telegram Main/Secondary button handling while mounted. Those
   * buttons live in the client chrome OUTSIDE the webview — the scrim and
   * focus-trap cannot reach them — so the default `"suppress"` hides them for
   * the overlay's lifetime and restores them on close. Pass `"keep"` when the
   * overlay itself is driven by the native button (e.g. a picker sheet
   * confirmed by the MainButton). The Back button is never suppressed — it
   * closes the overlay instead.
   */
  nativeButtons?: "suppress" | "keep";
}

export interface TKModalOverlayResult {
  scrimZ: number;
  panelZ: number;
  /** Pre-built panel attributes: role, `aria-modal`, label/desc ids, `tabIndex={-1}`, and `style.zIndex`. Spread onto the panel and add your own style after. */
  panelProps: {
    role: "dialog" | "alertdialog";
    "aria-modal": true;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
    tabIndex: -1;
    style: CSSProperties;
  };
  /** Pre-built scrim attributes for a hand-rolled scrim (`data-tk-scrim` exempts it from inerting; `style.zIndex`). The bundled `Scrim` already sets these. */
  scrimProps: { "data-tk-scrim": ""; style: CSSProperties };
}

/**
 * Composes the five mounted-keyed modal hooks (layer → scroll-lock → swipe-guard
 * → focus-trap → Back) into one ordered call so a new overlay can't wire them out
 * of order or miss one (INT-DX-001). Returns the z-stack plus ready-to-spread
 * `panelProps`/`scrimProps` so the common modal is one line; the five primitives
 * stay exported for the rare bespoke overlay.
 *
 * A node can opt OUT of the background-inert this applies (OVL-006) by carrying
 * `data-tk-keep-live` (e.g. a consumer toast/banner that must stay reachable over
 * the modal); `data-tk-scrim` and `data-tk-live` are exempt automatically.
 */
export function useModalOverlay({
  mounted,
  active,
  ref,
  onClose,
  onConfirm,
  role = "dialog",
  labelledBy,
  describedBy,
  scrollLock = true,
  swipeGuard = true,
  inertBackground = true,
  nativeButtons = "suppress",
}: TKModalOverlayOptions): TKModalOverlayResult {
  const layer = useOverlayLayer(mounted);
  useScrollLock(scrollLock ? mounted : false);
  useVerticalSwipeGuard(swipeGuard ? mounted : false);
  useOverlayA11y(active, ref, onClose, onConfirm, inertBackground);
  useBackIntercept(active && !!onClose, () => onClose?.());
  useSuppressNativeButtons(mounted && nativeButtons !== "keep");
  return {
    scrimZ: layer.scrimZ,
    panelZ: layer.panelZ,
    panelProps: {
      role,
      "aria-modal": true,
      "aria-labelledby": labelledBy,
      "aria-describedby": describedBy,
      tabIndex: -1,
      style: { zIndex: layer.panelZ },
    },
    scrimProps: { "data-tk-scrim": "", style: { zIndex: layer.scrimZ } },
  };
}

export function Scrim({ closing, onClick, z, fixed }: { closing: boolean; onClick?: () => void; z?: number; fixed?: boolean }) {
  return (
    // Decorative backdrop click-catcher: tap-to-dismiss is a redundant pointer
    // affordance — keyboard users close the overlay with Escape (handled by
    // useOverlayA11y above), so the scrim is presentational and hidden from AT.
    <div
      role="presentation"
      aria-hidden="true"
      onClick={onClick}
      data-tk-scrim
      style={{
        position: fixed ? "fixed" : "absolute",
        inset: 0,
        background: "var(--tk-scrim)",
        zIndex: z ?? tkZ.overlay,
        animation: `${closing ? "tk-fade-out" : "tk-fade-in"} var(--tk-t2) var(--tk-ease) both`,
      }}
    />
  );
}

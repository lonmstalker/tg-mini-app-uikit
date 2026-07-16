import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  TelegramClipboardError,
  TelegramContactStatus,
  TelegramFullscreenError,
  TelegramInvoiceStatus,
  TelegramPermissionStatus,
  TelegramQrPopupParams,
  TelegramQrScannerError,
  TelegramShareError,
  TKTelegramAsyncState,
} from "./types";
import { useTelegramEvent, useWebApp } from "./provider";
import { createStorageApi, type TKCloudStorage } from "./storage";
import { TK_MIN_VERSION, tkSupports } from "./version";

/* ---------------- Expanded WebApp capabilities ---------------- */

// Schemes the kit will hand to a native opener / window.open / location.href.
// Everything else (javascript:, data:, vbscript:, file:, …) is rejected so a
// server- or user-derived URL can't become a DOM-XSS / redirect vector (FND-007).
const TK_SAFE_LINK_SCHEMES = new Set(["http:", "https:", "tg:", "mailto:", "tel:"]);

/** True when `url` parses to an allowlisted scheme. Trusts only absolute URLs. */
export function tkIsAllowedLinkUrl(url: string): boolean {
  if (typeof url !== "string" || url.trim() === "") return false;
  try {
    const base = typeof window !== "undefined" ? window.location?.href : undefined;
    return TK_SAFE_LINK_SCHEMES.has(new URL(url, base).protocol.toLowerCase());
  } catch {
    return false;
  }
}

/**
 * Stricter check for `openTelegramLink`, whose no-WebApp fallback does a same-tab
 * `location.href` navigation: only `tg:` deep links or absolute `t.me` URLs are
 * allowed, so an arbitrary `https://evil.com` (or a relative path riding the
 * current origin) can't navigate the whole app away (FND-007 review).
 */
export function tkIsTelegramDeepLink(url: string): boolean {
  if (typeof url !== "string" || url.trim() === "") return false;
  try {
    const u = new URL(url); // no base → a relative path throws → rejected
    if (u.protocol.toLowerCase() === "tg:") return true;
    if (u.protocol === "https:" || u.protocol === "http:") {
      const host = u.hostname.toLowerCase();
      return host === "t.me" || host === "telegram.me" || host === "telegram.dog";
    }
    return false;
  } catch {
    return false;
  }
}

/** Dev-only breadcrumb so a blocked link isn't silently swallowed (FND-007 review). */
function tkWarnBlockedLink(method: string, url: string): void {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.warn(`${method}: blocked a URL with a disallowed scheme: ${url}`);
  }
}

export interface TKTelegramEnvironment {
  /** True when a Telegram WebApp (real client or injected mock) is present. */
  inside: boolean;
  /** `'webapp'` when a WebApp is available, `'browser'` otherwise. */
  reason: "webapp" | "browser";
}

/**
 * One obvious "am I really inside Telegram?" primitive (FND-DX-005). Hooks like
 * `useViewport`/`useActivity` return confident fallbacks (isExpanded:true,
 * isActive:true) outside Telegram — branch on this instead of trusting those.
 */
export function useTelegramEnvironment(): TKTelegramEnvironment {
  const wa = useWebApp();
  return useMemo<TKTelegramEnvironment>(
    () => (wa ? { inside: true, reason: "webapp" } : { inside: false, reason: "browser" }),
    [wa],
  );
}

export interface TKActivity {
  isActive: boolean;
  isSupported: boolean;
}

export function useActivity(): TKActivity {
  const wa = useWebApp();
  // Read `isActive` lazily once; afterwards trust the activated/deactivated
  // events. Re-reading `wa.isActive` on every ref change would clobber the
  // accumulated state with a value Telegram only seeds at launch.
  const [isActive, setIsActive] = useState(() => wa?.isActive ?? true);
  useTelegramEvent("activated", () => setIsActive(true));
  useTelegramEvent("deactivated", () => setIsActive(false));
  // Activity tracking is a Bot API 8.0 feature; old clients never emit the
  // events, so gate on version (with the field as a secondary signal).
  const isSupported = tkSupports(wa, TK_MIN_VERSION.activity) || wa?.isActive != null;
  return { isActive, isSupported };
}

export interface TKFullscreen {
  isFullscreen: boolean;
  lastError: TelegramFullscreenError | undefined;
  request: () => boolean;
  exit: () => boolean;
  isSupported: boolean;
}

export function useFullscreen(): TKFullscreen {
  const wa = useWebApp();
  const [isFullscreen, setIsFullscreen] = useState(wa?.isFullscreen ?? false);
  const [lastError, setLastError] = useState<TelegramFullscreenError | undefined>();
  const read = useCallback(() => setIsFullscreen(wa?.isFullscreen ?? false), [wa]);
  useEffect(() => read(), [read]);
  useTelegramEvent("fullscreenChanged", read);
  useTelegramEvent("fullscreenFailed", (payload) => setLastError(payload?.error));
  const isSupported = !!wa?.requestFullscreen && tkSupports(wa, TK_MIN_VERSION.fullscreen);
  return useMemo(
    () => ({
      isFullscreen,
      lastError,
      request: () => {
        if (!isSupported || !wa?.requestFullscreen) return false;
        setLastError(undefined);
        try {
          wa.requestFullscreen();
          return true;
        } catch {
          setLastError("UNSUPPORTED");
          return false;
        }
      },
      exit: () => {
        if (!isSupported || !wa?.exitFullscreen) return false;
        try {
          wa.exitFullscreen();
          return true;
        } catch {
          setLastError("UNSUPPORTED");
          return false;
        }
      },
      isSupported,
    }),
    [isFullscreen, isSupported, lastError, wa],
  );
}

export interface TKTelegramLinks {
  openLink: (url: string, options?: { tryInstantView?: boolean }) => boolean;
  openTelegramLink: (url: string) => boolean;
  isSupported: boolean;
}

export function useTelegramLinks(): TKTelegramLinks {
  const wa = useWebApp();
  return useMemo(
    () => ({
      openLink: (url, options) => {
        if (!tkIsAllowedLinkUrl(url)) {
          tkWarnBlockedLink("openLink", url); // FND-007
          return false;
        }
        if (wa?.openLink) {
          wa.openLink(url, options?.tryInstantView ? { try_instant_view: true } : undefined);
          return true;
        }
        if (typeof window === "undefined") return false;
        window.open(url, "_blank", "noopener,noreferrer");
        return true;
      },
      openTelegramLink: (url) => {
        if (!tkIsTelegramDeepLink(url)) {
          tkWarnBlockedLink("openTelegramLink", url); // FND-007: tg:/t.me only
          return false;
        }
        if (wa?.openTelegramLink) {
          wa.openTelegramLink(url);
          return true;
        }
        if (typeof window === "undefined") return false;
        window.location.href = url;
        return true;
      },
      isSupported: !!(wa?.openLink || wa?.openTelegramLink),
    }),
    [wa],
  );
}

export interface TKTelegramColors {
  /** Current values of `WebApp.headerColor` / `backgroundColor` / `bottomBarColor`. */
  headerColor?: string;
  backgroundColor?: string;
  bottomBarColor?: string;
  setHeaderColor: (color: string) => boolean;
  setBackgroundColor: (color: string) => boolean;
  setBottomBarColor: (color: string) => boolean;
  isSupported: boolean;
}

export function useTelegramColors(): TKTelegramColors {
  const wa = useWebApp();
  const read = useCallback(
    () => ({
      headerColor: wa?.headerColor,
      backgroundColor: wa?.backgroundColor,
      bottomBarColor: wa?.bottomBarColor,
    }),
    [wa],
  );
  const [colors, setColors] = useState(read);
  useEffect(() => setColors(read()), [read]);
  // Keyword colors ("bg_color", …) follow the theme, so re-read on theme flips.
  useTelegramEvent("themeChanged", () => setColors(read()));
  const canHeader = !!wa?.setHeaderColor && tkSupports(wa, TK_MIN_VERSION.setHeaderColor);
  const canBackground = !!wa?.setBackgroundColor && tkSupports(wa, TK_MIN_VERSION.setBackgroundColor);
  const canBottomBar = !!wa?.setBottomBarColor && tkSupports(wa, TK_MIN_VERSION.setBottomBarColor);
  return useMemo(
    () => ({
      ...colors,
      setHeaderColor: (color) => {
        if (!canHeader || !wa?.setHeaderColor) return false;
        try {
          wa.setHeaderColor(color);
          setColors(read());
          return true;
        } catch {
          return false;
        }
      },
      setBackgroundColor: (color) => {
        if (!canBackground || !wa?.setBackgroundColor) return false;
        try {
          wa.setBackgroundColor(color);
          setColors(read());
          return true;
        } catch {
          return false;
        }
      },
      setBottomBarColor: (color) => {
        if (!canBottomBar || !wa?.setBottomBarColor) return false;
        try {
          wa.setBottomBarColor(color);
          setColors(read());
          return true;
        } catch {
          return false;
        }
      },
      isSupported: canHeader || canBackground || canBottomBar,
    }),
    [canBackground, canBottomBar, canHeader, colors, read, wa],
  );
}

export interface TKInvoice {
  open: (url: string) => Promise<TelegramInvoiceStatus>;
  isSupported: boolean;
}

export function useInvoice(): TKInvoice {
  const wa = useWebApp();
  return useMemo(
    () => ({
      open: (url) =>
        new Promise<TelegramInvoiceStatus>((resolve) => {
          if (!tkIsAllowedLinkUrl(url)) {
            resolve("failed"); // FND-007: never forward an unvalidated invoice URL
            return;
          }
          if (!wa?.openInvoice) {
            resolve("unsupported");
            return;
          }
          wa.openInvoice(url, (status) => resolve(status));
        }),
      isSupported: !!wa?.openInvoice,
    }),
    [wa],
  );
}

export interface TKShare extends TKTelegramAsyncState<TelegramShareError> {
  shareMessage: (messageId: string) => Promise<boolean>;
  shareToStory: (mediaUrl: string, params?: { text?: string; widgetLink?: { url: string; name?: string } }) => Promise<boolean>;
  isSupported: boolean;
}

export function useShare(): TKShare {
  const wa = useWebApp();
  const [state, setState] = useState<TKTelegramAsyncState<TelegramShareError>>({ status: "idle" });
  const canShareMessage = !!wa?.shareMessage && tkSupports(wa, TK_MIN_VERSION.shareMessage);
  const canShareToStory = !!wa?.shareToStory && tkSupports(wa, TK_MIN_VERSION.shareToStory);
  const isSupported =
    canShareMessage || canShareToStory || (typeof navigator !== "undefined" && "share" in navigator);
  // `shareToStory` is fire-and-forget (no callback) and most clients emit no
  // story-result event, so the promise can't wait on an event alone or it hangs
  // forever (FND-001). A bounded timeout settles it optimistically, and an
  // unmount settles any still-pending promise instead of leaking the resolver.
  const pendingStory = useRef<((ok: boolean) => void) | null>(null);
  const storyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Guards against a late shareMessage* event re-settling an already-resolved
  // story share (e.g. the optimistic timeout fired, then a delayed `failed`
  // arrives) and flipping a reported success to error (FND-001 review).
  const storyActive = useRef(false);
  const settleStory = useCallback((ok: boolean, error?: TelegramShareError) => {
    if (!storyActive.current) return; // already settled — ignore late events
    storyActive.current = false;
    if (storyTimer.current != null) {
      clearTimeout(storyTimer.current);
      storyTimer.current = null;
    }
    setState(ok ? { status: "success" } : { status: "error", error: error ?? "MESSAGE_SEND_FAILED" });
    pendingStory.current?.(ok);
    pendingStory.current = null;
  }, []);
  useTelegramEvent("shareMessageSent", () => settleStory(true));
  useTelegramEvent("shareMessageFailed", (payload) => settleStory(false, payload?.error));
  useEffect(
    () => () => {
      if (storyTimer.current != null) clearTimeout(storyTimer.current);
      // settle (not leak) any await that's still hanging when we unmount
      storyActive.current = false;
      pendingStory.current?.(false);
      pendingStory.current = null;
    },
    [],
  );
  return useMemo(
    () => ({
      shareMessage: (messageId) => {
        setState({ status: "pending" });
        return new Promise<boolean>((resolve) => {
          if (!canShareMessage || !wa?.shareMessage) {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
            return;
          }
          try {
            wa.shareMessage(messageId, (ok) => {
              setState(ok ? { status: "success" } : { status: "error", error: "MESSAGE_SEND_FAILED" });
              resolve(!!ok);
            });
          } catch {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
          }
        });
      },
      shareToStory: async (mediaUrl, params) => {
        setState({ status: "pending" });
        if (canShareToStory && wa?.shareToStory) {
          storyActive.current = true; // arm settle guard before the call can settle
          try {
            wa.shareToStory(
              mediaUrl,
              params?.widgetLink ? { text: params.text, widget_link: params.widgetLink } : { text: params?.text },
            );
          } catch {
            settleStory(false, "UNSUPPORTED");
            return false;
          }
          // The shareMessageSent/shareMessageFailed events settle this if the
          // client emits them; otherwise the timeout resolves optimistically so
          // the await never hangs (FND-001).
          return new Promise<boolean>((resolve) => {
            pendingStory.current = resolve;
            storyTimer.current = setTimeout(() => settleStory(true), 1500);
          });
        }
        if (typeof navigator !== "undefined" && "share" in navigator) {
          try {
            await navigator.share({ url: mediaUrl, text: params?.text });
            setState({ status: "success" });
            return true;
          } catch (error) {
            setState({ status: "error", error: error instanceof Error ? error.name : "USER_DECLINED" });
            return false;
          }
        }
        setState({ status: "error", error: "UNSUPPORTED" });
        return false;
      },
      status: isSupported ? state.status : "unsupported",
      error: isSupported ? state.error : "UNSUPPORTED",
      isSupported,
    }),
    [canShareMessage, canShareToStory, isSupported, settleStory, state.error, state.status, wa],
  );
}

export interface TKDataTransport {
  sendData: (data: string) => boolean;
  switchInlineQuery: (query: string, chatTypes?: string[]) => boolean;
  isSupported: boolean;
}

export function useDataTransport(): TKDataTransport {
  const wa = useWebApp();
  return useMemo(
    () => ({
      sendData: (data) => {
        if (!wa?.sendData) return false;
        try {
          wa.sendData(data);
          return true;
        } catch {
          // the official bridge throws on >4096 bytes and outside keyboard-button launches
          return false;
        }
      },
      switchInlineQuery: (query, chatTypes) => {
        if (!wa?.switchInlineQuery || !tkSupports(wa, TK_MIN_VERSION.switchInlineQuery)) return false;
        try {
          wa.switchInlineQuery(query, chatTypes);
          return true;
        } catch {
          // Real clients throw WebAppInlineModeDisabled when the bot has no
          // inline mode — that is NOT feature-detectable upfront, so the only
          // honest signal is this false. Callers must surface it to the user.
          return false;
        }
      },
      isSupported: !!(wa?.sendData || wa?.switchInlineQuery),
    }),
    [wa],
  );
}

export function useContactRequest(): {
  request: () => Promise<boolean>;
  isSupported: boolean;
} & TKTelegramAsyncState<TelegramContactStatus | "UNSUPPORTED"> {
  const wa = useWebApp();
  const [state, setState] = useState<TKTelegramAsyncState<TelegramContactStatus | "UNSUPPORTED">>({ status: "idle" });
  // Method presence is not enough: the official bridge defines requestContact
  // on every client and THROWS below 6.9 — gate by version so old clients see
  // an honest `unsupported` instead of a dead tap.
  const isSupported = !!wa?.requestContact && tkSupports(wa, TK_MIN_VERSION.requestContact);
  return useMemo(
    () => ({
      request: () => {
        setState({ status: "pending" });
        return new Promise<boolean>((resolve) => {
          if (!isSupported || !wa?.requestContact) {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
            return;
          }
          try {
            wa.requestContact((shared) => {
              setState(shared ? { status: "success" } : { status: "error", error: "cancelled" });
              resolve(!!shared);
            });
          } catch {
            // e.g. WebAppContactRequested — a request is already open
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
          }
        });
      },
      status: isSupported ? state.status : "unsupported",
      error: isSupported ? state.error : "UNSUPPORTED",
      isSupported,
    }),
    [isSupported, state.error, state.status, wa],
  );
}

export function useWriteAccess(): {
  request: () => Promise<boolean>;
  isSupported: boolean;
} & TKTelegramAsyncState<TelegramPermissionStatus | "UNSUPPORTED"> {
  const wa = useWebApp();
  const [state, setState] = useState<TKTelegramAsyncState<TelegramPermissionStatus | "UNSUPPORTED">>({ status: "idle" });
  // Same trap as requestContact: the bridge defines the method everywhere and
  // throws below 6.9 — version-gate instead of trusting presence.
  const isSupported = !!wa?.requestWriteAccess && tkSupports(wa, TK_MIN_VERSION.writeAccess);
  return useMemo(
    () => ({
      request: () => {
        setState({ status: "pending" });
        return new Promise<boolean>((resolve) => {
          if (!isSupported || !wa?.requestWriteAccess) {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
            return;
          }
          try {
            wa.requestWriteAccess((allowed) => {
              setState(allowed ? { status: "success" } : { status: "error", error: "cancelled" });
              resolve(!!allowed);
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
    }),
    [isSupported, state.error, state.status, wa],
  );
}

export interface TKClipboard extends TKTelegramAsyncState<TelegramClipboardError> {
  readText: () => Promise<string | null>;
  isSupported: boolean;
}

export function useClipboard(): TKClipboard {
  const wa = useWebApp();
  const [state, setState] = useState<TKTelegramAsyncState<TelegramClipboardError>>({ status: "idle" });
  const isSupported = !!wa?.readTextFromClipboard || (typeof navigator !== "undefined" && !!navigator.clipboard?.readText);
  return useMemo(
    () => ({
      readText: () => {
        setState({ status: "pending" });
        return new Promise<string | null>((resolve) => {
          if (wa?.readTextFromClipboard) {
            wa.readTextFromClipboard((text) => {
              setState({ status: "success" });
              resolve(text ?? null);
            });
            return;
          }
          if (typeof navigator !== "undefined" && navigator.clipboard?.readText) {
            navigator.clipboard.readText()
              .then((text) => {
                setState({ status: "success" });
                resolve(text);
              })
              .catch(() => {
                setState({ status: "error", error: "READ_FAILED" });
                resolve(null);
              });
            return;
          }
          setState({ status: "error", error: "UNSUPPORTED" });
          resolve(null);
        });
      },
      status: isSupported ? state.status : "unsupported",
      error: isSupported ? state.error : "UNSUPPORTED",
      isSupported,
    }),
    [isSupported, state.error, state.status, wa],
  );
}

export interface TKQrScanner extends TKTelegramAsyncState<TelegramQrScannerError> {
  open: (params?: TelegramQrPopupParams, onText?: (data: string) => boolean | void) => Promise<string | null>;
  close: () => boolean;
  isSupported: boolean;
}

export function useQrScanner(): TKQrScanner {
  const wa = useWebApp();
  const [state, setState] = useState<TKTelegramAsyncState<TelegramQrScannerError>>({ status: "idle" });
  const isSupported = !!wa?.showScanQrPopup && tkSupports(wa, TK_MIN_VERSION.scanQrPopup);
  // The promise resolves when the popup closes (scanQrPopupClosed), not on the
  // first scan — so `onText` can keep accepting scans (return falsy to stay
  // open) while `open` still yields the last value once the user is done.
  const pendingScan = useRef<((data: string | null) => void) | null>(null);
  const lastScan = useRef<string | null>(null);
  const settleScan = useCallback(() => {
    setState((prev) => (prev.status === "pending" ? { status: "success" } : prev));
    pendingScan.current?.(lastScan.current);
    pendingScan.current = null;
    lastScan.current = null;
  }, []);
  useTelegramEvent("scanQrPopupClosed", settleScan);
  useEffect(() => {
    return () => {
      wa?.closeScanQrPopup?.();
    };
  }, [wa]);
  return useMemo(
    () => ({
      open: (params = {}, onText) => {
        setState({ status: "pending" });
        return new Promise<string | null>((resolve) => {
          if (!isSupported || !wa?.showScanQrPopup) {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(null);
            return;
          }
          lastScan.current = null;
          pendingScan.current = resolve;
          try {
            wa.showScanQrPopup(params, (data) => {
              lastScan.current = data;
              // Default to keeping the popup open (return false); only the
              // caller's onText can request a close by returning true.
              return onText?.(data) ?? false;
            });
          } catch {
            setState({ status: "error", error: "UNSUPPORTED" });
            pendingScan.current = null;
            resolve(null);
          }
        });
      },
      close: () => {
        if (!wa?.closeScanQrPopup) {
          setState({ status: "error", error: "UNSUPPORTED" });
          return false;
        }
        wa.closeScanQrPopup();
        setState({ status: "idle" });
        return true;
      },
      status: isSupported ? state.status : "unsupported",
      error: isSupported ? state.error : "UNSUPPORTED",
      isSupported,
    }),
    [isSupported, state.error, state.status, wa],
  );
}

export function useDeviceStorage(): TKCloudStorage {
  const wa = useWebApp();
  return useMemo(() => createStorageApi(wa?.DeviceStorage, "tk-device:"), [wa]);
}

export function useSecureStorage(): TKCloudStorage {
  const wa = useWebApp();
  return useMemo(() => createStorageApi(wa?.SecureStorage, "tk-secure:"), [wa]);
}

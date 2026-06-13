import { useCallback, useEffect, useMemo, useState } from "react";
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

/* ---------------- Expanded WebApp capabilities ---------------- */

export interface TKActivity {
  isActive: boolean;
  isSupported: boolean;
}

export function useActivity(): TKActivity {
  const wa = useWebApp();
  const [isActive, setIsActive] = useState(wa?.isActive ?? true);
  useEffect(() => setIsActive(wa?.isActive ?? true), [wa]);
  useTelegramEvent("activated", () => setIsActive(true));
  useTelegramEvent("deactivated", () => setIsActive(false));
  return { isActive, isSupported: wa?.isActive != null };
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
  return useMemo(
    () => ({
      isFullscreen,
      lastError,
      request: () => {
        if (!wa?.requestFullscreen) return false;
        setLastError(undefined);
        wa.requestFullscreen();
        return true;
      },
      exit: () => {
        if (!wa?.exitFullscreen) return false;
        wa.exitFullscreen();
        return true;
      },
      isSupported: !!wa?.requestFullscreen,
    }),
    [isFullscreen, lastError, wa],
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
        if (wa?.openLink) {
          wa.openLink(url, options?.tryInstantView ? { try_instant_view: true } : undefined);
          return true;
        }
        if (typeof window === "undefined") return false;
        window.open(url, "_blank", "noopener,noreferrer");
        return true;
      },
      openTelegramLink: (url) => {
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
  return useMemo(
    () => ({
      ...colors,
      setHeaderColor: (color) => {
        if (!wa?.setHeaderColor) return false;
        wa.setHeaderColor(color);
        setColors(read());
        return true;
      },
      setBackgroundColor: (color) => {
        if (!wa?.setBackgroundColor) return false;
        wa.setBackgroundColor(color);
        setColors(read());
        return true;
      },
      setBottomBarColor: (color) => {
        if (!wa?.setBottomBarColor) return false;
        wa.setBottomBarColor(color);
        setColors(read());
        return true;
      },
      isSupported: !!(wa?.setHeaderColor || wa?.setBackgroundColor || wa?.setBottomBarColor),
    }),
    [colors, read, wa],
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
  const isSupported =
    !!(wa?.shareMessage || wa?.shareToStory) || (typeof navigator !== "undefined" && "share" in navigator);
  return useMemo(
    () => ({
      shareMessage: (messageId) => {
        setState({ status: "pending" });
        return new Promise<boolean>((resolve) => {
          if (!wa?.shareMessage) {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
            return;
          }
          wa.shareMessage(messageId, (ok) => {
            setState(ok ? { status: "success" } : { status: "error", error: "MESSAGE_SEND_FAILED" });
            resolve(!!ok);
          });
        });
      },
      shareToStory: async (mediaUrl, params) => {
        setState({ status: "pending" });
        if (wa?.shareToStory) {
          wa.shareToStory(mediaUrl, params?.widgetLink ? { text: params.text, widget_link: params.widgetLink } : { text: params?.text });
          setState({ status: "success" });
          return true;
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
    [isSupported, state.error, state.status, wa],
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
        wa.sendData(data);
        return true;
      },
      switchInlineQuery: (query, chatTypes) => {
        if (!wa?.switchInlineQuery) return false;
        wa.switchInlineQuery(query, chatTypes);
        return true;
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
  const isSupported = !!wa?.requestContact;
  return useMemo(
    () => ({
      request: () => {
        setState({ status: "pending" });
        return new Promise<boolean>((resolve) => {
          if (!wa?.requestContact) {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
            return;
          }
          wa.requestContact((shared) => {
            setState(shared ? { status: "success" } : { status: "error", error: "cancelled" });
            resolve(!!shared);
          });
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
  const isSupported = !!wa?.requestWriteAccess;
  return useMemo(
    () => ({
      request: () => {
        setState({ status: "pending" });
        return new Promise<boolean>((resolve) => {
          if (!wa?.requestWriteAccess) {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
            return;
          }
          wa.requestWriteAccess((allowed) => {
            setState(allowed ? { status: "success" } : { status: "error", error: "cancelled" });
            resolve(!!allowed);
          });
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
  const isSupported = !!wa?.showScanQrPopup;
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
          if (!wa?.showScanQrPopup) {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(null);
            return;
          }
          wa.showScanQrPopup(params, (data) => {
            const shouldClose = onText?.(data);
            setState({ status: "success" });
            resolve(data);
            return shouldClose;
          });
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

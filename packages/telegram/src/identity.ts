import { useMemo, useState } from "react";
import type { TelegramDownloadError, TelegramEmojiStatusError, TelegramGenericHookError, TelegramHomeScreenStatus, TKTelegramAsyncState } from "./types";
import { useTelegramEvent, useWebApp } from "./provider";
import { TK_MIN_VERSION, tkSupports } from "./version";

export interface TKHomeScreen {
  add: () => boolean;
  check: () => Promise<TelegramHomeScreenStatus>;
  status: TelegramHomeScreenStatus | undefined;
  isSupported: boolean;
}

export function useHomeScreen(): TKHomeScreen {
  const wa = useWebApp();
  const [status, setStatus] = useState<TelegramHomeScreenStatus | undefined>();
  useTelegramEvent("homeScreenChecked", (payload) => setStatus(payload?.status));
  useTelegramEvent("homeScreenAdded", () => setStatus("added"));
  const isSupported = !!(wa?.addToHomeScreen || wa?.checkHomeScreenStatus) && tkSupports(wa, TK_MIN_VERSION.homeScreen);
  return useMemo(
    () => ({
      add: () => {
        if (!isSupported || !wa?.addToHomeScreen) return false;
        try {
          wa.addToHomeScreen();
          return true;
        } catch {
          return false;
        }
      },
      check: () =>
        new Promise<TelegramHomeScreenStatus>((resolve) => {
          if (!isSupported || !wa?.checkHomeScreenStatus) {
            resolve("unsupported");
            return;
          }
          try {
            wa.checkHomeScreenStatus((next) => {
              setStatus(next);
              resolve(next);
            });
          } catch {
            resolve("unsupported");
          }
        }),
      status,
      isSupported,
    }),
    [isSupported, status, wa],
  );
}

export interface TKEmojiStatus extends TKTelegramAsyncState<TelegramEmojiStatusError> {
  set: (customEmojiId: string, params?: { duration?: number }) => Promise<boolean>;
  requestAccess: () => Promise<boolean>;
  isSupported: boolean;
}

export function useEmojiStatus(): TKEmojiStatus {
  const wa = useWebApp();
  const [state, setState] = useState<TKTelegramAsyncState<TelegramEmojiStatusError>>({ status: "idle" });
  const isSupported =
    !!(wa?.setEmojiStatus || wa?.requestEmojiStatusAccess) && tkSupports(wa, TK_MIN_VERSION.setEmojiStatus);
  return useMemo(
    () => ({
      set: (customEmojiId, params) => {
        setState({ status: "pending" });
        return new Promise<boolean>((resolve) => {
          if (!isSupported || !wa?.setEmojiStatus) {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
            return;
          }
          try {
            wa.setEmojiStatus(customEmojiId, params, (ok) => {
              setState(ok ? { status: "success" } : { status: "error", error: "UNKNOWN_ERROR" });
              resolve(!!ok);
            });
          } catch {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
          }
        });
      },
      requestAccess: () => {
        setState({ status: "pending" });
        return new Promise<boolean>((resolve) => {
          if (!isSupported || !wa?.requestEmojiStatusAccess) {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
            return;
          }
          try {
            wa.requestEmojiStatusAccess((allowed) => {
              setState(allowed ? { status: "success" } : { status: "error", error: "USER_DECLINED" });
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

export function useDownloadFile(): {
  download: (params: { url: string; fileName?: string }) => Promise<boolean>;
  isSupported: boolean;
} & TKTelegramAsyncState<TelegramDownloadError> {
  const wa = useWebApp();
  const [state, setState] = useState<TKTelegramAsyncState<TelegramDownloadError>>({ status: "idle" });
  const canNative = !!wa?.downloadFile && tkSupports(wa, TK_MIN_VERSION.downloadFile);
  const isSupported = canNative;
  return useMemo(
    () => ({
      download: (params) => {
        setState({ status: "pending" });
        return new Promise<boolean>((resolve) => {
          if (canNative && wa?.downloadFile) {
            try {
              wa.downloadFile({ url: params.url, file_name: params.fileName }, (ok) => {
                setState(ok ? { status: "success" } : { status: "error", error: "DOWNLOAD_FAILED" });
                resolve(!!ok);
              });
              return;
            } catch {
              /* unsupported on this client version — fall through to DOM */
            }
          }
          if (typeof document === "undefined") {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
            return;
          }
          const a = document.createElement("a");
          a.href = params.url;
          if (params.fileName) a.download = params.fileName;
          a.rel = "noopener noreferrer";
          a.click();
          setState({ status: "success" });
          resolve(true);
        });
      },
      status: isSupported ? state.status : "unsupported",
      error: isSupported ? state.error : "UNSUPPORTED",
      isSupported,
    }),
    [isSupported, state.error, state.status, wa],
  );
}

/**
 * `WebApp.requestChat` (Bot API 9.6+). CAUTION: the official bridge script
 * ships AHEAD of the clients — a client that reports 9.6 but has not
 * implemented `web_app_request_chat` silently drops the event, the
 * `requested_chat_sent/failed` answer never arrives and the returned promise
 * NEVER settles. Until the event is broadly implemented, prefer the
 * `https://t.me/share/url` deep link (openTelegramLink) for share-into-a-chat
 * flows; treat this hook as opt-in for clients you have verified.
 */
export function useChatRequest(): {
  request: (reqId: string) => Promise<boolean>;
  isSupported: boolean;
} & TKTelegramAsyncState<TelegramGenericHookError> {
  const wa = useWebApp();
  const [state, setState] = useState<TKTelegramAsyncState<TelegramGenericHookError>>({ status: "idle" });
  // requestChat is Bot API 9.6+: the official bridge defines the method on
  // every client and THROWS WebAppMethodUnsupported below that — mere method
  // presence produced a visible control that silently exploded on tap.
  const isSupported = !!wa?.requestChat && tkSupports(wa, TK_MIN_VERSION.requestChat);
  return useMemo(
    () => ({
      request: (reqId) => {
        setState({ status: "pending" });
        return new Promise<boolean>((resolve) => {
          if (!isSupported || !wa?.requestChat) {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
            return;
          }
          try {
            wa.requestChat(reqId, (ok) => {
              setState(ok ? { status: "success" } : { status: "error", error: "USER_DECLINED" });
              resolve(!!ok);
            });
          } catch {
            // WebAppRequestChatOpened — a picker is already open
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

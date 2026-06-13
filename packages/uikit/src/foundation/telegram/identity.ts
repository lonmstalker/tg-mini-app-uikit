import { useMemo, useState } from "react";
import type { TelegramDownloadError, TelegramEmojiStatusError, TelegramGenericHookError, TelegramHomeScreenStatus, TKTelegramAsyncState } from "./types";
import { useTelegramEvent, useWebApp } from "./provider";

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
  return useMemo(
    () => ({
      add: () => {
        if (!wa?.addToHomeScreen) return false;
        wa.addToHomeScreen();
        return true;
      },
      check: () =>
        new Promise<TelegramHomeScreenStatus>((resolve) => {
          if (!wa?.checkHomeScreenStatus) {
            resolve("unsupported");
            return;
          }
          wa.checkHomeScreenStatus((next) => {
            setStatus(next);
            resolve(next);
          });
        }),
      status,
      isSupported: !!(wa?.addToHomeScreen || wa?.checkHomeScreenStatus),
    }),
    [status, wa],
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
  const isSupported = !!(wa?.setEmojiStatus || wa?.requestEmojiStatusAccess);
  return useMemo(
    () => ({
      set: (customEmojiId, params) => {
        setState({ status: "pending" });
        return new Promise<boolean>((resolve) => {
          if (!wa?.setEmojiStatus) {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
            return;
          }
          wa.setEmojiStatus(customEmojiId, params, (ok) => {
            setState(ok ? { status: "success" } : { status: "error", error: "UNKNOWN_ERROR" });
            resolve(!!ok);
          });
        });
      },
      requestAccess: () => {
        setState({ status: "pending" });
        return new Promise<boolean>((resolve) => {
          if (!wa?.requestEmojiStatusAccess) {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
            return;
          }
          wa.requestEmojiStatusAccess((allowed) => {
            setState(allowed ? { status: "success" } : { status: "error", error: "USER_DECLINED" });
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

export function useDownloadFile(): {
  download: (params: { url: string; fileName?: string }) => Promise<boolean>;
  isSupported: boolean;
} & TKTelegramAsyncState<TelegramDownloadError> {
  const wa = useWebApp();
  const [state, setState] = useState<TKTelegramAsyncState<TelegramDownloadError>>({ status: "idle" });
  const isSupported = !!wa?.downloadFile;
  return useMemo(
    () => ({
      download: (params) => {
        setState({ status: "pending" });
        return new Promise<boolean>((resolve) => {
          if (wa?.downloadFile) {
            wa.downloadFile({ url: params.url, file_name: params.fileName }, (ok) => {
              setState(ok ? { status: "success" } : { status: "error", error: "DOWNLOAD_FAILED" });
              resolve(!!ok);
            });
            return;
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

export function useChatRequest(): {
  request: (reqId: string) => Promise<boolean>;
  isSupported: boolean;
} & TKTelegramAsyncState<TelegramGenericHookError> {
  const wa = useWebApp();
  const [state, setState] = useState<TKTelegramAsyncState<TelegramGenericHookError>>({ status: "idle" });
  const isSupported = !!wa?.requestChat;
  return useMemo(
    () => ({
      request: (reqId) => {
        setState({ status: "pending" });
        return new Promise<boolean>((resolve) => {
          if (!wa?.requestChat) {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
            return;
          }
          wa.requestChat(reqId, (ok) => {
            setState(ok ? { status: "success" } : { status: "error", error: "USER_DECLINED" });
            resolve(!!ok);
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

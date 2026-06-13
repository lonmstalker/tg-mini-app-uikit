import { useEffect, useMemo, useRef } from "react";
import type {
  TelegramMainButton,
  TelegramPopupParams,
  TelegramSimpleButton,
  TKImpactStyle,
  TKNotificationType,
} from "./types";
import { useWebApp } from "./provider";


function useSimpleButton(
  button: TelegramSimpleButton | undefined,
  onClick: (() => void) | undefined,
  visible: boolean,
): { isSupported: boolean } {
  const ref = useRef(onClick);
  ref.current = onClick;
  useEffect(() => {
    if (!button?.onClick) return;
    const h = () => ref.current?.();
    button.onClick(h);
    return () => {
      button.offClick?.(h);
    };
  }, [button]);
  useEffect(() => {
    if (!button) return;
    if (visible) button.show?.();
    else button.hide?.();
  }, [button, visible]);
  useEffect(() => {
    if (!button) return;
    return () => {
      button.hide?.();
    };
  }, [button]);
  return { isSupported: !!button };
}

/**
 * Native Telegram Back button. Shown while the component is mounted and
 * `visible` is true; hidden again on unmount.
 */
export function useBackButton(onBack?: () => void, visible: boolean = !!onBack): { isSupported: boolean } {
  return useSimpleButton(useWebApp()?.BackButton, onBack, visible);
}

/** Native Settings button (the ⋯ menu item). Same lifecycle as `useBackButton`. */
export function useSettingsButton(onClick?: () => void, visible: boolean = !!onClick): { isSupported: boolean } {
  return useSimpleButton(useWebApp()?.SettingsButton, onClick, visible);
}

export interface TKNativeButtonParams {
  text?: string;
  visible?: boolean;
  disabled?: boolean;
  /** Show the native progress spinner and disable clicks. */
  loading?: boolean;
  color?: string;
  textColor?: string;
  shine?: boolean;
  position?: "left" | "right" | "top" | "bottom";
  iconCustomEmojiId?: string;
  onClick?: () => void;
}

function useNativeButton(
  button: TelegramMainButton | undefined,
  {
    text,
    visible = true,
    disabled = false,
    loading = false,
    color,
    textColor,
    shine,
    position,
    iconCustomEmojiId,
    onClick,
  }: TKNativeButtonParams,
): { isSupported: boolean } {
  const clickRef = useRef(onClick);
  clickRef.current = onClick;
  useEffect(() => {
    if (!button?.onClick) return;
    const h = () => clickRef.current?.();
    button.onClick(h);
    return () => {
      button.offClick?.(h);
    };
  }, [button]);
  useEffect(() => {
    if (!button) return;
    const active = !disabled && !loading;
    if (button.setParams) {
      const params: Parameters<NonNullable<TelegramMainButton["setParams"]>>[0] = {
        is_visible: visible,
        is_active: active,
      };
      if (text != null) params.text = text;
      if (color != null) params.color = color;
      if (textColor != null) params.text_color = textColor;
      if (shine != null) params.has_shine_effect = shine;
      if (position != null) params.position = position;
      if (iconCustomEmojiId != null) params.icon_custom_emoji_id = iconCustomEmojiId;
      button.setParams(params);
    } else {
      if (text != null) button.setText?.(text);
      if (visible) button.show?.();
      else button.hide?.();
      if (active) button.enable?.();
      else button.disable?.();
    }
    if (loading) button.showProgress?.(false);
    else button.hideProgress?.();
  }, [button, text, visible, disabled, loading, color, textColor, shine, position, iconCustomEmojiId]);
  useEffect(() => {
    if (!button) return;
    return () => {
      button.hideProgress?.();
      button.hide?.();
    };
  }, [button]);
  return { isSupported: !!button };
}

/**
 * Adapter for the native Telegram Main button. Declarative: pass the state
 * on every render and the hook keeps the native button in sync, hiding it
 * on unmount. Use `TKMainButton` as the in-DOM fallback outside Telegram.
 *
 * ```tsx
 * useMainButton({ text: `Pay ${total}`, loading: paying, onClick: pay });
 * ```
 */
export function useMainButton(params: TKNativeButtonParams): { isSupported: boolean } {
  return useNativeButton(useWebApp()?.MainButton, params);
}

/** Adapter for the native Secondary button (Bot API 7.10+). Same contract as `useMainButton`. */
export function useSecondaryButton(params: TKNativeButtonParams): { isSupported: boolean } {
  return useNativeButton(useWebApp()?.SecondaryButton, params);
}

/* ---------------- Haptics ---------------- */

export interface TKHaptics {
  impact: (style?: TKImpactStyle) => void;
  notification: (type: TKNotificationType) => void;
  selection: () => void;
  isSupported: boolean;
}

/** Haptic feedback that no-ops outside Telegram, so it is always safe to call. */
export function useHaptics(): TKHaptics {
  const wa = useWebApp();
  return useMemo(() => {
    const h = wa?.HapticFeedback;
    const safe = (fn?: () => unknown) => {
      try {
        fn?.();
      } catch {
        /* old clients throw on unknown styles — feedback is best-effort */
      }
    };
    return {
      impact: (style: TKImpactStyle = "light") => safe(() => h?.impactOccurred?.(style)),
      notification: (type: TKNotificationType) => safe(() => h?.notificationOccurred?.(type)),
      selection: () => safe(() => h?.selectionChanged?.()),
      isSupported: !!h?.impactOccurred,
    };
  }, [wa]);
}

/* ---------------- Native popups ---------------- */

export interface TKPopup {
  alert: (message: string) => Promise<void>;
  confirm: (message: string) => Promise<boolean>;
  /** Native popup with up to 3 buttons; resolves with the pressed button id. */
  show: (params: TelegramPopupParams) => Promise<string | undefined>;
  isSupported: boolean;
}

/**
 * Promisified native popups with browser fallbacks (`window.alert`/`confirm`),
 * so flows keep working when the app runs outside Telegram.
 */
export function useTelegramPopup(): TKPopup {
  const wa = useWebApp();
  return useMemo(
    () => ({
      alert: (message: string) =>
        new Promise<void>((resolve) => {
          if (wa?.showAlert) {
            try {
              wa.showAlert(message, () => resolve());
              return;
            } catch {
              /* popup already open — fall through */
            }
          }
          if (typeof window !== "undefined") window.alert(message);
          resolve();
        }),
      confirm: (message: string) =>
        new Promise<boolean>((resolve) => {
          if (wa?.showConfirm) {
            try {
              wa.showConfirm(message, (ok) => resolve(!!ok));
              return;
            } catch {
              /* fall through */
            }
          }
          resolve(typeof window !== "undefined" ? window.confirm(message) : false);
        }),
      show: (params: TelegramPopupParams) =>
        new Promise<string | undefined>((resolve) => {
          if (wa?.showPopup) {
            try {
              wa.showPopup(params, (id) => resolve(id));
              return;
            } catch {
              /* fall through */
            }
          }
          const buttons = params.buttons ?? [];
          const okButton = buttons.find((b) => b.type !== "cancel" && b.type !== "close") ?? buttons[0];
          const cancelButton = buttons.find((b) => b.type === "cancel" || b.type === "close");
          const ok =
            typeof window !== "undefined"
              ? window.confirm([params.title, params.message].filter(Boolean).join("\n\n"))
              : false;
          resolve(ok ? okButton?.id : cancelButton?.id);
        }),
      isSupported: !!wa?.showPopup,
    }),
    [wa],
  );
}

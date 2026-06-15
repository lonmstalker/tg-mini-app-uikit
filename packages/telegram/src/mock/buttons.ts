import type { TelegramMainButton, TelegramSimpleButton } from "../types";
import type { MockButtonState, MockTelegramState } from "./types";

interface ButtonFactoryContext {
  log: (text: string) => void;
  getState: () => MockTelegramState;
  commit: (next: Partial<MockTelegramState>, events?: string[]) => void;
}

type Clickable<T> = T & { __clicks: Set<() => void> };

export function makeBigButton(
  key: "main" | "secondary",
  label: string,
  ctx: ButtonFactoryContext,
): Clickable<TelegramMainButton> {
  const clicks = new Set<() => void>();
  const patch = (p: Partial<MockButtonState>, what: string) => {
    ctx.log(`${label}.${what}`);
    ctx.commit({ [key]: { ...ctx.getState()[key], ...p } } as Partial<MockTelegramState>);
  };
  const button: TelegramMainButton = {
    setText: (text) => patch({ text }, `setText("${text}")`),
    show: () => patch({ visible: true }, "show()"),
    hide: () => patch({ visible: false }, "hide()"),
    enable: () => patch({ active: true }, "enable()"),
    disable: () => patch({ active: false }, "disable()"),
    showProgress: () => patch({ progress: true }, "showProgress()"),
    hideProgress: () => patch({ progress: false }, "hideProgress()"),
    setParams: (params) => {
      const shine = params.has_shine_effect ?? params.hasShineEffect;
      const icon = params.icon_custom_emoji_id ?? params.iconCustomEmojiId;
      patch(
        {
          ...(params.text != null ? { text: params.text } : {}),
          ...(params.color != null ? { color: params.color } : {}),
          ...(params.text_color != null ? { textColor: params.text_color } : {}),
          ...(params.is_visible != null ? { visible: params.is_visible } : {}),
          ...(params.is_active != null ? { active: params.is_active } : {}),
          ...(shine != null ? { hasShineEffect: shine } : {}),
          ...(params.position != null ? { position: params.position } : {}),
          ...(icon != null ? { iconCustomEmojiId: icon } : {}),
        },
        "setParams(...)",
      );
    },
    onClick: (h) => clicks.add(h),
    offClick: (h) => clicks.delete(h),
  };
  return Object.assign(button, { __clicks: clicks });
}

export function makeSmallButton(
  key: "back" | "settings",
  label: string,
  ctx: ButtonFactoryContext,
): Clickable<TelegramSimpleButton> {
  const clicks = new Set<() => void>();
  const button: TelegramSimpleButton = {
    show: () => {
      ctx.log(`${label}.show()`);
      ctx.commit({ [key]: { visible: true } } as Partial<MockTelegramState>);
    },
    hide: () => {
      ctx.log(`${label}.hide()`);
      ctx.commit({ [key]: { visible: false } } as Partial<MockTelegramState>);
    },
    onClick: (h) => clicks.add(h),
    offClick: (h) => clicks.delete(h),
  };
  return Object.assign(button, { __clicks: clicks });
}

export function fireClicks(button: object) {
  (button as { __clicks: Set<() => void> }).__clicks.forEach((h) => h());
}

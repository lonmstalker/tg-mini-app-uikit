import { TKBottomBar, TKMainButton, useHasNativeChrome } from "tg-mini-app-uikit";
import { useMainButton, useSecondaryButton } from "@tg-mini-app/telegram";

/*
 * The funnel's primary action. Inside Telegram it drives the NATIVE MainButton
 * (only while this panel is the active one, so mounted-but-hidden lower panels
 * never fight over the single native button). In a plain browser — where the
 * native button is invisible — it renders the in-DOM `TKMainButton` fallback in
 * a bottom bar, so the action is visible and clickable. The demo's default mock
 * mode takes the in-DOM path; a real client takes the native one.
 */

function NativeMainButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  useMainButton({ text: label, onClick, disabled, visible: true });
  return null;
}

export interface PrimaryActionProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  /** True only when this panel is the top of its nav stack. */
  active: boolean;
  testId?: string;
}

export function PrimaryAction({ label, onClick, disabled, active, testId }: PrimaryActionProps) {
  const native = useHasNativeChrome();
  return (
    <>
      {active ? <NativeMainButton label={label} onClick={onClick} disabled={disabled} /> : null}
      {active && !native ? (
        <TKBottomBar>
          <TKMainButton label={label} onClick={onClick} disabled={disabled} testId={testId} />
        </TKBottomBar>
      ) : null}
    </>
  );
}

function NativeSecondaryButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  useSecondaryButton({ text: label, onClick, disabled, visible: true });
  return null;
}

export interface SecondaryActionProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  /** True only while this panel should own the single native SecondaryButton. */
  active: boolean;
}

/*
 * Companion cancel/back action to `PrimaryAction`, driving the NATIVE Telegram
 * SecondaryButton (Bot API 7.10+; the hook no-ops on older clients and outside
 * Telegram). Deliberately native-only — the in-DOM screens already carry their
 * own cancel affordances (mock back header, sheet close), so unlike
 * `PrimaryAction` there is no browser fallback bar to render.
 */
export function SecondaryAction({ label, onClick, disabled, active }: SecondaryActionProps) {
  return active ? <NativeSecondaryButton label={label} onClick={onClick} disabled={disabled} /> : null;
}

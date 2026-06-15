import { TKBottomBar, TKMainButton, useHasNativeChrome, useMainButton } from "tg-mini-app-uikit";

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

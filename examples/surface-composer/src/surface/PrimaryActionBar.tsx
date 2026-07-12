/*
 * The single primary commitment action (FR-011, Principle VI). In a real Telegram
 * Mini App this is the NATIVE MainButton — Telegram renders it in its own chrome
 * via the SDK (`useMainButton`), we don't draw it. The in-DOM `TKMainButton` is
 * only the fallback for the local browser/mock preview (this version is for
 * testing, per the deploy target). Pressing it commits and advances the keynote,
 * wired by the scene via `onCommit`.
 */
import { useMainButton } from "@tg-mini-app/telegram";
import { TKMainButton } from "tg-mini-app-uikit";
import { useComposer } from "../app/composerStore";

export interface PrimaryActionBarProps {
  label: string;
  onCommit: () => void;
}

export function PrimaryActionBar({ label, onCommit }: PrimaryActionBarProps) {
  const { runtimeMode } = useComposer();
  const isNative = runtimeMode === "native";

  // Bind the native Telegram MainButton; visible only when we are truly native,
  // so we never claim a native control where only a fallback exists (Principle V).
  useMainButton({ text: label, onClick: onCommit, visible: isNative });

  // Native: Telegram draws the button in its chrome — nothing in the DOM.
  if (isNative) return null;

  return (
    <div className="sc-action" data-testid="primary-action-bar">
      <TKMainButton label={label} onClick={onCommit} testId="primary-action" />
    </div>
  );
}

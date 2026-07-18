import { type HTMLAttributes, type ReactNode } from "react";

export interface TKAppShellProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  testId?: string;
}

/**
 * The app's outermost sized element: a full-height flex column capped at the
 * Telegram bridge's STABLE viewport (`.tk-app-shell` in tokens.css).
 *
 * Why not plain `100dvh`: dvh tracks the LAYOUT viewport, which Telegram iOS
 * resizes LAST when the keyboard opens — a bare-dvh shell stays full-height,
 * WebKit scrolls the page toward the focused composer, and the client's late
 * webview resize snaps the scroll back (the two-jump keyboard jerk,
 * wiki/ios-debugging.md). The stable-height cap follows the bridge signal
 * that arrives ~400ms earlier, eased with the kit's keyboard-shift tokens so
 * the shell rides the OS keyboard animation. Outside Telegram the var is
 * absent and the shell is a plain 100dvh column.
 *
 * Use ONE per app, directly under the providers; put the tab view / nav
 * stack inside.
 */
export function TKAppShell({ children, className, testId, ...rest }: TKAppShellProps) {
  return (
    <div {...rest} className={["tk-app-shell", className].filter(Boolean).join(" ")} data-testid={testId}>
      {children}
    </div>
  );
}

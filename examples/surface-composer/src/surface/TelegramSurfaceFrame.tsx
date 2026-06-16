/*
 * The centered Telegram-sized surface (max-width ~390px) floating on the dark
 * stage (D11). It owns the kit theme root (`TKProvider`, which also anchors kit
 * overlays like the inspector `TKSheet`) and applies live safe-area padding +
 * theme from the bridge so theme/safe-area stay anchored across remix (D6).
 *
 * Elevation (drop-shadow + faint rim) holds stage/surface separation even when
 * the inner surface is in Telegram dark theme — separation by depth, not just
 * lightness.
 */
import type { ReactNode } from "react";
import { TKProvider } from "tg-mini-app-uikit";
import { useTelegramThemeBridge } from "../runtime/useTelegramThemeBridge";

export function TelegramSurfaceFrame({ children }: { children: ReactNode }) {
  const { theme, inset } = useTelegramThemeBridge();
  return (
    <div className="sc-frame" data-frame-theme={theme}>
      <TKProvider theme={theme} telegram testId="surface-provider" className="sc-frame__tk">
        <div
          className="sc-frame__safe"
          style={{
            paddingTop: Math.max(inset.top, 0),
            paddingBottom: Math.max(inset.bottom, 0),
            paddingLeft: Math.max(inset.left, 0),
            paddingRight: Math.max(inset.right, 0),
          }}
        >
          {children}
        </div>
      </TKProvider>
    </div>
  );
}

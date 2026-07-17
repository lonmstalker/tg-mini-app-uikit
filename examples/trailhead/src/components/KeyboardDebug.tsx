import { useEffect, useState } from "react";
import { getTelegramWebApp } from "@tg-mini-app/telegram";

/*
 * On-device keyboard forensics. Activated by `?kbdebug=1` (append it to the
 * BotFather menu URL) or start_param `kbdebug`; renders nothing otherwise.
 * Logs every signal the keyboard controller acts on — visualViewport
 * geometry, Telegram's viewportChanged, the .tk root box, every
 * `--tk-kb-height` / `tk-kb-open` write, focus moves and window.scrollTo
 * calls — as an always-on-top readout, so ONE screenshot after a failed
 * composer tap reconstructs the whole timeline.
 */

export function kbDebugRequested(): boolean {
  try {
    if (new URLSearchParams(window.location.search).get("kbdebug") === "1") return true;
    return getTelegramWebApp()?.initDataUnsafe?.start_param === "kbdebug";
  } catch {
    return false;
  }
}

// Newest entry is PREPENDED so the visible top of the readout is always the
// latest event and overflow clipping eats the oldest lines, not the newest.
const MAX_LINES = 22;

function snapshot(): string {
  const vv = window.visualViewport;
  const root = document.querySelector<HTMLElement>(".tk");
  const rect = root?.getBoundingClientRect();
  const kbVar = root?.style.getPropertyValue("--tk-kb-height") || "0";
  const act = document.activeElement;
  const wa = getTelegramWebApp();
  return [
    `inH${window.innerHeight}`,
    `vv${vv ? Math.round(vv.height) : "-"}+${vv ? Math.round(vv.offsetTop ?? 0) : "-"}`,
    `sy${Math.round(window.scrollY)}`,
    `rt${rect ? Math.round(rect.height) : "-"}`,
    `var${kbVar}`,
    root?.classList.contains("tk-kb-open") ? "open" : "shut",
    `tg${wa ? Math.round(wa.viewportHeight ?? -1) : "-"}/${wa ? Math.round(wa.viewportStableHeight ?? -1) : "-"}`,
    `ae=${act ? act.tagName + (act === document.body ? "" : `#${(act as HTMLElement).dataset?.testid ?? ""}`) : "-"}`,
  ].join(" ");
}

export function KeyboardDebug() {
  const [lines, setLines] = useState<string[]>(() => [`     0 start     ${snapshot()}`]);
  useEffect(() => {
    const t0 = performance.now();
    const log = (tag: string) => {
      const line = `${String(Math.round(performance.now() - t0)).padStart(6)} ${tag.padEnd(9)} ${snapshot()}`;
      setLines((prev) => [line, ...prev.slice(0, MAX_LINES - 1)]);
    };

    const vv = window.visualViewport;
    const onVvResize = () => log("vv.resize");
    const onVvScroll = () => log("vv.scroll");
    vv?.addEventListener("resize", onVvResize, { passive: true });
    vv?.addEventListener("scroll", onVvScroll, { passive: true });

    const onFocusIn = () => log("focusin");
    const onFocusOut = () => log("focusout");
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);

    const wa = getTelegramWebApp();
    const onTgViewport = () => log("tg.vp");
    try {
      wa?.onEvent?.("viewportChanged", onTgViewport);
    } catch {
      /* older bridge */
    }

    // Every --tk-kb-height / tk-kb-open write, exactly when it happens.
    const mo = new MutationObserver(() => log("root.attr"));
    document.querySelectorAll<HTMLElement>(".tk").forEach((el) =>
      mo.observe(el, { attributes: true, attributeFilter: ["style", "class"] }),
    );
    // The host resizing the root without any vv event (the KB-3 case).
    const ro = new ResizeObserver(() => log("root.size"));
    document.querySelectorAll<HTMLElement>(".tk").forEach((el) => ro.observe(el));

    // The settle scroll (and anything else yanking the page). No "start" log
    // here — the initial snapshot seeds useState directly.
    const realScrollTo = window.scrollTo.bind(window);
    (window as { scrollTo: typeof window.scrollTo }).scrollTo = ((...args: unknown[]) => {
      log(`scrollTo(${args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(",")})`);
      return (realScrollTo as (...a: unknown[]) => void)(...args);
    }) as typeof window.scrollTo;

    return () => {
      vv?.removeEventListener("resize", onVvResize);
      vv?.removeEventListener("scroll", onVvScroll);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      try {
        wa?.offEvent?.("viewportChanged", onTgViewport);
      } catch {
        /* older bridge */
      }
      mo.disconnect();
      ro.disconnect();
      window.scrollTo = realScrollTo;
    };
  }, []);

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        top: "calc(env(safe-area-inset-top, 0px) + 52px)",
        left: 4,
        right: 4,
        zIndex: 99999,
        pointerEvents: "none",
        fontFamily: "ui-monospace, Menlo, monospace",
        fontSize: 12,
        lineHeight: 1.25,
        whiteSpace: "pre-wrap",
        wordBreak: "break-all",
        maxHeight: "55vh",
        overflow: "hidden",
        color: "#8f8",
        background: "rgba(0,0,0,0.74)",
        borderRadius: 8,
        padding: "4px 6px",
      }}
    >
      {lines.join("\n")}
    </div>
  );
}

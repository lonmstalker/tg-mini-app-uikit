import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { TKButton, TKDialog, TKIcon, TKSpinner, TKToastProvider } from "tg-mini-app-uikit";
import { resolveMockColors, type MockTelegram, type MockTelegramState } from "../../telegram/mock";
import { Lab } from "./Lab";

/* ---------------- Telegram client chrome ---------------- */

export function Chrome({
  mock,
  state,
  highlight,
  setHighlight,
}: {
  mock: MockTelegram;
  state: MockTelegramState;
  highlight: boolean;
  setHighlight: (on: boolean) => void;
}) {
  const tp = state.themeParams;
  const chromeColors = resolveMockColors(state);
  const chatRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startY: number; startH: number; moved: boolean } | null>(null);
  const rafRef = useRef<number | null>(null);
  const targetHRef = useRef(0);
  const [dragging, setDragging] = useState(false);

  const toggleViewport = () => {
    if (state.isExpanded) mock.collapse();
    else mock.webApp.expand?.();
  };

  const onGrabberDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* no active pointer (e.g. synthetic events) — dragging still works */
    }
    dragRef.current = { startY: e.clientY, startH: state.viewportHeight, moved: false };
    setDragging(true);
  };
  // One state commit per frame, however many pointermoves the browser delivers.
  const onGrabberMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const dy = d.startY - e.clientY; // up = positive = taller
    if (Math.abs(dy) > 4) d.moved = true;
    if (!d.moved) return;
    targetHRef.current = d.startH + dy;
    if (rafRef.current == null) {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        mock.dragViewport(targetHRef.current);
      });
    }
  };
  // A pending frame firing after the snap would yank the sheet — flush first.
  const flushDrag = () => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      mock.dragViewport(targetHRef.current);
    }
  };
  const onGrabberUp = () => {
    const d = dragRef.current;
    dragRef.current = null;
    setDragging(false);
    if (!d) return;
    if (d.moved) {
      flushDrag();
      mock.endViewportDrag();
    } else {
      toggleViewport(); // a plain tap toggles, like tapping the sheet edge
    }
  };
  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;
    const sync = () => mock.setViewportBounds(Math.round(el.getBoundingClientRect().height));
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [mock]);

  const chromeButton = (label: string, onClick: () => void, active = false) => (
    <button
      type="button"
      aria-label={label === "✕" ? "Close mini app" : "Menu"}
      onClick={onClick}
      style={{
        width: 30,
        height: 30,
        border: "none",
        borderRadius: "50%",
        background: active ? `color-mix(in srgb, ${tp.link_color} 18%, transparent)` : "transparent",
        color: active ? tp.link_color : tp.hint_color,
        fontSize: 15,
        fontWeight: 700,
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      {label}
    </button>
  );

  return (
    <div data-demo-app="platform" style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative", background: tp.secondary_bg_color }}>
      {/* Telegram header (the client's own chrome, not the mini app) */}
      <div
        data-demo-platform-header
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "56px 10px 8px",
          background: chromeColors.header, // setHeaderColor() repaints the client header
          transition: "background-color .25s ease",
          borderBottom: `0.5px solid ${tp.section_separator_color}`,
          color: tp.text_color,
        }}
      >
        <span style={{ width: 28, display: "inline-flex", justifyContent: "center" }}>
          {state.back.visible ? (
            <button
              type="button"
              aria-label="Back"
              onClick={mock.clickBack}
              style={{ border: "none", background: "transparent", color: tp.link_color, display: "inline-flex", padding: 0, cursor: "pointer" }}
            >
              <TKIcon name="chevronLeft" size={24} strokeWidth={2.3} />
            </button>
          ) : null}
        </span>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Platform Lab</div>
          <div style={{ fontSize: 11.5, color: tp.hint_color }}>mini app</div>
        </div>
        {state.settings.visible ? chromeButton("⚙", mock.clickSettings, true) : null}
        {chromeButton("⋯", () => mock.clickSettings(), false)}
        {chromeButton("✕", () => mock.webApp.close?.(), false)}
      </div>

      {/* Chat area behind the mini app */}
      <div ref={chatRef} style={{ flex: 1, minHeight: 0, position: "relative", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            top: 14,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: 12,
            color: tp.hint_color,
          }}
        >
          chat with @uikit_demo_bot
        </div>

        {state.closed ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              color: tp.text_color,
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 600 }}>Mini app closed</div>
            <div style={{ fontSize: 13, color: tp.hint_color, maxWidth: 220, textAlign: "center" }}>
              `close()` was called — in Telegram the panel slides away.
            </div>
            <TKButton size="sm" pill onClick={mock.relaunch}>
              Relaunch
            </TKButton>
          </div>
        ) : (
          <div
            data-demo-platform-sheet
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: state.viewportHeight,
              transition: dragging ? "none" : "height 340ms cubic-bezier(.3, .8, .3, 1)",
              contain: "layout paint", // scope the height-animation reflow to the sheet
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              background: "var(--tk-bg)",
              borderRadius: state.isExpanded ? 0 : "14px 14px 0 0",
              boxShadow: "0 -10px 30px rgba(0,0,0,.18)",
            }}
          >
            {/* Grabber: drag to resize the mini app, tap to toggle — like the real sheet edge */}
            <div
              role="button"
              data-demo-platform-grabber
              tabIndex={0}
              aria-label={state.isExpanded ? "Collapse the mini app" : "Expand the mini app"}
              onPointerDown={onGrabberDown}
              onPointerMove={onGrabberMove}
              onPointerUp={onGrabberUp}
              onPointerCancel={onGrabberUp}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleViewport();
                }
              }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 24,
                zIndex: 9,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                paddingTop: 6,
                gap: 3,
                cursor: dragging ? "grabbing" : "grab",
                touchAction: "none",
                outline: "none",
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 4,
                  borderRadius: 2,
                  background: tp.hint_color,
                  opacity: dragging ? 0.85 : state.isExpanded ? 0.3 : 0.55,
                  transition: "opacity .2s ease",
                }}
              />
              {!state.isExpanded && !dragging ? (
                <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".05em", textTransform: "uppercase", color: tp.hint_color }}>
                  drag up to expand
                </div>
              ) : null}
            </div>

            {/* The mini app itself */}
            <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
              <TKToastProvider offset={14}>
                <Lab mock={mock} state={state} highlight={highlight} setHighlight={setHighlight} />
              </TKToastProvider>

              {/* Safe-area visualizer */}
              {highlight ? (
                <>
                  {state.contentSafeAreaInset.top ? (
                    <Zone top={state.safeAreaInset.top} height={state.contentSafeAreaInset.top} color="#e89623" label="content inset (chrome)" />
                  ) : null}
                  {state.safeAreaInset.top ? (
                    <Zone top={0} height={state.safeAreaInset.top} color="#e5484d" label="safe-area top" />
                  ) : null}
                  {state.safeAreaInset.bottom ? (
                    <Zone bottom={0} height={state.safeAreaInset.bottom} color="#e5484d" label="safe-area bottom" />
                  ) : null}
                </>
              ) : null}
            </div>

            {/* Native bottom buttons rendered by the "client" */}
            {state.main.visible || state.secondary.visible ? (
              <div
                data-demo-platform-bottombar
                style={{
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 7,
                  padding: "7px 12px 10px",
                  background: chromeColors.bottomBar, // setBottomBarColor() repaints the bar
                  transition: "background-color .25s ease",
                  borderTop: `0.5px solid ${tp.section_separator_color}`,
                }}
              >
                {state.secondary.visible ? (
                  <NativeButton
                    text={state.secondary.text}
                    active={state.secondary.active}
                    progress={state.secondary.progress}
                    background={`color-mix(in srgb, ${tp.button_color ?? "#3390ec"} 14%, transparent)`}
                    color={state.secondary.textColor ?? tp.button_color ?? "#3390ec"}
                    onClick={mock.clickSecondary}
                  />
                ) : null}
                {state.main.visible ? (
                  <NativeButton
                    text={state.main.text}
                    active={state.main.active}
                    progress={state.main.progress}
                    background={state.main.color ?? tp.button_color ?? "#3390ec"}
                    color={state.main.textColor ?? tp.button_text_color ?? "#fff"}
                    onClick={mock.clickMain}
                  />
                ) : null}
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Native popup, rendered by the "client" on top of everything */}
      <TKDialog
        open={state.popup !== null}
        onClose={() => mock.resolvePopup(undefined)}
        title={state.popup?.params.title}
        text={state.popup?.params.message}
        actions={state.popup?.params.buttons?.map((b, i) => (
          <TKButton
            key={b.id ?? i}
            variant={b.type === "destructive" ? "destructive" : b.type === "cancel" || b.type === "close" ? "tonal" : "filled"}
            onClick={() => mock.resolvePopup(b.id)}
          >
            {b.text ?? (b.type === "ok" ? "OK" : b.type === "cancel" ? "Cancel" : "Close")}
          </TKButton>
        ))}
      />
    </div>
  );
}

function Zone({ top, bottom, height, color, label }: { top?: number; bottom?: number; height: number; color: string; label: string }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top,
        bottom,
        height,
        background: `color-mix(in srgb, ${color} 22%, transparent)`,
        borderBottom: top != null ? `1.5px dashed ${color}` : undefined,
        borderTop: bottom != null ? `1.5px dashed ${color}` : undefined,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: ".04em",
        textTransform: "uppercase",
        color,
        pointerEvents: "none",
        zIndex: 8,
      }}
    >
      {height >= 16 ? label : null}
    </div>
  );
}

function NativeButton({
  text,
  active,
  progress,
  background,
  color,
  onClick,
}: {
  text: string;
  active: boolean;
  progress: boolean;
  background: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        height: 50,
        border: "none",
        borderRadius: 12,
        background,
        color,
        fontSize: 16,
        fontWeight: 600,
        fontFamily: "inherit",
        cursor: active && !progress ? "pointer" : "default",
        opacity: active || progress ? 1 : 0.55,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        transition: "opacity .2s ease, background .2s ease",
      }}
    >
      {progress ? <TKSpinner color={color} size={20} /> : text}
    </button>
  );
}

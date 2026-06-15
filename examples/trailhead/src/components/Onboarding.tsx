import { useEffect, useRef, useState, type RefObject } from "react";
import { TKButton, TKOnboardingTooltip, TKText, TKTitle, useHomeScreen, useTKToast } from "tg-mini-app-uikit";
import { useT } from "../i18n";
import { useAppDispatch, useAppState } from "../store";

/*
 * First-run onboarding, gated by the persisted `onboardingDone` flag:
 *   welcome modal → three coach-mark tooltips (feed, tabbar, streak) →
 *   an add-to-home prompt (non-blocking toast). Completing or skipping the tour
 *   sets the flag, so it never replays after a reload.
 */
export function Onboarding({
  tabbarRef,
  contentRef,
}: {
  tabbarRef: RefObject<HTMLDivElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
}) {
  const t = useT();
  const state = useAppState();
  const dispatch = useAppDispatch();
  const toast = useTKToast();
  const home = useHomeScreen();
  const [phase, setPhase] = useState<"welcome" | "tour">("welcome");
  // Point the third coach mark at the Train tab button inside the tabbar.
  const trainTabRef = useRef<HTMLElement | null>(null);
  const welcomeDialogRef = useRef<HTMLDialogElement | null>(null);
  useEffect(() => {
    trainTabRef.current = tabbarRef.current?.querySelectorAll("button")[2] ?? null;
  });
  useEffect(() => {
    const dialog = welcomeDialogRef.current;
    if (!dialog || phase !== "welcome" || !state.hydrated || state.onboardingDone) return;
    if (!dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    }
    return () => {
      if (!dialog.open) return;
      if (typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
    };
  }, [phase, state.hydrated, state.onboardingDone]);

  if (!state.hydrated || state.onboardingDone) return null;

  const finish = () => {
    dispatch({ type: "COMPLETE_ONBOARDING" });
    toast.show({
      text: t("home.prompt"),
      icon: "home",
      action: t("home.add"),
      onAction: () => {
        if (home.add()) toast.success(t("home.added"));
      },
      duration: 6000,
    });
  };

  if (phase === "tour") {
    return (
      <TKOnboardingTooltip
        testId="onboarding"
        nextLabel={t("onboarding.next")}
        doneLabel={t("onboarding.done")}
        skipLabel={t("onboarding.skip")}
        onFinish={finish}
        steps={[
          { target: contentRef, title: t("onboarding.feed.title"), text: t("onboarding.feed.text"), placement: "bottom" },
          { target: tabbarRef, title: t("onboarding.tabs.title"), text: t("onboarding.tabs.text"), placement: "top" },
          { target: trainTabRef, title: t("onboarding.streak.title"), text: t("onboarding.streak.text"), placement: "top" },
        ]}
      />
    );
  }

  return (
    <dialog
      ref={welcomeDialogRef}
      data-testid="welcome"
      aria-label={t("welcome.title")}
      onCancel={(event) => {
        event.preventDefault();
        setPhase("tour");
      }}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        maxWidth: "none",
        maxHeight: "none",
        margin: 0,
        border: 0,
        zIndex: 1000,
        background: "color-mix(in srgb, #000 42%, transparent)",
        padding: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          bottom: "calc(var(--tk-safe-bottom, 0px) + 20px)",
          maxWidth: 460,
          margin: "0 auto",
          background: "var(--tk-bg-elevated, var(--tk-bg))",
          borderRadius: "calc(var(--tk-r-lg, 18px) * var(--tk-rx, 1))",
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          boxShadow: "0 12px 40px rgba(0,0,0,0.28)",
        }}
      >
        <div aria-hidden style={{ fontSize: 40, lineHeight: 1 }}>
          🥾
        </div>
        <TKTitle level={2}>{t("welcome.title")}</TKTitle>
        <TKText tone="secondary" size="body">
          {t("welcome.body")}
        </TKText>
        <TKButton full testId="welcome-dismiss" onClick={() => setPhase("tour")}>
          {t("welcome.dismiss")}
        </TKButton>
      </div>
    </dialog>
  );
}

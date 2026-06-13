import { useEffect, useRef, useState, type CSSProperties } from "react";
import { TKIcon, TKLocaleProvider, TKProvider, ruLocale, type TKLocale, type TelegramWebApp } from "tg-mini-app-uikit";
import { createMockTelegram } from "../telegram/mock";
import { DeviceFrame, FRAME_HEIGHT, FRAME_WIDTH } from "./DeviceFrame";
import { TweaksPanel } from "./TweaksPanel";
import { useFrameScale, useMediaQuery } from "./hooks";
import { DEFAULT_TWEAKS, type DemoLocale, type ShellApi, type Tweaks } from "./types";
import { ShopApp } from "../apps/shop/ShopApp";
import { BookingApp } from "../apps/booking/BookingApp";
import { GameApp } from "../apps/game/GameApp";
import { PlatformApp } from "../apps/platform/PlatformApp";
import { GalleryApp } from "../apps/gallery/GalleryApp";
import { StarsApp } from "../apps/stars/StarsApp";
import { OnboardingApp } from "../apps/onboarding/OnboardingApp";
import { SettingsApp } from "../apps/settings/SettingsApp";
import { SupportApp } from "../apps/support/SupportApp";
import { ArcadeApp } from "../apps/arcade/ArcadeApp";
import { FeedApp } from "../apps/feed/FeedApp";
import { WalletApp } from "../apps/wallet/WalletApp";
import { FormsApp } from "../apps/forms/FormsApp";

type AppKey =
  | "shop"
  | "booking"
  | "game"
  | "platform"
  | "gallery"
  | "stars"
  | "onboarding"
  | "settings"
  | "support"
  | "arcade"
  | "feed"
  | "wallet"
  | "forms";

/** Demo Arabic dictionary — exercises RTL + a custom partial locale. */
const arLocale: Partial<TKLocale> = {
  done: "تم",
  back: "رجوع",
  cancel: "إلغاء",
  close: "إغلاق",
  selectOptions: "اختر الخيارات",
  chooseFile: "اختر ملفًا",
  noFileSelected: "لم يتم اختيار ملف",
  search: "بحث",
  codeVerified: "تم التحقق من الرمز",
  didntGetCode: "لم يصلك الرمز؟",
  resend: "إعادة الإرسال",
  addToCart: "أضف إلى السلة",
  you: "أنت",
};

const SHELL_LOCALES: Record<DemoLocale, Partial<TKLocale> | undefined> = {
  en: undefined,
  ru: ruLocale,
  ar: arLocale,
};

const NAV: { key: AppKey; label: string }[] = [
  { key: "shop", label: "Shop" },
  { key: "booking", label: "Booking" },
  { key: "game", label: "Game" },
  { key: "stars", label: "Stars" },
  { key: "onboarding", label: "Identity" },
  { key: "support", label: "Support" },
  { key: "feed", label: "Feed" },
  { key: "wallet", label: "Wallet" },
  { key: "forms", label: "Forms" },
  { key: "arcade", label: "Arcade" },
  { key: "settings", label: "Storage" },
  { key: "platform", label: "Platform" },
  { key: "gallery", label: "Kit" },
];

const font: CSSProperties = {
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif",
};

function NavPill({ active, onSelect }: { active: AppKey; onSelect: (key: AppKey) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroller = scrollRef.current;
    const activeTab = scroller?.querySelector<HTMLElement>(`[data-demo-tab="${active}"]`);
    if (!scroller || !activeTab) return;

    const centeredLeft = activeTab.offsetLeft - (scroller.clientWidth - activeTab.offsetWidth) / 2;
    scroller.scrollTo({ left: Math.max(0, centeredLeft), behavior: "auto" });
  }, [active]);

  const scrollPage = (direction: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * Math.min(el.clientWidth * 0.8, 320), behavior: "smooth" });
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        minWidth: 0,
        width: "100%",
        maxWidth: "100%",
        ...font,
      }}
    >
      <button
        type="button"
        aria-label="Previous demos"
        onClick={() => scrollPage(-1)}
        style={navArrowStyle}
      >
        <TKIcon name="chevronLeft" size={18} strokeWidth={2.4} />
      </button>
      <div
        ref={scrollRef}
        data-demo-nav-scroll
        style={{
          flex: "1 1 auto",
          minWidth: 0,
          maxWidth: "100%",
          overflowX: "auto",
          overscrollBehaviorX: "contain",
          scrollbarWidth: "none",
          borderRadius: 999,
        }}
      >
        <div
          data-demo-nav
          style={{
            display: "flex",
            width: "max-content",
            gap: 4,
            padding: 4,
            borderRadius: 999,
            background: "rgba(24, 28, 34, .85)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            boxShadow: "0 8px 24px rgba(0,0,0,.28), inset 0 0 0 1px rgba(255,255,255,.06)",
          }}
        >
          {NAV.map(({ key, label }) => (
            <button
              type="button"
              key={key}
              data-demo-tab={key}
              onClick={() => onSelect(key)}
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "inherit",
                color: active === key ? "#11151a" : "rgba(255,255,255,.72)",
                background: active === key ? "#ffffff" : "transparent",
                transition: "color .15s ease, background .15s ease",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <button
        type="button"
        aria-label="Next demos"
        onClick={() => scrollPage(1)}
        style={navArrowStyle}
      >
        <TKIcon name="chevronRight" size={18} strokeWidth={2.4} />
      </button>
    </div>
  );
}

const navArrowStyle: CSSProperties = {
  width: 32,
  height: 32,
  border: "none",
  borderRadius: 999,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flex: "0 0 auto",
  background: "rgba(24, 28, 34, .85)",
  color: "rgba(255,255,255,.82)",
  boxShadow: "inset 0 0 0 1px rgba(255,255,255,.08)",
  cursor: "pointer",
  fontFamily: "inherit",
  lineHeight: 0,
  padding: 0,
  overflow: "hidden",
};

/**
 * Boot state from the URL so demos and e2e tests can deep-link:
 * `?app=gallery&dark=1&accent=e5484d&roundness=1.6&fontSize=19&rtl=1&insets=1&locale=ru`.
 * `accent` accepts a hex with or without `#` (`%23` decodes to `#`).
 */
function bootParams(): {
  app: AppKey;
  dark: boolean;
  locale: DemoLocale;
  rtl: boolean;
  insets: boolean;
  accent?: string;
  roundness?: number;
  fontSize?: number;
} {
  const params = new URLSearchParams(window.location.search);
  const app = params.get("app") as AppKey | null;
  const num = (key: string): number | undefined => {
    const v = Number.parseFloat(params.get(key) ?? "");
    return Number.isFinite(v) ? v : undefined;
  };
  const localeRaw = params.get("locale");
  const accentRaw = params.get("accent");
  const accent = accentRaw ? (accentRaw.startsWith("#") ? accentRaw : `#${accentRaw}`) : undefined;
  return {
    app: app && NAV.some((n) => n.key === app) ? app : "shop",
    dark: params.get("dark") === "1",
    locale: localeRaw === "ru" || localeRaw === "ar" ? localeRaw : "en",
    // `?locale=ar` is an RTL language — flips the document like `?rtl=1`
    rtl: params.get("rtl") === "1" || localeRaw === "ar",
    insets: params.get("insets") === "1",
    accent,
    roundness: num("roundness"),
    fontSize: num("fontSize"),
  };
}

/* Boot side effects, applied once before the first render. */
{
  const boot = bootParams();
  const host = window as unknown as { Telegram?: { WebApp?: TelegramWebApp } };
  if (boot.rtl) document.documentElement.dir = "rtl";
  if (boot.insets && !host.Telegram?.WebApp) {
    // Install the demo mock as the global WebApp with "real device" insets
    // (notch/home-bar cutouts + fullscreen Telegram chrome), so TKSafeArea /
    // TKPage / TKBottomBar — which fall back to window.Telegram.WebApp — see
    // non-zero safeAreaInset (59/34) and contentSafeAreaInset (46/0).
    const mock = createMockTelegram();
    mock.setDeviceCutouts(true);
    mock.setChromeInset(true);
    host.Telegram = { WebApp: mock.webApp };
  }
}

const TWEAKS_KEY = "tk-demo-tweaks";

function loadSavedTweaks(): Partial<Tweaks> {
  try {
    return JSON.parse(localStorage.getItem(TWEAKS_KEY) ?? "{}") as Partial<Tweaks>;
  } catch {
    return {};
  }
}

export function Shell() {
  const [app, setApp] = useState<AppKey>(() => bootParams().app);
  const [tweaks, setTweaks] = useState<Tweaks>(() => {
    const boot = bootParams();
    return {
      ...DEFAULT_TWEAKS,
      // persisted panel settings survive reloads (M8.4)…
      ...loadSavedTweaks(),
      // …but explicit URL params win (e2e and shared links rely on this)
      dark: boot.dark || (loadSavedTweaks().dark ?? false),
      locale: boot.locale,
      ...(boot.accent != null ? { accent: boot.accent } : null),
      ...(boot.roundness != null ? { roundness: boot.roundness } : null),
      ...(boot.fontSize != null ? { fontSize: boot.fontSize } : null),
    };
  });
  const patch = (p: Partial<Tweaks>) =>
    setTweaks((t) => {
      const next = { ...t, ...p };
      try {
        localStorage.setItem(TWEAKS_KEY, JSON.stringify(next));
      } catch {
        /* private mode etc. — persistence is best-effort */
      }
      return next;
    });
  const resetDemoData = () => {
    try {
      // mock cloud/device storage namespaces + the tweaks themselves
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith("tg-demo-") || key.startsWith("tk-demo")) localStorage.removeItem(key);
      }
      localStorage.removeItem(TWEAKS_KEY);
    } catch {
      /* ignore */
    }
    window.location.reload();
  };
  const narrow = useMediaQuery("(max-width: 920px)");
  const scale = useFrameScale(FRAME_WIDTH, FRAME_HEIGHT);

  const shell: ShellApi = { dark: tweaks.dark, setDark: (dark) => patch({ dark }) };

  // Arabic flips the document direction live (the boot `?rtl=1` flag still wins).
  useEffect(() => {
    document.documentElement.dir = tweaks.locale === "ar" || bootParams().rtl ? "rtl" : "ltr";
  }, [tweaks.locale]);

  const screen = (
    <TKProvider
      theme={tweaks.dark ? "dark" : "light"}
      preset={tweaks.preset}
      accent={tweaks.accent}
      roundness={tweaks.roundness}
      motionSpeed={tweaks.motionSpeed}
      motion={tweaks.motion}
      fontSize={tweaks.fontSize}
      style={{ height: "100%", overflow: "hidden" }}
    >
      <TKLocaleProvider locale={SHELL_LOCALES[tweaks.locale]}>
        {app === "shop" ? <ShopApp shell={shell} /> : null}
        {app === "booking" ? <BookingApp /> : null}
        {app === "game" ? <GameApp /> : null}
        {app === "platform" ? <PlatformApp shell={shell} /> : null}
        {app === "gallery" ? <GalleryApp /> : null}
        {app === "stars" ? <StarsApp /> : null}
        {app === "onboarding" ? <OnboardingApp /> : null}
        {app === "settings" ? <SettingsApp /> : null}
        {app === "support" ? <SupportApp /> : null}
        {app === "arcade" ? <ArcadeApp /> : null}
        {app === "feed" ? <FeedApp /> : null}
        {app === "wallet" ? <WalletApp /> : null}
        {app === "forms" ? <FormsApp /> : null}
      </TKLocaleProvider>
    </TKProvider>
  );

  if (narrow) {
    // Real-device mode: the example app takes the whole viewport, like an
    // actual Telegram mini app. The switcher floats on top.
    return (
      <div data-demo-shell style={{ width: "100%", height: "100dvh", overflowX: "hidden", position: "relative", ...font }}>
        {screen}
        <div
          style={{
            position: "fixed",
            top: 10,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            zIndex: 3000,
            pointerEvents: "none",
          }}
        >
          {/* On phones narrower than the pill (320px-class) it scrolls instead of overflowing. */}
          <div style={{ width: "calc(100vw - 12px)", pointerEvents: "auto" }}>
            <NavPill active={app} onSelect={setApp} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-demo-shell
      style={{ width: "100%", minHeight: "100vh", overflowX: "hidden", display: "flex", flexDirection: "column", ...font }}
    >
      <header
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(170px, 240px) minmax(0, 1fr) minmax(0, 220px)",
          alignItems: "center",
          gap: 20,
          padding: "18px 28px 6px",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>
            Telegram Mini App UIKit
          </div>
          <div style={{ color: "rgba(255,255,255,.45)", fontSize: 12.5, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            Example projects built entirely from the kit
          </div>
        </div>
        <div style={{ minWidth: 0, display: "flex", justifyContent: "center", overflow: "hidden" }}>
          <NavPill active={app} onSelect={setApp} />
        </div>
        <div />
      </header>

      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          gap: 36,
          padding: "22px 28px 48px",
        }}
      >
        <div data-demo-stage style={{ width: FRAME_WIDTH * scale, height: FRAME_HEIGHT * scale }}>
          <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
            <DeviceFrame dark={tweaks.dark}>{screen}</DeviceFrame>
          </div>
        </div>
        <TweaksPanel tweaks={tweaks} onChange={patch} onReset={resetDemoData} style={{ position: "sticky", top: 22 }} />
      </main>
    </div>
  );
}

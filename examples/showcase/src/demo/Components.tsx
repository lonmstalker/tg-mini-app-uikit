import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import {
  TKAvatar,
  TKButton,
  TKCalendar,
  TKCard,
  TKChipGroup,
  TKConfetti,
  TKGallery,
  TKImageViewer,
  TKMessageBubble,
  TKMessages,
  TKNoticeBar,
  TKOTP,
  TKPinInput,
  TKProvider,
  TKSheet,
  TKSlider,
  TKSkeleton,
  TKSkeletonText,
  TKSwitch,
  useReducedMotion,
  useTKTheme,
  type TKImageViewerImage,
  type TKTheme,
} from "tg-mini-app-uikit";
import { SectionTitle } from "../shared/layout";
import { formatSiteString, useSiteLocale } from "../shared/i18n";
import { resolveTokenColor } from "./themeColors";
import { useReveal } from "../shared/useReveal";

const TILE_STAGGER_MS = 60;

const STORY_IDS = {
  imageViewer: "composites-overlays--image-viewer",
  pinInput: "composites-forms--pin-and-chips",
  gallery: "composites-carousel--product-slides",
  noticeBar: "composites-feedback--notice-bars",
  chat: "templates-chat--support-thread",
  confetti: "templates-onboarding--confetti-burst",
  sheet: "composites-overlays--modal-surfaces",
  calendar: "composites-forms--calendar-and-date-input",
  otp: "atoms-inputs--one-time-code",
  slider: "atoms-controls--sliders",
  skeletons: "composites-feedback--skeletons",
  switch: "atoms-controls--binary-controls",
} as const;

type StoryId = (typeof STORY_IDS)[keyof typeof STORY_IDS];
type TileSize = "standard" | "compact" | "wide" | "large" | "tall";
type TokenImage = TKImageViewerImage & { label: string };

export function Components({ theme }: { theme: TKTheme }) {
  const { strings } = useSiteLocale();
  const copy = strings.demo.components;
  const headingRef = useReveal<HTMLDivElement>();

  return (
    <>
      <div ref={headingRef} className="components-heading reveal">
        <SectionTitle id="components-title">{copy.title}</SectionTitle>
        <p>{copy.intro}</p>
      </div>

      <div className="components-grid">
        <BentoTile
          index={0}
          slug="image-viewer"
          size="large"
          title={copy.imageViewerTitle}
          description={copy.imageViewerCopy}
          storyId={STORY_IDS.imageViewer}
        >
          <LazyDemo testId="lazy-image-viewer" className="component-lazy--image">
            <ImageViewerDemo theme={theme} />
          </LazyDemo>
        </BentoTile>

        <BentoTile
          index={1}
          slug="pin-input"
          size="tall"
          title={copy.pinTitle}
          description={copy.pinCopy}
          storyId={STORY_IDS.pinInput}
        >
          <PinDemo />
        </BentoTile>

        <BentoTile
          index={2}
          slug="gallery"
          title={copy.galleryTitle}
          description={copy.galleryCopy}
          storyId={STORY_IDS.gallery}
        >
          <GalleryDemo />
        </BentoTile>

        <BentoTile
          index={3}
          slug="notice-bar"
          size="compact"
          title={copy.noticeTitle}
          description={copy.noticeCopy}
          storyId={STORY_IDS.noticeBar}
        >
          <NoticeBarDemo />
        </BentoTile>

        <BentoTile
          index={4}
          slug="chat"
          size="wide"
          title={copy.chatTitle}
          description={copy.chatCopy}
          storyId={STORY_IDS.chat}
        >
          <LazyDemo testId="lazy-chat" className="component-lazy--chat">
            <ChatDemo />
          </LazyDemo>
        </BentoTile>

        <BentoTile
          index={5}
          slug="confetti"
          size="compact"
          title={copy.confettiTitle}
          description={copy.confettiCopy}
          storyId={STORY_IDS.confetti}
        >
          <ConfettiDemo />
        </BentoTile>

        <BentoTile
          index={6}
          slug="sheet"
          title={copy.sheetTitle}
          description={copy.sheetCopy}
          storyId={STORY_IDS.sheet}
        >
          <SheetDemo theme={theme} />
        </BentoTile>

        <BentoTile
          index={7}
          slug="calendar"
          size="wide"
          title={copy.calendarTitle}
          description={copy.calendarCopy}
          storyId={STORY_IDS.calendar}
        >
          <LazyDemo testId="lazy-calendar" className="component-lazy--calendar">
            <CalendarDemo />
          </LazyDemo>
        </BentoTile>

        <BentoTile
          index={8}
          slug="otp"
          title={copy.otpTitle}
          description={copy.otpCopy}
          storyId={STORY_IDS.otp}
        >
          <OTPDemo />
        </BentoTile>

        <BentoTile
          index={9}
          slug="slider"
          size="compact"
          title={copy.sliderTitle}
          description={copy.sliderCopy}
          storyId={STORY_IDS.slider}
        >
          <SliderDemo />
        </BentoTile>

        <BentoTile
          index={10}
          slug="skeletons"
          title={copy.skeletonTitle}
          description={copy.skeletonCopy}
          storyId={STORY_IDS.skeletons}
        >
          <SkeletonDemo />
        </BentoTile>

        <BentoTile
          index={11}
          slug="switch-chips"
          title={copy.switchTitle}
          description={copy.switchCopy}
          storyId={STORY_IDS.switch}
        >
          <SwitchChipsDemo />
        </BentoTile>
      </div>
    </>
  );
}

function BentoTile({
  index,
  slug,
  size = "standard",
  title,
  description,
  storyId,
  children,
}: {
  index: number;
  slug: string;
  size?: TileSize;
  title: string;
  description: string;
  storyId: StoryId;
  children: ReactNode;
}) {
  const { strings } = useSiteLocale();
  const revealRef = useReveal<HTMLElement>();
  const storyUrl = `${import.meta.env.BASE_URL}storybook/?path=/story/${storyId}`;

  return (
    <article
      ref={revealRef}
      className={`component-tile component-tile--${size} component-tile--${slug} reveal`}
      style={{ transitionDelay: `${index * TILE_STAGGER_MS}ms` }}
      data-testid={`component-tile-${slug}`}
    >
      <div className="component-tile-chrome tk-press tk-press-soft">
        <header className="component-tile-header">
          <div>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
          <a className="component-story-link" href={storyUrl} target="_blank" rel="noopener noreferrer">
            {strings.demo.components.storybook} <span aria-hidden="true">→</span>
          </a>
        </header>
        <div className="component-demo">{children}</div>
      </div>
    </article>
  );
}

function LazyDemo({
  testId,
  className,
  children,
}: {
  testId: string;
  className?: string;
  children: ReactNode;
}) {
  const { strings } = useSiteLocale();
  const { ref, mounted } = useLazyMount<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={["component-lazy", className].filter(Boolean).join(" ")}
      data-lazy-state={mounted ? "mounted" : "pending"}
      data-testid={testId}
      aria-busy={!mounted}
    >
      {mounted ? children : <span className="component-lazy-placeholder">{strings.demo.components.lazyLoading}</span>}
    </div>
  );
}

function ImageViewerDemo({ theme }: { theme: TKTheme }) {
  const { strings } = useSiteLocale();
  const copy = strings.demo.components;
  const { accent } = useTKTheme();
  const hostRef = useRef<HTMLDivElement>(null);
  const originRef = useRef<HTMLElement | null>(null);
  const images = useTokenImages(hostRef, theme, accent);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  return (
    <TKProvider theme={theme} className="component-frame-provider">
      <div
        ref={hostRef}
        className="image-viewer-stage"
        data-tk-portal-root
        data-testid="image-viewer-demo"
      >
        <div className="image-preview-grid">
          {images.map((image, imageIndex) => (
            <button
              key={image.alt}
              type="button"
              className="image-preview-button tk-press"
              aria-label={formatSiteString(copy.openImage, { label: image.label })}
              data-testid={`image-preview-${imageIndex}`}
              onClick={(event) => {
                originRef.current = event.currentTarget;
                setIndex(imageIndex);
                setOpen(true);
              }}
            >
              <img src={image.src} alt="" draggable={false} />
            </button>
          ))}
        </div>
        <p className="component-demo-hint">{copy.imageHint}</p>
        <TKImageViewer
          open={open}
          onClose={() => setOpen(false)}
          images={images}
          index={index}
          onIndexChange={setIndex}
          originRef={originRef}
          testId="bento-image-viewer"
        />
      </div>
    </TKProvider>
  );
}

function PinDemo() {
  const { strings } = useSiteLocale();
  const copy = strings.demo.components;
  const [result, setResult] = useState<"idle" | "success" | "error">("idle");
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      window.clearTimeout(timerRef.current);
    },
    [],
  );

  const verify = (pin: string) => {
    window.clearTimeout(timerRef.current);
    setResult("idle");
    timerRef.current = window.setTimeout(
      () => setResult(pin === "1234" ? "success" : "error"),
      0,
    );
  };

  return (
    <div className="pin-demo">
      <TKPinInput
        testId="bento-pin"
        error={result === "error"}
        success={result === "success"}
        onComplete={verify}
        title={
          <span className="pin-demo-title">
            <strong>{copy.enterPin}</strong>
            <span>{copy.pinHint}</span>
          </span>
        }
      />
      <p className="component-status" data-state={result} data-testid="pin-result" role="status" aria-live="polite">
        {result === "success" ? copy.pinAccepted : result === "error" ? copy.tryPin : copy.pinIdle}
      </p>
    </div>
  );
}

function GalleryDemo() {
  const { strings } = useSiteLocale();
  const copy = strings.demo.components;
  const labels = [copy.signal, copy.orbit, copy.current];

  return (
    <TKGallery height={184} edgeInset={0} gap={10} haptics={false} testId="bento-gallery">
      {labels.map((label, index) => (
        <div key={label} className="gallery-slide" data-variant={index}>
          <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
          <strong>{label}</strong>
          <small>{copy.swipeContinue}</small>
        </div>
      ))}
    </TKGallery>
  );
}

function NoticeBarDemo() {
  const { strings } = useSiteLocale();
  const copy = strings.demo.components;
  const playback = useViewportActivity<HTMLDivElement>();
  const [visible, setVisible] = useState(true);

  return (
    <div
      ref={playback.ref}
      className="notice-demo"
      data-marquee-state={playback.active ? "running" : playback.reduced ? "reduced" : "parked"}
      data-testid="notice-marquee-demo"
    >
      {visible ? (
        <TKNoticeBar
          closable
          marquee={playback.active}
          onClose={() => setVisible(false)}
          tone="accent"
          testId="bento-notice-bar"
        >
          {copy.noticeText}
        </TKNoticeBar>
      ) : (
        <TKButton size="sm" variant="tonal" onClick={() => setVisible(true)}>
          {copy.restoreNotice}
        </TKButton>
      )}
      <p className="component-demo-hint" aria-live="polite">
        {playback.active ? copy.tickerRunning : copy.tickerParked}
      </p>
    </div>
  );
}

function ChatDemo() {
  const { strings } = useSiteLocale();
  const copy = strings.demo.components;

  return (
    <div className="chat-demo" data-testid="chat-demo">
      <div className="chat-demo-header">
        <strong>{copy.support}</strong>
        <span>{copy.online}</span>
      </div>
      <div className="chat-demo-thread">
        <TKMessages
          messages={[
            { id: "delivery", text: copy.chatPreviewReady, time: "12:01" },
            { id: "theme", text: copy.chatThemeQuestion, out: true, time: "12:02", status: "read" },
          ]}
          testId="bento-messages"
        />
        <TKMessageBubble text={copy.chatThemeAnswer} time="12:03" />
      </div>
    </div>
  );
}

function ConfettiDemo() {
  const { strings } = useSiteLocale();
  const copy = strings.demo.components;
  const [burst, setBurst] = useState<number | null>(null);

  return (
    <div className="confetti-demo" data-confetti-state={burst == null ? "idle" : "running"} data-testid="confetti-demo">
      <div className="confetti-demo-copy">
        <strong>{burst == null ? copy.rewardReady : copy.burstRunning}</strong>
        <span role="status" aria-live="polite">{burst == null ? copy.canvasUnmounted : copy.canvasMounted}</span>
      </div>
      <TKButton size="sm" onClick={() => setBurst((current) => (current ?? 0) + 1)}>
        {copy.fireConfetti}
      </TKButton>
      {burst == null ? null : (
        <TKConfetti key={burst} count={32} duration={900} onDone={() => setBurst(null)} testId="bento-confetti" />
      )}
    </div>
  );
}

function SheetDemo({ theme }: { theme: TKTheme }) {
  const { strings } = useSiteLocale();
  const copy = strings.demo.components;
  const [open, setOpen] = useState(false);

  return (
    <TKProvider theme={theme} className="component-frame-provider">
      <div className="sheet-demo-stage" data-tk-portal-root data-testid="sheet-demo" data-sheet-open={open}>
        <div className="sheet-demo-launcher">
          <TKButton onClick={() => setOpen(true)}>{copy.openSheet}</TKButton>
          <span>{copy.sheetHint}</span>
        </div>
        <TKSheet open={open} onClose={() => setOpen(false)} title={copy.savedView} testId="bento-sheet">
          <p className="sheet-demo-line">{copy.filtersLocal}</p>
        </TKSheet>
      </div>
    </TKProvider>
  );
}

function CalendarDemo() {
  const { locale, strings } = useSiteLocale();
  const copy = strings.demo.components;
  const [date, setDate] = useState(() => new Date(2026, 5, 13));
  const selected = new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);

  return (
    <div className="calendar-demo" data-testid="calendar-demo">
      <TKCalendar
        value={date}
        onChange={setDate}
        lang={locale}
        defaultMonth={new Date(2026, 5, 1)}
        partSelectors={false}
        testId="bento-calendar"
        style={{ boxShadow: "none" }}
      />
      <p className="component-status" data-state="success" role="status" aria-live="polite">
        {formatSiteString(copy.selectedDate, { date: selected })}
      </p>
    </div>
  );
}

function OTPDemo() {
  const { strings } = useSiteLocale();
  const copy = strings.demo.components;
  const [value, setValue] = useState("");
  const [verified, setVerified] = useState(false);

  return (
    <div className="otp-demo">
      <TKOTP
        length={4}
        value={value}
        onChange={(next) => {
          setValue(next);
          if (next.length < 4) setVerified(false);
        }}
        onComplete={() => setVerified(true)}
        onResend={() => {
          setValue("");
          setVerified(false);
        }}
        successText={copy.codeAccepted}
        resendLabel={copy.resetCode}
        testId="bento-otp"
      />
      <p className="component-status" data-state={verified ? "success" : "idle"} role="status" aria-live="polite">
        {verified ? copy.otpComplete : copy.otpIdle}
      </p>
    </div>
  );
}

function SliderDemo() {
  const { strings } = useSiteLocale();
  const copy = strings.demo.components;
  const [value, setValue] = useState(64);

  return (
    <div className="slider-demo">
      <div className="slider-demo-value">
        <span>{copy.intensity}</span>
        <output aria-live="polite">{value}%</output>
      </div>
      <TKSlider value={value} onChange={setValue} label={copy.intensityAria} suffix="%" marks={[0, 25, 50, 75, 100]} testId="bento-slider" />
    </div>
  );
}

function SkeletonDemo() {
  const { strings } = useSiteLocale();
  const copy = strings.demo.components;
  const playback = useViewportActivity<HTMLDivElement>();
  const [replay, setReplay] = useState(0);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);
  const shimmerState = playback.reduced
    ? "reduced"
    : loading && playback.active
      ? "running"
      : "paused";

  useEffect(
    () => () => {
      window.clearTimeout(timerRef.current);
    },
    [],
  );

  const reloadPreview = () => {
    window.clearTimeout(timerRef.current);
    if (playback.reduced) {
      setLoading(false);
      return;
    }
    setReplay((current) => current + 1);
    setLoading(true);
    timerRef.current = window.setTimeout(() => setLoading(false), 1200);
  };

  return (
    <div
      ref={playback.ref}
      className="skeleton-demo"
      data-shimmer-state={shimmerState}
      data-reload-state={loading ? "loading" : "content"}
      data-testid="skeleton-demo"
    >
      <div className="skeleton-demo-stage">
        <TKCard
          className="skeleton-demo-content"
          padding="var(--tk-sp-4)"
          aria-hidden={loading}
          testId="skeleton-content"
        >
          <div className="skeleton-demo-row">
            <TKAvatar initials="UI" size={44} tone="var(--tk-accent)" />
            <span>
              <strong>{copy.skeletonPreviewTitle}</strong>
              <small>{copy.skeletonPreviewCopy}</small>
              <small>{copy.skeletonPreviewMeta}</small>
            </span>
          </div>
        </TKCard>
        <div
          key={replay}
          className="skeleton-demo-loading tk-skel-group"
          aria-hidden={!loading}
          data-testid="skeleton-loading"
        >
          <TKSkeleton width={44} height={44} radius="var(--tk-r-pill)" />
          <TKSkeletonText lines={3} />
        </div>
      </div>
      <TKButton size="sm" variant="outline" onClick={reloadPreview}>
        {copy.reloadPreview}
      </TKButton>
    </div>
  );
}

function SwitchChipsDemo() {
  const { strings } = useSiteLocale();
  const copy = strings.demo.components;
  const channelOptions = [
    { value: "orders", label: copy.orders },
    { value: "product", label: copy.product },
    { value: "security", label: copy.security },
  ];
  const [notifications, setNotifications] = useState(true);
  const [channels, setChannels] = useState<string[]>(["orders", "security"]);

  return (
    <div className="switch-chips-demo">
      <TKSwitch checked={notifications} onChange={setNotifications} label={copy.pushNotifications} />
      <TKChipGroup
        items={channelOptions}
        multi
        value={channels}
        onChange={(next) => setChannels(next as string[])}
        aria-label={copy.notificationChannels}
        testId="bento-chip-group"
      />
      <p className="component-status" data-state={notifications ? "success" : "idle"} role="status" aria-live="polite">
        {notifications
          ? formatSiteString(copy.channelsEnabled, { count: channels.length })
          : copy.notificationsPaused}
      </p>
    </div>
  );
}

function useLazyMount<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (mounted) return;
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setMounted(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setMounted(true);
        observer.disconnect();
      },
      { rootMargin: "320px 0px", threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [mounted]);

  return { ref, mounted } as const;
}

function useViewportActivity<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();
  const [inViewport, setInViewport] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(
    () => typeof document === "undefined" || !document.hidden,
  );

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setInViewport(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setInViewport(entry?.isIntersecting ?? false),
      { threshold: 0.45 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onVisibilityChange = () => setDocumentVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  return {
    ref,
    reduced,
    inViewport,
    active: !reduced && inViewport && documentVisible,
  } as const;
}

function useTokenImages(
  hostRef: RefObject<HTMLElement | null>,
  theme: TKTheme,
  accent: string | undefined,
) {
  const { strings } = useSiteLocale();
  const copy = strings.demo.components;
  const [images, setImages] = useState<TokenImage[]>([]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    setImages(buildTokenImages(
      host,
      [copy.signal, copy.orbit, copy.current],
      copy.tokenComposition,
    ));
  }, [accent, copy, hostRef, theme]);

  return images;
}

function buildTokenImages(
  host: HTMLElement,
  labels: string[],
  altTemplate: string,
): TokenImage[] {
  const tokenNames = [
    "--tk-accent",
    "--tk-surface-2",
    "--tk-green",
    "--tk-orange",
    "--tk-purple",
    "--tk-text",
  ];
  const colors = tokenNames.map((name) => resolveTokenColor(host, name));
  return labels.map((label, index) => {
    const first = colors[index];
    const second = colors[index + 1];
    const third = colors[index + 2];
    const ink = colors[5];
    const alt = formatSiteString(altTemplate, { label });
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-label="${alt}">
      <defs>
        <linearGradient id="field" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${first}"/>
          <stop offset="1" stop-color="${second}"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(${"#field"})"/>
      <circle cx="${320 + index * 210}" cy="${240 + index * 70}" r="210" fill="${third}" opacity=".78"/>
      <path d="M0 ${650 - index * 60} C260 ${460 + index * 50}, 640 ${760 - index * 80}, 1200 ${410 + index * 55} V800 H0Z" fill="${ink}" opacity=".16"/>
      <text x="70" y="720" fill="${ink}" opacity=".88" font-family="system-ui,sans-serif" font-size="74" font-weight="700">${label}</text>
    </svg>`;
    return {
      src: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
      alt,
      label,
    };
  });
}

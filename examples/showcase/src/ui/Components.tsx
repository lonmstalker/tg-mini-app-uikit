import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import {
  TKButton,
  TKCalendar,
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
  TKSkeletonCard,
  TKSkeletonText,
  TKSwitch,
  useReducedMotion,
  useTKTheme,
  type TKImageViewerImage,
  type TKTheme,
} from "tg-mini-app-uikit";
import { SectionTitle } from "./layout";
import { resolveTokenColor } from "./themeColors";
import { useReveal } from "./useReveal";

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

export function Components({ theme }: { theme: TKTheme }) {
  const headingRef = useReveal<HTMLDivElement>();

  return (
    <>
      <div ref={headingRef} className="components-heading reveal">
        <SectionTitle id="components-title">Try the kit live</SectionTitle>
        <p>Open a viewer, swipe a gallery, enter codes, and dismiss a sheet. Each tile uses the public API.</p>
      </div>

      <div className="components-grid">
        <BentoTile
          index={0}
          slug="image-viewer"
          size="large"
          title="ImageViewer"
          description="Open a token-built composition, then pinch, double-tap, or swipe it down."
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
          title="PinInput"
          description="The local verifier accepts 1234 and rejects every other four-digit PIN."
          storyId={STORY_IDS.pinInput}
        >
          <PinDemo />
        </BentoTile>

        <BentoTile
          index={2}
          slug="gallery"
          title="Gallery"
          description="A scroll-snap gallery with touch, trackpad, and keyboard-operable dots."
          storyId={STORY_IDS.gallery}
        >
          <GalleryDemo />
        </BentoTile>

        <BentoTile
          index={3}
          slug="notice-bar"
          size="compact"
          title="NoticeBar marquee"
          description="Overflow starts only while this tile is visible and motion is allowed."
          storyId={STORY_IDS.noticeBar}
        >
          <NoticeBarDemo />
        </BentoTile>

        <BentoTile
          index={4}
          slug="chat"
          size="wide"
          title="Chat template"
          description="Grouped incoming and outgoing messages, including read-state ticks."
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
          title="Confetti"
          description="A one-shot canvas burst mounts on demand and removes itself when finished."
          storyId={STORY_IDS.confetti}
        >
          <ConfettiDemo />
        </BentoTile>

        <BentoTile
          index={6}
          slug="sheet"
          title="Sheet"
          description="A real draggable sheet kept inside this miniature viewport."
          storyId={STORY_IDS.sheet}
        >
          <SheetDemo theme={theme} />
        </BentoTile>

        <BentoTile
          index={7}
          slug="calendar"
          size="wide"
          title="Calendar"
          description="Pick a date with touch, pointer, or the calendar grid keyboard pattern."
          storyId={STORY_IDS.calendar}
        >
          <LazyDemo testId="lazy-calendar" className="component-lazy--calendar">
            <CalendarDemo />
          </LazyDemo>
        </BentoTile>

        <BentoTile
          index={8}
          slug="otp"
          title="OTP"
          description="A real one-time-code input with local completion feedback and resend."
          storyId={STORY_IDS.otp}
        >
          <OTPDemo />
        </BentoTile>

        <BentoTile
          index={9}
          slug="slider"
          size="compact"
          title="Slider"
          description="Drag the compositor-friendly thumb or use arrows, Page Up, Home, and End."
          storyId={STORY_IDS.slider}
        >
          <SliderDemo />
        </BentoTile>

        <BentoTile
          index={10}
          slug="skeletons"
          title="Skeleton group"
          description="Shimmer stays parked until you explicitly replay it, and pauses off-screen."
          storyId={STORY_IDS.skeletons}
        >
          <SkeletonDemo />
        </BentoTile>

        <BentoTile
          index={11}
          slug="switch-chips"
          title="Switch + chips"
          description="Two selection patterns with native button semantics and visible state."
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
          <a className="component-story-link" href={storyUrl} target="_blank" rel="noopener">
            Storybook <span aria-hidden="true">→</span>
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
  const { ref, mounted } = useLazyMount<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={["component-lazy", className].filter(Boolean).join(" ")}
      data-lazy-state={mounted ? "mounted" : "pending"}
      data-testid={testId}
      aria-busy={!mounted}
    >
      {mounted ? children : <span className="component-lazy-placeholder">Live demo loads as you approach.</span>}
    </div>
  );
}

function ImageViewerDemo({ theme }: { theme: TKTheme }) {
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
              aria-label={`Open ${image.alt}`}
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
        <p className="component-demo-hint">Open a preview · double-tap to zoom · swipe down to close</p>
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
            <strong>Enter wallet PIN</strong>
            <span>Hint: 1234</span>
          </span>
        }
      />
      <p className="component-status" data-state={result} data-testid="pin-result" role="status" aria-live="polite">
        {result === "success" ? "PIN accepted" : result === "error" ? "Try 1234" : "Four digits, checked locally"}
      </p>
    </div>
  );
}

function GalleryDemo() {
  return (
    <TKGallery height={184} edgeInset={0} gap={10} haptics={false} testId="bento-gallery">
      {["Signal", "Orbit", "Current"].map((label, index) => (
        <div key={label} className="gallery-slide" data-variant={index}>
          <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
          <strong>{label}</strong>
          <small>Swipe to continue</small>
        </div>
      ))}
    </TKGallery>
  );
}

function NoticeBarDemo() {
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
          UIKit 2.4 is ready: accessible controls, Telegram runtime adapters, tuned gesture physics, and no runtime dependencies. Read the migration notes before upgrading.
        </TKNoticeBar>
      ) : (
        <TKButton size="sm" variant="tonal" onClick={() => setVisible(true)}>
          Restore notice
        </TKButton>
      )}
      <p className="component-demo-hint" aria-live="polite">
        {playback.active ? "Ticker running in view" : "Ticker parked"}
      </p>
    </div>
  );
}

function ChatDemo() {
  return (
    <div className="chat-demo" data-testid="chat-demo">
      <div className="chat-demo-header">
        <strong>UIKit support</strong>
        <span>online</span>
      </div>
      <div className="chat-demo-thread">
        <TKMessages
          messages={[
            { id: "delivery", text: "Your Mini App preview is ready.", time: "12:01" },
            { id: "theme", text: "Does it follow Telegram themes?", out: true, time: "12:02", status: "read" },
          ]}
          testId="bento-messages"
        />
        <TKMessageBubble text="Yes — switch the page theme above." time="12:03" />
      </div>
    </div>
  );
}

function ConfettiDemo() {
  const [burst, setBurst] = useState<number | null>(null);

  return (
    <div className="confetti-demo" data-confetti-state={burst == null ? "idle" : "running"} data-testid="confetti-demo">
      <div className="confetti-demo-copy">
        <strong>{burst == null ? "Ready for a reward" : "Burst in progress"}</strong>
        <span role="status" aria-live="polite">{burst == null ? "Canvas is unmounted" : "Canvas mounted"}</span>
      </div>
      <TKButton size="sm" onClick={() => setBurst((current) => (current ?? 0) + 1)}>
        Fire confetti
      </TKButton>
      {burst == null ? null : (
        <TKConfetti key={burst} count={32} duration={900} onDone={() => setBurst(null)} testId="bento-confetti" />
      )}
    </div>
  );
}

function SheetDemo({ theme }: { theme: TKTheme }) {
  const [open, setOpen] = useState(false);

  return (
    <TKProvider theme={theme} className="component-frame-provider">
      <div className="sheet-demo-stage" data-tk-portal-root data-testid="sheet-demo" data-sheet-open={open}>
        <div className="sheet-demo-launcher">
          <TKButton onClick={() => setOpen(true)}>Open sheet</TKButton>
          <span>Drag the handle or press Escape</span>
        </div>
        <TKSheet open={open} onClose={() => setOpen(false)} title="Saved view" testId="bento-sheet">
          <p className="sheet-demo-line">Filters stay on this device.</p>
        </TKSheet>
      </div>
    </TKProvider>
  );
}

function CalendarDemo() {
  const [date, setDate] = useState(new Date(2026, 5, 13));
  const selected = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);

  return (
    <div className="calendar-demo" data-testid="calendar-demo">
      <TKCalendar
        value={date}
        onChange={setDate}
        defaultMonth={new Date(2026, 5, 1)}
        partSelectors={false}
        testId="bento-calendar"
        style={{ boxShadow: "none" }}
      />
      <p className="component-status" data-state="success" role="status" aria-live="polite">
        Selected {selected}
      </p>
    </div>
  );
}

function OTPDemo() {
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
        successText="Code accepted"
        resendLabel="Reset"
        testId="bento-otp"
      />
      <p className="component-status" data-state={verified ? "success" : "idle"} role="status" aria-live="polite">
        {verified ? "OTP complete" : "Type any four digits"}
      </p>
    </div>
  );
}

function SliderDemo() {
  const [value, setValue] = useState(64);

  return (
    <div className="slider-demo">
      <div className="slider-demo-value">
        <span>Intensity</span>
        <output aria-live="polite">{value}%</output>
      </div>
      <TKSlider value={value} onChange={setValue} label="Demo intensity" suffix="%" marks={[0, 25, 50, 75, 100]} testId="bento-slider" />
    </div>
  );
}

function SkeletonDemo() {
  const playback = useViewportActivity<HTMLDivElement>();
  const [replay, setReplay] = useState(0);
  const [running, setRunning] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);
  const frameRef = useRef<number | undefined>(undefined);
  const shimmerState = playback.reduced
    ? "reduced"
    : running && playback.inViewport
      ? "running"
      : "paused";

  useEffect(
    () => () => {
      window.clearTimeout(timerRef.current);
      window.cancelAnimationFrame(frameRef.current ?? 0);
    },
    [],
  );

  const replayShimmer = () => {
    window.clearTimeout(timerRef.current);
    window.cancelAnimationFrame(frameRef.current ?? 0);
    setRunning(false);
    frameRef.current = window.requestAnimationFrame(() => {
      setReplay((current) => current + 1);
      setRunning(true);
      timerRef.current = window.setTimeout(() => setRunning(false), 1350);
    });
  };

  return (
    <div
      ref={playback.ref}
      className="skeleton-demo"
      data-shimmer-state={shimmerState}
      data-testid="skeleton-demo"
    >
      <div key={replay} className="skeleton-demo-group" aria-hidden="true">
        <TKSkeletonCard />
        <TKSkeletonText lines={3} />
      </div>
      <TKButton size="sm" variant="outline" onClick={replayShimmer}>
        Reload preview
      </TKButton>
    </div>
  );
}

const channelOptions = [
  { value: "orders", label: "Orders" },
  { value: "product", label: "Product" },
  { value: "security", label: "Security" },
];

function SwitchChipsDemo() {
  const [notifications, setNotifications] = useState(true);
  const [channels, setChannels] = useState<string[]>(["orders", "security"]);

  return (
    <div className="switch-chips-demo">
      <TKSwitch checked={notifications} onChange={setNotifications} label="Push notifications" />
      <TKChipGroup
        items={channelOptions}
        multi
        value={channels}
        onChange={(next) => setChannels(next as string[])}
        aria-label="Notification channels"
        testId="bento-chip-group"
      />
      <p className="component-status" data-state={notifications ? "success" : "idle"} role="status" aria-live="polite">
        {notifications ? `${channels.length} channels enabled` : "Notifications paused"}
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
  const [images, setImages] = useState<TKImageViewerImage[]>([]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    setImages(buildTokenImages(host));
  }, [accent, hostRef, theme]);

  return images;
}

function buildTokenImages(host: HTMLElement): TKImageViewerImage[] {
  const tokenNames = [
    "--tk-accent",
    "--tk-surface-2",
    "--tk-green",
    "--tk-orange",
    "--tk-purple",
    "--tk-text",
  ];
  const colors = tokenNames.map((name) => resolveTokenColor(host, name));
  const labels = ["Signal", "Orbit", "Current"];

  return labels.map((label, index) => {
    const first = colors[index];
    const second = colors[index + 1];
    const third = colors[index + 2];
    const ink = colors[5];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-label="${label} composition">
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
      alt: `${label} token composition`,
    };
  });
}

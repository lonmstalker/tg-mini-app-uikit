import type { Dispatch, RefObject, SetStateAction } from "react";
import {
  TK_ICON_NAMES, TKAvatar, TKAvatarStack, TKBadge, TKBars, TKBlockquote, TKBottomBar, TKButton, TKCaption, TKCard,
  TKCardCell, TKCell, TKChip, TKConfetti, TKCounter, TKEmptyState, TKFrame, TKGallery, TKHeader, TKIcon, TKIconButton,
  TKImg, TKInput, TKListGroup, TKLocaleProvider, TKMainButton, TKMessages, TKMultiselect, TKOnboardingTooltip, TKPage,
  TKPaymentSummary, TKPopper, TKProductCardA, TKProgress, TKPullToRefresh, TKRing, TKSafeArea, TKSearch, TKSkeletonCard,
  TKSkeletonList, TKSkeletonText, TKSlotPicker, TKSpinner, TKSpoiler, TKStepper, TKSwipeCell, TKTimeline, TKTitle, TKText,
  TKVirtualList, TKWalletConnectButton, TKWalletStatusCell, TKWriteBar, TKXPHeader, ruLocale, type TKMessage,
} from "tg-mini-app-uikit";
import type { useTKToast } from "tg-mini-app-uikit";
import { productPhoto } from "../shop/data";
import { LONG_TITLE, Section } from "./shared";
import { MATRIX_VARIANTS, MatrixRow, TgThemeBlock } from "./theme-sections";

interface GalleryAdvancedProps {
  toast: ReturnType<typeof useTKToast>;
  iconQuery: string;
  setIconQuery: (value: string) => void;
  progress: number;
  setProgress: (value: number) => void;
  ring: number;
  setRing: (value: number) => void;
  setSheetOpen: (open: boolean) => void;
  setDialogOpen: (open: boolean) => void;
  setActionsOpen: (open: boolean) => void;
  ptrCount: number;
  setPtrCount: Dispatch<SetStateAction<number>>;
  rows: string[];
  setRows: Dispatch<SetStateAction<string[]>>;
  setSnapSheetOpen: (open: boolean) => void;
  popperOpen: boolean;
  setPopperOpen: Dispatch<SetStateAction<boolean>>;
  popperAnchor: RefObject<HTMLSpanElement | null>;
  chatMessages: TKMessage[];
  setChatMessages: Dispatch<SetStateAction<TKMessage[]>>;
  tourTarget1: RefObject<HTMLButtonElement | null>;
  tourTarget2: RefObject<HTMLButtonElement | null>;
  tourRun: number;
  setTourRun: Dispatch<SetStateAction<number>>;
  confetti: boolean;
  setConfetti: (open: boolean) => void;
}

export function GalleryAdvanced({
  toast,
  iconQuery,
  setIconQuery,
  progress,
  setProgress,
  ring,
  setRing,
  setSheetOpen,
  setDialogOpen,
  setActionsOpen,
  ptrCount,
  setPtrCount,
  rows,
  setRows,
  setSnapSheetOpen,
  popperOpen,
  setPopperOpen,
  popperAnchor,
  chatMessages,
  setChatMessages,
  tourTarget1,
  tourTarget2,
  tourRun,
  setTourRun,
  confetti,
  setConfetti,
}: GalleryAdvancedProps) {
  return (
    <>
        <Section title="Icons · search & copy">
          <TKSearch placeholder="Filter icons…" value={iconQuery} onChange={setIconQuery} testId="demo-icon-search" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(64px, 1fr))", gap: 6 }}>
            {TK_ICON_NAMES.filter((n) => n.toLowerCase().includes(iconQuery.toLowerCase())).map((name) => (
              <button
                key={name}
                type="button"
                className="tk-press"
                title={name}
                onClick={() => {
                  void navigator.clipboard?.writeText(name).catch(() => {});
                  toast.show({ icon: "copy", text: name });
                }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 5,
                  padding: "10px 2px",
                  border: "none",
                  borderRadius: "var(--tk-r-sm)",
                  background: "var(--tk-surface)",
                  color: "var(--tk-text)",
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              >
                <TKIcon name={name} size={20} />
                <span style={{ fontSize: "var(--tk-fz-caption2)", color: "var(--tk-text-3)", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</span>
              </button>
            ))}
          </div>
        </Section>

        <Section title="Display 2.0 · avatars, spoiler, quote, carousel">
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <TKAvatarStack avatars={[{ initials: "AK" }, { initials: "BL", tone: "linear-gradient(135deg,#7c5cff,#5436c9)" }, { initials: "CM", tone: "linear-gradient(135deg,#1fab66,#127a47)" }, { initials: "DN" }, { initials: "EO" }]} max={3} testId="demo-avatar-stack" />
            <TKAvatar initials="ON" status="online" />
            <TKAvatar initials="OF" status="offline" />
            <TKIconButton icon="bell" label="Alerts" badge={7} />
            <TKIconButton icon="chat" label="Chats" badge />
            <TKCounter value={1280} max={99} />
          </div>
          <TKBlockquote author="Anna" icon={<TKIcon name="reply" size={14} />}>
            Спойлер ниже скрыт от ридеров до тапа — телеграм-паттерн.
          </TKBlockquote>
          <div style={{ fontSize: "var(--tk-fz-sub)" }}>
            Промокод: <TKSpoiler testId="demo-spoiler">SPRING-2026</TKSpoiler>
          </div>
          <TKSkeletonText lines={3} />
          <TKGallery testId="demo-carousel">
            {[1, 2, 3].map((n) => (
              <TKCard key={n} padding={0}>
                <TKImg label={`slide ${n}`} ratio="2 / 1" />
              </TKCard>
            ))}
          </TKGallery>
          <TKFrame height={230} testId="demo-collapsing">
            <TKPage header={<TKHeader large collapsing title="Collapsing" subtitle="scroll the list" back={false} />} safeTop={false}>
              {Array.from({ length: 12 }).map((_, i) => (
                <TKCell key={i} icon="document" title={`Row ${i + 1}`} />
              ))}
            </TKPage>
          </TKFrame>
          <div>
            <TKCaption uppercase>Virtual list · 10 000 rows</TKCaption>
            <TKVirtualList
              items={Array.from({ length: 10000 }, (_, i) => `Item ${i + 1}`)}
              itemHeight={44}
              height={200}
              renderItem={(item) => <TKCell title={item} icon="grid" />}
              testId="demo-virtual"
              style={{ background: "var(--tk-surface)", borderRadius: "var(--tk-r-md)" }}
            />
          </div>
        </Section>

        <Section title="Feedback · loading">
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <TKSpinner size={18} />
            <TKSpinner size={26} />
            <TKSpinner size={34} />
          </div>
          <TKProgress value={progress} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "var(--tk-fz-caption)", color: "var(--tk-text-2)", fontVariantNumeric: "tabular-nums" }}>{progress}%</span>
            <TKButton size="sm" variant="tonal" pill onClick={() => setProgress(Math.round(Math.random() * 100))}>Randomize</TKButton>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <TKSkeletonCard />
            <TKSkeletonCard />
          </div>
          <TKSkeletonList />
        </Section>

        <Section title="Data">
          <div style={{ background: "var(--tk-surface)", borderRadius: "var(--tk-r-lg)", boxShadow: "var(--tk-shadow-sm)", padding: 14 }}>
            <TKBars data={[42, 70, 55, 90, 62, 100, 78]} labels={["M", "T", "W", "T", "F", "S", "S"]} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <TKRing value={ring} />
            <TKButton size="sm" variant="tonal" pill onClick={() => setRing(Math.random())}>Randomize</TKButton>
          </div>
        </Section>

        <Section title="Empty states">
          <TKEmptyState title="Your cart is empty" text="Browse the catalog and add something you like." cta="Go to catalog" onCta={() => toast.show({ text: "Catalog opened" })} />
          <TKEmptyState icon="search" title="Nothing found" text="Try a different query or clear the filters." cta="Clear filters" tone="red" />
        </Section>

        <Section title="Overlays · toasts">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <TKButton variant="tonal" onClick={() => setSheetOpen(true)}>Bottom sheet</TKButton>
            <TKButton variant="destructive" onClick={() => setDialogOpen(true)}>Dialog</TKButton>
            <TKButton variant="surface" onClick={() => setActionsOpen(true)}>Action sheet</TKButton>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <TKButton size="sm" variant="tonal" onClick={() => toast.success("Order placed")}>Success toast</TKButton>
            <TKButton size="sm" variant="destructive" onClick={() => toast.error("Payment failed")}>Error toast</TKButton>
            <TKButton size="sm" variant="surface" onClick={() => toast.show({ icon: "trash", text: "Item removed", action: "Undo", onAction: () => toast.success("Restored") })}>
              Undo snackbar
            </TKButton>
          </div>
        </Section>

        <Section title="Gestures · pull-to-refresh, swipe actions, snap sheet">
          <TKFrame height={210} testId="demo-ptr-frame">
            <TKPullToRefresh
              testId="demo-ptr"
              onRefresh={() => new Promise((resolve) => setTimeout(() => { setPtrCount((n) => n + 1); resolve(undefined); }, 350))}
            >
              <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                <TKCaption uppercase>Pulled to refresh: <span data-demo-ptr-count>{ptrCount}</span> times</TKCaption>
                <TKListGroup>
                  <TKCell icon="clock" title="Drag the list down" subtitle="release past the arrow flip" />
                  <TKCell icon="bolt" title="Resistance curve" subtitle="raw delta × 0.5" />
                </TKListGroup>
              </div>
            </TKPullToRefresh>
          </TKFrame>
          <TKListGroup footer="Swipe a row left for actions; the buttons are keyboard-reachable too.">
            {rows.map((row) => (
              <TKSwipeCell
                key={row}
                testId={`demo-swipe-${row.replace(/\s+/g, "-").toLowerCase()}`}
                trailing={[
                  { label: "Archive", icon: "gift", tone: "accent", onAction: () => toast.show({ text: `${row} archived` }) },
                  { label: "Delete", icon: "trash", tone: "red", onAction: () => setRows((r) => r.filter((x) => x !== row)) },
                ]}
              >
                <TKCell icon="cart" title={row} subtitle="swipe left" />
              </TKSwipeCell>
            ))}
          </TKListGroup>
          <TKButton variant="tonal" onClick={() => setSnapSheetOpen(true)}>Snap-point sheet</TKButton>
        </Section>

        <Section title="Popper · anchored positioning" lazy={false}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span ref={popperAnchor} style={{ display: "inline-flex" }}>
              <TKButton variant="tonal" onClick={() => setPopperOpen((open) => !open)}>
                {popperOpen ? "Close popper" : "Open popper"}
              </TKButton>
            </span>
            <span style={{ fontSize: "var(--tk-fz-caption)", color: "var(--tk-text-2)" }}>
              `TKPopper` used directly — same primitive that powers `TKTooltip`.
            </span>
          </div>
          <TKPopper open={popperOpen} anchorRef={popperAnchor} placement="bottom" onClose={() => setPopperOpen(false)}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 200 }}>
              <TKCardCell compact title="Reorder" subtitle="Same items, same address" before={<TKAvatar initials="🛒" size={28} tone="var(--tk-accent-12)" />} />
              <TKCardCell compact title="Share receipt" subtitle="PDF · 84 KB" before={<TKAvatar initials="📄" size={28} tone="var(--tk-accent-12)" />} />
            </div>
          </TKPopper>
        </Section>

        <Section title="Stress · long content">
          <TKListGroup footer="Cells truncate gracefully; counters and badges stay readable.">
            <TKCell icon="cart" title={LONG_TITLE} subtitle="An equally long subtitle that has no business fitting on one line either" chevron badge="999+" onClick={() => {}} />
          </TKListGroup>
          <TKProductCardA title={LONG_TITLE} price="$1,248.50" src={productPhoto("🏺", "#fbc2eb", "#a18cd1")} onAdd={() => toast.success("Added")} />
          <TKButton full>Continue to the next step of the extremely long checkout flow</TKButton>
        </Section>

        <Section title="Stress locales · RTL, CJK, long words">
          <div dir="rtl" lang="ar" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <TKButton>إرسال الطلب</TKButton>
              <TKButton variant="tonal">إلغاء</TKButton>
              <TKChip selected>توصيل سريع</TKChip>
            </div>
            <TKInput label="الاسم الكامل" placeholder="أدخل اسمك الكامل" icon="user" />
            <TKListGroup>
              <TKCell icon="user" title="הגדרות חשבון" subtitle="עברית · מימין לשמאל" chevron onClick={() => {}} />
            </TKListGroup>
          </div>
          <div lang="ja" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <TKListGroup>
              <TKCell icon="cart" title="配送状況を確認する" subtitle="注文番号 1042 · 約25分で到着" badge="2" chevron onClick={() => {}} />
            </TKListGroup>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <TKButton>立即购买</TKButton>
              <TKChip selected>新着商品</TKChip>
              <TKChip>限定セール</TKChip>
            </div>
          </div>
          <div lang="de" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <TKButton full>Donaudampfschifffahrtsgesellschaftskapitän kontaktieren</TKButton>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <TKChip>Kraftfahrzeug-Haftpflichtversicherung</TKChip>
              <TKChip selected removable>Grundstücksverkehrsgenehmigung</TKChip>
            </div>
            <TKListGroup footer="Long compound words must wrap or truncate without breaking the cell layout.">
              <TKCell
                icon="card"
                title="Rindfleischetikettierungsüberwachungsaufgabenübertragungsgesetz"
                subtitle="Grundstücksverkehrsgenehmigungszuständigkeitsübertragungsverordnung"
                chevron
                onClick={() => {}}
              />
            </TKListGroup>
          </div>
        </Section>

        <Section title="Chat · messages & write bar">
          <TKFrame height={320} testId="demo-chat">
            <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 12 }}>
              <TKMessages messages={chatMessages} />
            </div>
            <TKWriteBar
              placeholder="Message"
              safeArea={false}
              onSend={(text) =>
                setChatMessages((m) => [...m, { id: String(m.length + 1), text, out: true, time: "12:04", status: "sent" }])
              }
            />
          </TKFrame>
        </Section>

        <Section title="Wow · onboarding tour, confetti" lazy={false}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <TKButton ref={tourTarget1} variant="tonal" onClick={() => setTourRun((n) => n + 1)} testId="demo-start-tour">
              Start tour
            </TKButton>
            <TKButton ref={tourTarget2} variant="surface" onClick={() => setConfetti(true)} testId="demo-confetti-btn">
              Confetti 🎉
            </TKButton>
          </div>
          {tourRun > 0 ? (
            <TKOnboardingTooltip
              key={tourRun}
              steps={[
                { target: tourTarget1, title: "Coach marks", text: "Шаг подсвечивает цель через вырез в скриме." },
                { target: tourTarget2, title: "Микро-награды", text: "А эта кнопка запускает конфетти." },
              ]}
              testId="demo-tour"
            />
          ) : null}
          {confetti ? <TKConfetti onDone={() => setConfetti(false)} testId="demo-confetti" /> : null}
        </Section>

        <Section title="Patterns">
          <TKWalletConnectButton connected address="EQD4...9f2A" onClick={() => toast.success("External wallet adapter slot")} />
          <TKWalletStatusCell
            walletName="Tonkeeper"
            address="EQD4...9f2A"
            connected
            status={<TKBadge tone="green" soft>12.4 TON</TKBadge>}
            onClick={() => toast.show({ text: "Wallet cell passed to host app" })}
          />
          <TKSlotPicker
            days={[{ label: "Mon", date: 15 }, { label: "Tue", date: 16 }, { label: "Wed", date: 17 }, { label: "Thu", date: 18 }, { label: "Fri", date: 19 }, { label: "Sat", date: 20 }]}
            slots={["10:00", "10:45", "11:30", "12:15", "14:30", "15:15"]}
            busy={["10:45", "14:30"]}
            defaultDay={4}
            defaultSlot="15:15"
          />
          <TKPaymentSummary
            rows={[
              { label: "Subtotal", value: "$46.00" },
              { label: "Delivery", value: "$3.50" },
              { label: "Promo SPRING24", value: "−$9.20", accent: true },
              { label: "Total", value: "$40.30", total: true },
            ]}
          />
          <TKXPHeader name="Anna K." initials="AK" level={12} xp={64} hint="640 / 1000 XP to level 13" />
          <TKTimeline
            steps={[
              { label: "Order placed", time: "12:02", status: "done" },
              { label: "Being prepared", time: "12:06", status: "done" },
              { label: "Courier on the way", time: "12:24", status: "active" },
              { label: "Delivered", time: "~12:45", status: "pending" },
            ]}
          />
        </Section>

        <Section title="Localization · TKLocaleProvider">
          <TKCaption uppercase>ru preset</TKCaption>
          <TKLocaleProvider locale={ruLocale}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <TKSearch />
              <TKMultiselect label="Интересы" options={["дизайн", "код", "музыка"]} />
              <TKStepper defaultValue={2} />
              <TKMainButton label="Оплатить" status="success" />
            </div>
          </TKLocaleProvider>
          <TKCaption uppercase>partial override · prop wins</TKCaption>
          <TKLocaleProvider locale={{ search: "Find anything…" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <TKSearch />
              <TKSearch placeholder="Prop beats provider" />
            </div>
          </TKLocaleProvider>
        </Section>

        <Section title="Layout · page, safe area, bottom bar">
          <TKFrame height={360}>
            <TKPage
              header={<TKHeader title="Order #1042" subtitle="arrives in ~25 min" back={false} />}
              footer={
                <TKBottomBar>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "var(--tk-fz-caption)", color: "var(--tk-text-2)" }}>Total</div>
                      <div style={{ fontSize: "var(--tk-fz-title3)", fontWeight: 700 }}>$40.30</div>
                    </div>
                    <TKButton pill icon="card">Checkout</TKButton>
                  </div>
                </TKBottomBar>
              }
            >
              <TKCard>
                <TKTitle level={3}>TKPage inside TKFrame</TKTitle>
                <TKText style={{ marginTop: 6 }}>
                  Pinned header, scrollable content and a pinned `TKBottomBar` — the full mini-app skeleton in one compact preview.
                </TKText>
              </TKCard>
              <TKListGroup>
                <TKCell icon="cart" title="Flat white × 2" value="$9.00" />
                <TKCell icon="gift" iconBg="var(--tk-orange)" title="Cinnamon bun" value="$4.50" />
              </TKListGroup>
              <TKCaption>Scroll me — header and bottom bar stay pinned.</TKCaption>
            </TKPage>
          </TKFrame>
          <TKFrame height={170}>
            <TKSafeArea edges={["top", "bottom"]} style={{ height: "100%", padding: "0 12px" }}>
              <div
                style={{
                  height: "100%",
                  borderRadius: "var(--tk-r-md)",
                  background: "var(--tk-accent-06)",
                  border: "1.5px dashed var(--tk-accent-35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: 12,
                }}
              >
                <TKCaption>
                  `TKSafeArea` content area — pads away from cutouts and Telegram chrome (zero in a plain browser; boot with `?insets=1` to see it).
                </TKCaption>
              </div>
            </TKSafeArea>
          </TKFrame>
        </Section>

        <Section title="Theme matrix · accents, roundness, type">
          {MATRIX_VARIANTS.map((variant) => (
            <MatrixRow key={variant.label} label={variant.label} knobs={variant.knobs} />
          ))}
          <div style={{ fontSize: "var(--tk-fz-caption)", color: "var(--tk-text-2)" }}>
            Each row is a nested `TKProvider` overriding a single knob — accent, `roundness` or `fontSize`.
          </div>
        </Section>

        <Section title="Tg theme · Telegram palette inheritance">
          <TgThemeBlock scheme="light" />
          <TgThemeBlock scheme="dark" />
          <div style={{ fontSize: "var(--tk-fz-caption)", color: "var(--tk-text-2)" }}>
            `TKProvider telegram` adds the `.tk-tg` class, so tokens resolve from the host's `--tg-theme-*` variables (set inline here, exactly like the Telegram client does).
          </div>
        </Section>

    </>
  );
}

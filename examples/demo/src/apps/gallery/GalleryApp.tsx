import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  TK_ICON_NAMES,
  TKActionSheet,
  TKAccordion,
  TKAvatar,
  TKAvatarStack,
  TKBadge,
  TKBannerCard,
  TKBars,
  TKBlockquote,
  TKBookingCard,
  TKBottomBar,
  TKButton,
  TKCaption,
  TKCalendar,
  TKCategoryTabs,
  TKCard,
  TKCardCell,
  TKCardChip,
  TKCell,
  TKCheckbox,
  TKChipsInput,
  TKChip,
  TKChipGroup,
  TKCounter,
  TKDateInput,
  TKDialog,
  TKDot,
  TKEmptyState,
  TKFileInput,
  TKFormField,
  TKFormInput,
  TKFrame,
  TKGallery,
  TKHeader,
  TKIcon,
  TKIconButton,
  TKImage,
  TKImg,
  TKInlineButtons,
  TKInput,
  TKListGroup,
  TKLocaleProvider,
  TKMainButton,
  TKMultiselect,
  TKOTP,
  TKPage,
  TKPhoneInput,
  TKPinInput,
  TKPageDots,
  TKPaymentSummary,
  TKPopper,
  TKProductCardA,
  TKProductCardB,
  TKProgress,
  TKProvider,
  TKPullToRefresh,
  TKRadioGroup,
  TKRating,
  TKRing,
  TKSafeArea,
  TKSearch,
  TKSegmented,
  TKSelectable,
  TKSelect,
  TKSheet,
  TKSkeleton,
  TKSkeletonCard,
  TKSkeletonList,
  TKSkeletonText,
  TKSpoiler,
  TKSlider,
  TKSlotPicker,
  TKSwipeCell,
  ruLocale,
  TKSpinner,
  TKStatTile,
  TKStepper,
  TKSteps,
  TKSwitch,
  TKTabbar,
  TKTimeInput,
  TKVirtualList,
  TKTappable,
  TKText,
  TKTextarea,
  TKTimeline,
  TKTitle,
  TKTooltip,
  TKToastProvider,
  TKVisuallyHidden,
  TKWalletConnectButton,
  TKWalletStatusCell,
  TKXPHeader,
  useTKTheme,
  useTKToast,
  type TKThemeKnobs,
} from "tg-mini-app-uikit";
import { ACCENTS } from "../../shell/types";
import { productPhoto } from "../shop/data";

/* Components — a live gallery of everything the kit exports. */

const LONG_TITLE = "Hand-thrown stoneware mug with a reactive glaze, 350 ml, dishwasher safe";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function Section({
  title,
  children,
  pad = true,
  lazy = true,
}: {
  title: string;
  children: ReactNode;
  pad?: boolean;
  /** Skip offscreen layout/paint. Off for sections with overflowing popovers. */
  lazy?: boolean;
}) {
  return (
    <section
      data-demo-section={title.split("·")[0].trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        ...(lazy
          ? {
              contentVisibility: "auto" as const,
              containIntrinsicSize: "auto 320px",
              // paint-box buffer: focus rings, pulse rings and card shadows would otherwise clip
              padding: 10,
              margin: -10,
            }
          : null),
      }}
    >
      <div
        style={{
          fontSize: "var(--tk-fz-caption)",
          fontWeight: 600,
          letterSpacing: ".05em",
          textTransform: "uppercase",
          color: "var(--tk-text-3)",
          padding: pad ? 0 : "0 16px",
        }}
      >
        {title}
      </div>
      {children}
    </section>
  );
}

/* ---- theme matrix: representative components under nested TKProvider knobs ---- */

const MATRIX_VARIANTS: { label: string; knobs: TKThemeKnobs }[] = [
  ...ACCENTS.map((accent) => ({ label: `accent ${accent}`, knobs: { accent } })),
  { label: "round 0.4", knobs: { roundness: 0.4 } },
  { label: "round 1", knobs: { roundness: 1 } },
  { label: "round 1.6", knobs: { roundness: 1.6 } },
  { label: "font 14", knobs: { fontSize: 14 } },
  { label: "font 19", knobs: { fontSize: 19 } },
];

function MatrixRow({ label, knobs }: { label: string; knobs: TKThemeKnobs }) {
  // Nested providers default to light — inherit the shell's current scheme.
  const { theme } = useTKTheme();
  return (
    <div data-demo-matrix-row={label}>
      <TKProvider theme={theme} {...knobs} style={{ background: "transparent" }}>
        <TKCard padding={10} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 92,
              flexShrink: 0,
              fontSize: "var(--tk-fz-caption2)",
              fontWeight: 600,
              color: "var(--tk-text-3)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {label}
          </span>
          <TKButton size="sm">Pay</TKButton>
          <TKButton size="sm" variant="tonal">Edit</TKButton>
          <div style={{ flex: 1, minWidth: 0 }}>
            <TKInput placeholder="Promo" />
          </div>
          <TKSwitch defaultChecked ariaLabel={`Switch · ${label}`} />
        </TKCard>
      </TKProvider>
    </div>
  );
}

/* ---- Telegram theme mode: `.tk-tg` resolves tokens from --tg-theme-* ---- */

const TG_PALETTES: Record<"light" | "dark", Record<string, string>> = {
  // Mirrors the demo Telegram mock (examples/demo/src/telegram/mock.ts).
  light: {
    bg_color: "#ffffff",
    secondary_bg_color: "#eef1f6",
    section_bg_color: "#ffffff",
    section_separator_color: "#e3e7ee",
    text_color: "#131c26",
    subtitle_text_color: "#57636f",
    hint_color: "#646e79",
    link_color: "#3390ec",
    button_color: "#3390ec",
    button_text_color: "#ffffff",
    destructive_text_color: "#e5484d",
  },
  dark: {
    bg_color: "#17212b",
    secondary_bg_color: "#0e1621",
    section_bg_color: "#17212b",
    section_separator_color: "#202c39",
    text_color: "#f3f6f9",
    subtitle_text_color: "#aebbc9",
    hint_color: "#95a3b2",
    link_color: "#3390ec",
    button_color: "#3390ec",
    button_text_color: "#ffffff",
    destructive_text_color: "#ff6166",
  },
};

/** `bg_color` → `--tg-theme-bg-color`, exactly how the Telegram client injects them. */
function tgVars(palette: Record<string, string>): CSSProperties {
  return Object.fromEntries(
    Object.entries(palette).map(([key, value]) => [`--tg-theme-${key.replace(/_/g, "-")}`, value]),
  ) as CSSProperties;
}

function TgThemeBlock({ scheme }: { scheme: "light" | "dark" }) {
  return (
    <div data-demo-tg-scheme={scheme} style={{ ...tgVars(TG_PALETTES[scheme]), borderRadius: "var(--tk-r-lg)", overflow: "hidden" }}>
      <TKProvider theme={scheme} telegram style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "var(--tk-fz-sub)", fontWeight: 700, flex: 1 }}>
            Telegram {scheme} palette
          </span>
          <TKBadge soft>tk-tg</TKBadge>
        </div>
        <TKListGroup>
          <TKCell icon="user" title="Anna Karlova" subtitle="@annak · Premium" chevron onClick={() => {}} />
          <TKCell icon="bell" title="Notifications" defaultToggle />
        </TKListGroup>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <TKButton size="sm">button_color</TKButton>
          <TKButton size="sm" variant="destructive">destructive</TKButton>
          <span style={{ fontSize: "var(--tk-fz-caption)", color: "var(--tk-text-3)" }}>hint_color</span>
        </div>
      </TKProvider>
    </div>
  );
}

export function GalleryApp() {
  return (
    <TKToastProvider offset={20}>
      <GalleryInner />
    </TKToastProvider>
  );
}

function GalleryInner() {
  const toast = useTKToast();
  const [seg, setSeg] = useState("Delivery");
  const [steps, setSteps] = useState(1);
  const [page, setPage] = useState(0);
  const [progress, setProgress] = useState(64);
  const [ring, setRing] = useState(0.72);
  const [counter, setCounter] = useState(3);
  const [inline, setInline] = useState("pickup");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [popperOpen, setPopperOpen] = useState(false);
  const popperAnchor = useRef<HTMLSpanElement>(null);
  const [snapSheetOpen, setSnapSheetOpen] = useState(false);
  const [ptrCount, setPtrCount] = useState(0);
  const [rows, setRows] = useState(["Flat white", "Cinnamon bun", "Filter brew"]);
  const [iconQuery, setIconQuery] = useState("");
  const [pinStatus, setPinStatus] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([20, 70]);

  return (
    <div data-demo-app="gallery" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "64px 16px 8px" }}>
        <div style={{ fontSize: "var(--tk-fz-title1)", fontWeight: 700, letterSpacing: "-.02em" }}>Components</div>
        <div style={{ fontSize: "var(--tk-fz-sub)", color: "var(--tk-text-2)" }}>
          Every kit component, fully interactive
        </div>
      </div>

      <div data-demo-gallery-scroll style={{ flex: 1, overflow: "auto" }}>
        <div style={{ padding: "8px 16px 32px", display: "flex", flexDirection: "column", gap: 22 }}>
        <Section title="Buttons · variants & sizes">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <TKButton variant="filled">Filled</TKButton>
            <TKButton variant="tonal">Tonal</TKButton>
            <TKButton variant="plain">Plain</TKButton>
            <TKButton variant="outline">Outline</TKButton>
            <TKButton variant="surface">Surface</TKButton>
            <TKButton variant="destructive">Delete</TKButton>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <TKButton size="sm">Small</TKButton>
            <TKButton size="md">Medium</TKButton>
            <TKButton size="lg">Large</TKButton>
            <TKButton disabled>Disabled</TKButton>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <TKButton pill icon="bolt">Boost</TKButton>
            <TKIconButton icon="heart" variant="filled" label="Like" />
            <TKIconButton icon="share" variant="tonal" label="Share" />
            <TKIconButton icon="bell" variant="surface" label="Alerts" />
            <TKIconButton icon="plus" variant="filled" size={56} label="Add" style={{ boxShadow: "0 10px 24px -6px var(--tk-accent-35)" }} />
          </div>
        </Section>

        <Section title="Main button · promise-driven state machine">
          <TKMainButton label="Pay $24.00" successLabel="Paid" onClick={() => sleep(1400)} />
        </Section>

        <Section title="Selection controls">
          <div style={{ background: "var(--tk-surface)", borderRadius: "var(--tk-r-md)", boxShadow: "var(--tk-shadow-sm)", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
            <TKSwitch label="Notifications" defaultChecked />
            <TKCheckbox label="Save card for later" defaultChecked />
            <TKRadioGroup
              options={[
                "Standard delivery",
                "Express delivery",
                { value: "Pickup", label: "Pickup — temporarily unavailable", disabled: true },
              ]}
            />
          </div>
        </Section>

        <Section title="Slider · stepper · rating">
          <TKSlider defaultValue={60} suffix="%" label="Percentage" />
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <TKStepper defaultValue={1} />
            <TKRating defaultValue={3} />
          </div>
        </Section>

        <Section title="Steps · page dots">
          <TKSteps steps={["Cart", "Address", "Pay", "Done"]} current={steps} onStepClick={setSteps} />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <TKPageDots count={4} page={page} onChange={setPage} />
            <TKButton variant="tonal" size="sm" pill onClick={() => setPage(Math.max(0, page - 1))}>Back</TKButton>
            <TKButton size="sm" pill onClick={() => setPage(Math.min(3, page + 1))}>Next</TKButton>
          </div>
        </Section>

        <Section title="Inputs" lazy={false}>
          <TKInput label="Full name" placeholder="Anna Karlova" icon="user" />
          <TKInput label="Promo code" placeholder="SPRING24" icon="ticket" hint="Applied at checkout" />
          <TKInput label="Card number" placeholder="4242 4242 4242 4242" icon="card" error="Check the card number" defaultValue="4242 11" />
          <TKSearch />
          <TKSelect
            label="City"
            options={[
              "Lisbon",
              "Berlin",
              { value: "Tbilisi", disabled: true },
              "Belgrade",
              { value: "Yerevan", icon: "location" },
            ]}
          />
        </Section>

        <Section title="Form primitives" lazy={false}>
          <TKFormInput label="Apartment" placeholder="12B" icon="home" hint="Shown through the form alias" />
          <TKTextarea
            label="Courier note"
            placeholder="Leave the order at reception"
            defaultValue="Please call before arrival."
            maxLength={120}
            rows={3}
          />
          <TKMultiselect
            label="Preferences"
            defaultValue={["Coffee", "Desserts"]}
            options={[
              { value: "Coffee", icon: "ticket" },
              { value: "Tea", icon: "gift" },
              "Desserts",
              { value: "Merch", disabled: true },
            ]}
            hint="Multi-select keeps chips readable in narrow viewports."
          />
          <TKFormField label="Delivery channel" hint="Selectable rows work as form rows or standalone cells.">
            <div style={{ background: "var(--tk-surface)", borderRadius: "var(--tk-r-md)", boxShadow: "var(--tk-shadow-sm)", overflow: "hidden" }}>
              <TKSelectable label="Telegram updates" subtitle="Fastest status notifications" defaultChecked icon="bell" />
              <div style={{ height: 0.5, background: "var(--tk-sep)", marginLeft: 50 }} />
              <TKSelectable label="Email receipt" subtitle="Send PDF after payment" icon="ticket" />
            </div>
          </TKFormField>
          <TKFileInput label="Receipt attachment" accept="image/*,.pdf" multiple />
        </Section>

        <Section title="Forms 2.0 · calendar, masks, pin, tags">
          <TKCalendar mode="range" defaultMonth={new Date(2026, 5, 1)} defaultRange={[new Date(2026, 5, 9), new Date(2026, 5, 13)]} testId="demo-calendar" />
          <TKDateInput label="Appointment" placeholder="Pick a date" defaultValue={new Date(2026, 5, 18)} testId="demo-date-input" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <TKTimeInput label="Time" placeholder="hh:mm" defaultValue="0930" />
            <TKPhoneInput label="Phone" placeholder="+7 (___) ___-__-__" />
          </div>
          <TKChipsInput label="Tags" placeholder="Add a tag…" defaultValue={["design", "react"]} testId="demo-chips-input" />
          <TKSelect label="City (searchable, groups)" searchable options={[
            { label: "Europe", options: ["Lisbon", "Berlin", "Belgrade"] },
            { label: "Asia", options: ["Tokyo", "Seoul"] },
          ]} testId="demo-search-select" />
          <TKMultiselect label="Toppings" selectAll options={["Cinnamon", "Caramel", "Oat milk"]} testId="demo-selectall" />
          <div>
            <TKCaption uppercase>Price range · {priceRange[0]}–{priceRange[1]}</TKCaption>
            <TKSlider range label="Price" defaultRange={[20, 70]} marks={[0, 25, 50, 75, 100]} onRangeChange={setPriceRange} />
          </div>
          <TKInput label="Password" type="password" placeholder="Enter password" maxLength={24} defaultValue="hunter2" />
          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <TKCheckbox indeterminate label="Partially selected" />
            <TKStepper editable defaultValue={4} max={50} />
            <TKRating readonly allowHalf defaultValue={3.5} />
          </div>
          <TKFileInput label="Attachment" dropZone progress={64} testId="demo-dropzone" />
          <TKCard padding={16}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <TKCaption uppercase>PIN · on-screen keypad {pinStatus ? `· ${pinStatus}` : ""}</TKCaption>
              <TKPinInput length={4} onComplete={(pin) => setPinStatus(`entered ${pin}`)} onBiometricRequest={() => setPinStatus("biometrics")} testId="demo-pin" />
            </div>
          </TKCard>
        </Section>

        <Section title="Composition primitives" lazy={false}>
          <TKCard>
            <TKTitle level={3}>Reusable layout block</TKTitle>
            <TKText style={{ marginTop: 6 }}>
              `TKCard`, `TKText` and `TKCaption` cover simple app surfaces without pulling product-card assumptions into forms.
            </TKText>
            <TKCaption style={{ marginTop: 8 }}>Zero runtime dependencies beyond React.</TKCaption>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
              <TKCardChip selected>iOS feel</TKCardChip>
              <TKCardChip tone="green">Telegram</TKCardChip>
              <TKCardChip tone="gray">React</TKCardChip>
            </div>
          </TKCard>
          <TKCard padding={6}>
            <TKCardCell
              before={<TKAvatar initials="TG" size={34} />}
              title="Wallet-ready row"
              subtitle="Use slots above TonConnect or any external adapter"
              after={<TKBadge tone="green" soft>Live</TKBadge>}
            />
            <TKCardCell
              compact
              title="Compact cell"
              subtitle="Good for settings, filters and nested cards"
              after={<TKButton size="sm" variant="tonal" pill>Open</TKButton>}
            />
          </TKCard>
          <TKAccordion
            title="FAQ"
            defaultValue={["shipping"]}
            items={[
              {
                id: "shipping",
                icon: "cart",
                title: "Delivery timing",
                subtitle: "Accordion row with icon",
                content: "Orders are dispatched from the closest pickup point and keep safe-area spacing intact.",
              },
              {
                id: "refund",
                icon: "card",
                iconBg: "var(--tk-orange)",
                title: "Refund policy",
                content: "Content expands inside the list group without layout jumps.",
              },
            ]}
          />
          <TKInlineButtons
            value={inline}
            onChange={setInline}
            items={[
              { id: "pickup", label: "Pickup", icon: "home" },
              { id: "courier", label: "Courier", icon: "location" },
              { id: "gift", label: "Gift", icon: "gift" },
            ]}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <TKTooltip content="Tooltip is powered by the generic TKPopper positioning primitive.">
              <TKButton variant="surface" size="sm" pill>Hover tooltip</TKButton>
            </TKTooltip>
            <TKTappable
              label="Track order"
              onClick={() => toast.show({ text: "Accessible tappable pressed" })}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: "var(--tk-r-pill)", background: "var(--tk-surface)" }}
            >
              <TKBadge tone="green" soft>Track</TKBadge>
              <TKVisuallyHidden>order status</TKVisuallyHidden>
            </TKTappable>
          </div>
        </Section>

        <Section title="OTP">
          <div style={{ background: "var(--tk-surface-2)", borderRadius: "var(--tk-r-lg)", padding: "18px 12px" }}>
            <TKOTP onResend={() => toast.success("Code sent again")} onComplete={() => toast.success("Code verified")} />
          </div>
        </Section>

        <Section title="Chips · badges · status">
          <TKChipGroup items={["All", "Coffee", "Tea", "Desserts"]} defaultValue="All" />
          <TKChipGroup
            items={[
              { value: "Vegan", icon: "heart" },
              "Spicy",
              "Gluten-free",
              { value: "New", disabled: true },
            ]}
            multi
            defaultValue={["Vegan"]}
          />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <TKChip selected removable onRemove={() => toast.error("Removed")}>Lisbon</TKChip>
            <TKChip icon="calendar" removable>Jun 19–21</TKChip>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <TKBadge>New</TKBadge>
            <TKBadge tone="green">Paid</TKBadge>
            <TKBadge tone="orange">Pending</TKBadge>
            <TKBadge tone="red">−31%</TKBadge>
            <TKBadge soft>New</TKBadge>
            <TKBadge tone="green" soft>Paid</TKBadge>
            <TKBadge tone="gray" soft>Draft</TKBadge>
          </div>
          <div style={{ display: "flex", gap: 18, alignItems: "center", fontSize: "var(--tk-fz-sub)" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><TKDot tone="green" pulse /> Online</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><TKDot tone="orange" /> Away</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><TKDot tone="gray" /> Offline</span>
            <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 10 }}>
              <TKCounter value={counter} />
              <TKButton size="sm" variant="tonal" pill onClick={() => setCounter(counter + 1)}>+1</TKButton>
            </span>
          </div>
        </Section>

        <Section title="Navigation" pad={false}>
          <div style={{ borderRadius: "var(--tk-r-md)", overflow: "hidden", boxShadow: "var(--tk-shadow-sm)", margin: "0 16px" }}>
            <TKHeader title="Checkout" subtitle="step 2 of 3" onBack={() => toast.show({ text: "Back tapped" })} actions={<TKIconButton icon="close" size={30} variant="surface" label="Close" style={{ background: "var(--tk-surface-2)", boxShadow: "none", color: "var(--tk-text-2)" }} />} />
          </div>
          <div style={{ padding: "0 16px" }}>
            <TKSegmented full options={["Delivery", "Pickup"]} value={seg} onChange={setSeg} />
          </div>
          <TKCategoryTabs tabs={["For you", "Popular", "Coffee", "Tea", "Desserts", "Merch"]} />
          <div style={{ borderRadius: "var(--tk-r-md)", overflow: "hidden", boxShadow: "var(--tk-shadow-sm)", margin: "0 16px" }}>
            <TKTabbar
              tabs={[
                { icon: "home", label: "Home" },
                { icon: "grid", label: "Catalog" },
                { icon: "cart", label: "Cart", count: 2 },
                { icon: "user", label: "Profile" },
              ]}
            />
          </div>
        </Section>

        <Section title="Lists & cells">
          <TKListGroup title="Account" footer="Receipts are stored for 24 months.">
            <TKCell icon="user" title="Profile" subtitle="Anna Karlova · @annak" chevron onClick={() => {}} />
            <TKCell icon="wallet" iconBg="var(--tk-green)" title="Payment methods" value="Visa ··42" chevron onClick={() => {}} />
            <TKCell icon="bell" iconBg="var(--tk-red)" title="Notifications" defaultToggle />
            <TKCell icon="cart" iconBg="var(--tk-orange)" title="Order history" badge="2" chevron onClick={() => {}} />
            <TKCell icon="trash" iconBg="var(--tk-red)" title="Delete account" danger onClick={() => setDialogOpen(true)} />
          </TKListGroup>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <TKAvatar initials="AK" />
            <TKAvatar initials="MS" tone="linear-gradient(135deg,#a26ae6,#6c5ce7)" />
            <TKAvatar initials="RB" size={32} tone="linear-gradient(135deg,#f0932b,#e17055)" />
          </div>
        </Section>

        <Section title="Cards">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <TKProductCardA title="Ceramic mug" price="$18" img="mug photo" onAdd={() => toast.success("Added")} />
            <TKProductCardA title="Linen tote" price="$32" img="tote photo" onAdd={() => toast.success("Added")} />
          </div>
          <TKProductCardB
            title="Wireless headphones"
            price="$89"
            oldPrice="$129"
            discount="−31%"
            rating="4.8"
            reviews="212 reviews"
            img="product photo"
            onAdd={() => toast.success("Added to cart")}
          />
          <TKBannerCard title="Spring sale" text="Up to 40% off on selected items this week" cta="Browse deals" onCta={() => toast.show({ text: "Deals opened" })} />
          <TKBookingCard
            initials="RV"
            name="Dr. Renata Voss"
            subtitle="Dermatologist · Clinic on Pine St"
            status={<TKBadge tone="green" soft>Confirmed</TKBadge>}
            date="Fri, Jun 19"
            time="14:30"
            actionLabel="Reschedule"
            onAction={() => toast.show({ text: "Reschedule tapped" })}
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <TKStatTile label="Revenue" value="$2,840" delta="+12.4%" />
            <TKStatTile label="Orders" value="184" delta="−3.1%" up={false} bars={[9, 7, 10, 6, 8, 5, 6]} />
          </div>
        </Section>

        <Section title="Images · ready / error / placeholder">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <TKImage src={productPhoto("📷", "#a8edea", "#5ee7df")} alt="Sample photo" />
            <TKImage src="data:image/png;base64,broken" alt="Broken photo" fallbackLabel="failed" />
            <TKImage fallbackLabel="no src" />
          </div>
          <div style={{ fontSize: "var(--tk-fz-caption)", color: "var(--tk-text-2)" }}>
            `TKImage` ships the skeleton, fade-in and striped error state; `TKAvatar src` falls back to initials.
          </div>
        </Section>

        <Section title="Media · wireframes & bare skeletons">
          <TKImg label="hero banner" ratio="21 / 9" radius="var(--tk-r-lg)" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <TKImg label="cover" />
            <TKImg label="poster" ratio="3 / 4" />
            <TKImg label="round" radius="50%" />
          </div>
          <div
            style={{
              background: "var(--tk-surface)",
              borderRadius: "var(--tk-r-md)",
              boxShadow: "var(--tk-shadow-sm)",
              padding: 14,
              display: "flex",
              flexDirection: "column",
              gap: 9,
            }}
          >
            <TKSkeleton width="58%" height={16} />
            <TKSkeleton width="94%" />
            <TKSkeleton width="83%" />
            <TKSkeleton width={130} height={32} radius="var(--tk-r-pill)" style={{ marginTop: 5 }} />
          </div>
          {/* e2e holds this request to pin TKImage in its skeleton phase */}
          <div data-demo-slow-image>
            <TKImage src="/demo-slow-photo.png" alt="Slow photo" ratio="2.4 / 1" fallbackLabel="slow" />
          </div>
          <div style={{ fontSize: "var(--tk-fz-caption)", color: "var(--tk-text-2)" }}>
            `TKImg` is the striped wireframe placeholder; bare `TKSkeleton` composes custom loading layouts.
          </div>
        </Section>

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
        </div>
      </div>

      <TKSheet
        open={snapSheetOpen}
        onClose={() => setSnapSheetOpen(false)}
        title="Snap points"
        snapPoints={[0.45, 0.85]}
        testId="demo-snap-sheet"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 4 }}>
          <TKCaption>Drag the grabber up/down to switch between 45% and 85% height; drag down from the lowest point to close.</TKCaption>
          <TKSelect label="City" options={["Lisbon", "Berlin", "Belgrade"]} />
          <TKListGroup>
            <TKCell icon="location" title="Dropdowns layer above the sheet" subtitle="z-index scale + select inside a dialog" />
          </TKListGroup>
        </div>
      </TKSheet>
      <TKSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Delivery time">
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          <TKRadioGroup options={["As soon as possible · 25–35 min", "Today, 18:00–18:30", "Schedule for tomorrow"]} />
        </div>
        <TKButton full onClick={() => setSheetOpen(false)}>Confirm</TKButton>
      </TKSheet>

      <TKDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        icon="trash"
        tone="red"
        title="Delete account?"
        text="This will erase your data and order history. This action can't be undone."
        actions={
          <>
            <TKButton variant="tonal" onClick={() => setDialogOpen(false)}>Cancel</TKButton>
            <TKButton variant="destructive" onClick={() => { setDialogOpen(false); toast.error("Deleted"); }}>Delete</TKButton>
          </>
        }
      />

      <TKActionSheet
        open={actionsOpen}
        onClose={() => setActionsOpen(false)}
        items={[
          { icon: "share", label: "Share", onSelect: () => toast.success("Shared") },
          { icon: "ticket", label: "Copy promo code", onSelect: () => toast.success("Copied") },
          { icon: "trash", label: "Remove from list", danger: true, onSelect: () => toast.error("Removed") },
        ]}
      />
    </div>
  );
}

import type { Dispatch, SetStateAction } from "react";
import {
  TKAccordion,
  TKAvatar,
  TKBadge,
  TKBannerCard,
  TKBookingCard,
  TKButton,
  TKCalendar,
  TKCategoryTabs,
  TKCaption,
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
  TKDot,
  TKFileInput,
  TKFormField,
  TKFormInput,
  TKHeader,
  TKIconButton,
  TKImage,
  TKImg,
  TKInlineButtons,
  TKInput,
  TKListGroup,
  TKMainButton,
  TKMultiselect,
  TKOTP,
  TKPageDots,
  TKPhoneInput,
  TKPinInput,
  TKProductCardA,
  TKProductCardB,
  TKRadioGroup,
  TKRating,
  TKSearch,
  TKSegmented,
  TKSelectable,
  TKSelect,
  TKSkeleton,
  TKSlider,
  TKStatTile,
  TKStepper,
  TKSteps,
  TKSwitch,
  TKTabbar,
  TKTappable,
  TKText,
  TKTextarea,
  TKTimeInput,
  TKTitle,
  TKTooltip,
  TKVisuallyHidden,
} from "tg-mini-app-uikit";
import type { useTKToast } from "tg-mini-app-uikit";
import { productPhoto } from "../shop/data";
import { Playground } from "./Playground";
import { Section, sleep } from "./shared";

interface GalleryBasicsProps {
  toast: ReturnType<typeof useTKToast>;
  seg: string;
  setSeg: (value: string) => void;
  steps: number;
  setSteps: (value: number) => void;
  page: number;
  setPage: (value: number) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  pinStatus: string;
  setPinStatus: (value: string) => void;
  inline: string;
  setInline: (value: string) => void;
  counter: number;
  setCounter: Dispatch<SetStateAction<number>>;
  setDialogOpen: (open: boolean) => void;
}

export function GalleryBasics({
  toast,
  seg,
  setSeg,
  steps,
  setSteps,
  page,
  setPage,
  priceRange,
  setPriceRange,
  pinStatus,
  setPinStatus,
  inline,
  setInline,
  counter,
  setCounter,
  setDialogOpen,
}: GalleryBasicsProps) {
  return (
    <>
        <Section title="Playground · live props" lazy={false}>
          <Playground />
        </Section>

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

    </>
  );
}

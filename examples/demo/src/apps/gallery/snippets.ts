/*
 * Copyable code snippets per gallery section (M8.1). Each snippet is a
 * self-contained JSX fragment: it must compile when pasted into a component
 * that imports the used TK* names from "tg-mini-app-uikit".
 * `npm run check:snippets` compiles every snippet in CI.
 */

export const SECTION_SNIPPETS: Record<string, string> = {
  buttons: `<>
  <TKButton>Pay</TKButton>
  <TKButton variant="tonal" icon="cart">Add to cart</TKButton>
  <TKButton variant="plain" loading>Saving…</TKButton>
  <TKButton as="a" href="https://t.me/durov" variant="outline">Open link</TKButton>
  <TKIconButton icon="bell" label="Alerts" badge={3} />
</>`,

  "main-button": `<TKMainButton
  label="Pay $42"
  onClick={() => new Promise((done) => setTimeout(done, 1200))}
/>`,

  "selection-controls": `<>
  <TKSwitch label="Notifications" defaultChecked />
  <TKCheckbox label="Agree to terms" />
  <TKCheckbox label="Select all" indeterminate />
  <TKRadioGroup options={["Delivery", "Pickup"]} defaultValue="Delivery" />
</>`,

  slider: `<>
  <TKSlider label="Volume" defaultValue={60} suffix="%" />
  <TKSlider range label="Price" defaultRange={[20, 70]} marks={[0, 25, 50, 75, 100]} />
  <TKStepper editable defaultValue={2} max={20} />
  <TKRating defaultValue={4} allowHalf />
</>`,

  inputs: `<>
  <TKInput label="Name" placeholder="Anna" />
  <TKInput label="Password" type="password" maxLength={24} />
  <TKSelect label="City" searchable options={[
    { label: "Europe", options: ["Lisbon", "Berlin"] },
    { label: "Asia", options: ["Tokyo"] },
  ]} />
  <TKMultiselect label="Toppings" selectAll options={["Cinnamon", "Caramel"]} />
</>`,

  "forms-2-0": `<>
  <TKCalendar mode="range" weekStartsOn={1} />
  <TKDateInput label="Date" placeholder="Pick a date" />
  <TKPhoneInput label="Phone" defaultCountry="+7" />
  <TKChipsInput label="Tags" defaultValue={["react"]} />
  <TKPinInput length={4} onComplete={(pin) => console.log(pin)} />
</>`,

  chips: `<>
  <TKChipGroup items={["All", "Coffee", "Tea"]} defaultValue="All" />
  <TKBadge tone="green" soft>Confirmed</TKBadge>
  <TKCounter value={120} max={99} />
  <TKDot tone="green" pulse />
</>`,

  navigation: `<>
  <TKSegmented full options={["Delivery", "Pickup"]} />
  <TKTabbar tabs={[
    { icon: "home", label: "Home" },
    { icon: "cart", label: "Cart", count: 2 },
  ]} />
  <TKSteps steps={["Service", "Time", "Confirm"]} current={1} />
</>`,

  "lists-cells": `<TKListGroup title="Settings" footer="Synced with Telegram.">
  <TKCell icon="bell" title="Notifications" defaultToggle />
  <TKCell icon="globe" title="Language" value="Русский" chevron onClick={() => {}} />
  <TKCell as="a" href="https://core.telegram.org" icon="link" title="Bot API docs" chevron />
</TKListGroup>`,

  gestures: `<>
  <TKPullToRefresh onRefresh={async () => { /* reload data */ }}>
    <TKListGroup>
      <TKCell title="Pull the list down" />
    </TKListGroup>
  </TKPullToRefresh>
  <TKSwipeCell trailing={[{ label: "Delete", icon: "trash", tone: "red", onAction: () => {} }]}>
    <TKCell title="Swipe me left" />
  </TKSwipeCell>
</>`,

  overlays: `<TKSheet
  open
  onClose={() => {}}
  title="Snap points"
  snapPoints={[0.45, 0.85]}
>
  <TKSelect label="City" options={["Lisbon", "Berlin"]} />
</TKSheet>`,

  chat: `<>
  <TKMessages messages={[
    { id: "1", text: "Привет!", time: "12:01" },
    { id: "2", text: "Заказ в пути 🚴", out: true, time: "12:02", status: "read" },
  ]} />
  <TKWriteBar placeholder="Message" onSend={(text) => console.log(text)} />
</>`,

  "display-2-0": `<>
  <TKAvatarStack avatars={[{ initials: "AK" }, { initials: "BL" }, { initials: "CM" }]} max={2} />
  <TKAvatar initials="ON" status="online" />
  <TKSpoiler>SPRING-2026</TKSpoiler>
  <TKBlockquote author="Anna">Цитата с акцентной полосой</TKBlockquote>
  <TKGallery>
    <TKImg label="slide 1" ratio="2 / 1" />
    <TKImg label="slide 2" ratio="2 / 1" />
  </TKGallery>
</>`,

  wow: `<TKConfetti count={150} onDone={() => console.log("done")} />`,

  feedback: `<>
  <TKSkeletonText lines={3} />
  <TKProgress value={64} size="lg" />
  <TKEmptyState icon="cart" title="Cart is empty" cta="Go to catalog" onCta={() => {}} />
</>`,

  localization: `<TKLocaleProvider locale={ruLocale}>
  <TKSearch />
  <TKMainButton label="Оплатить" status="success" />
</TKLocaleProvider>`,
};

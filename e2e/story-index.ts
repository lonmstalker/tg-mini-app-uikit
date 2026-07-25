/*
 * The curated story tables shared by every kit-level sweep: the per-group
 * render-smoke specs assert one role/text anchor per story, and the a11y /
 * reflow / RTL sweeps iterate the same set. One list, four consumers — a new
 * story gets ALL sweeps by being added here. NOT a spec file: importing a spec
 * from a spec would re-register its tests.
 */

export const atomStories = [
  { id: "atoms-buttons--button-variants", role: "button", name: "Filled" },
  { id: "atoms-buttons--icon-buttons", role: "button", name: "Favorite" },
  { id: "atoms-buttons--inline-buttons", role: "radio", name: "Daily" },
  { id: "atoms-buttons--main-button-and-spinner", role: "button", name: "Pay" },
  { id: "atoms-controls--binary-controls", role: "checkbox", name: "Selected" },
  { id: "atoms-controls--chips", text: "Featured" },
  { id: "atoms-controls--sliders", role: "slider", name: "Discount" },
  { id: "atoms-controls--stepper-and-rating", role: "button", name: "Increase" },
  { id: "atoms-display--badges-and-counters", text: "Confirmed" },
  { id: "atoms-display--avatars", text: "+2" },
  { id: "atoms-display--media", text: "Image fallback" },
  { id: "atoms-display--spoiler-and-quote", text: "Telegram-style quote with an accent rail." },
  { id: "atoms-inputs--text-fields", role: "textbox", name: "Email" },
  { id: "atoms-inputs--text-area", role: "textbox", name: "Message" },
  { id: "atoms-inputs--search", selector: "input" },
  { id: "atoms-inputs--choice-inputs", role: "combobox", name: "City" },
  { id: "atoms-inputs--file-upload", text: "Upload receipt" },
  { id: "atoms-icons--icon-gallery", text: "check" },
  { id: "atoms-service--tappable-surface", text: "Tappable surface" },
  { id: "atoms-service--hidden-label", role: "button", name: "Unread notifications" },
] as const;

export const compositeStories = [
  { id: "composites-overlays--modal-surfaces", text: "Confirm payout" },
  { id: "composites-overlays--action-sheet", text: "Share receipt" },
  { id: "composites-overlays--tooltip", role: "button", name: "Settlement status" },
  { id: "composites-overlays--anchored-popper", text: "Archive" },
  { id: "composites-overlays--toasts", text: "Saved to Telegram CloudStorage" },
  { id: "composites-forms--calendar-and-date-input", text: "Delivery date" },
  { id: "composites-forms--masked-inputs", text: "Invite code" },
  { id: "composites-forms--pin-and-chips", text: "Wallet access" },
  { id: "composites-cards--card-primitives", text: "Wallet" },
  { id: "composites-feedback--skeletons", testId: "feedback-skeletons" },
  { id: "composites-feedback--progress-and-bars", text: "64%" },
  { id: "composites-feedback--empty-and-timeline", text: "No orders" },
  { id: "composites-gestures--pull-to-refresh", text: "Pull feed to refresh" },
  { id: "composites-gestures--swipe-actions", text: "Swipe row" },
  { id: "composites-gestures--long-press", role: "button", name: "Hold action" },
  { id: "composites-lists--grouped-cells", text: "Settings" },
  { id: "composites-lists--accordion-list", text: "Delivery window" },
  { id: "composites-lists--loading-and-virtualization", text: "Feed item" },
  { id: "composites-lists--stress-content", text: "Без иконки и значения" },
  { id: "composites-navigation--header-and-tabbar", text: "Orders" },
  { id: "composites-navigation--stress-header", text: "Скидки" },
  { id: "composites-navigation--segmented-and-tabs", role: "radio", name: "Two" },
  { id: "composites-navigation--steps-and-dots", text: "Confirm" },
  { id: "composites-nav--stack-flow", text: "Inbox" },
  { id: "composites-carousel--product-slides", text: "Matte case" },
] as const;

export const foundationStories = [
  { id: "foundation-theme--provider-themes", text: "Dark provider" },
  { id: "foundation-i18n--localized-controls", role: "button", name: "Готово" },
  { id: "foundation-options--grouped-options", role: "combobox", name: "City" },
  { id: "foundation-telegram--runtime-provider", text: "Telegram runtime vtest" },
  { id: "foundation-layout--page-shell", text: "Order summary" },
  { id: "foundation-layout--safe-area", role: "button", name: "Pinned action" },
] as const;

export const templateStories = [
  { id: "templates-commerce--booking-checkout", text: "Book slot" },
  { id: "templates-cards--product-cards", text: "Travel tripod" },
  { id: "templates-cards--promotional-cards", text: "Weekend bonus" },
  { id: "templates-cards--stress-content", text: "+400%" },
  { id: "templates-wallet--wallet-states", role: "button", name: "Connect wallet" },
  { id: "templates-gamification--progress-and-leaderboard", text: "Anna" },
  { id: "templates-chat--support-thread", text: "Support chat" },
  { id: "templates-chat--bubble-states", testId: "chat-bubble-incoming" },
  { id: "templates-chat--stress-bubble", testId: "chat-bubble-stress" },
  { id: "templates-onboarding--coach-mark", testId: "onboarding-tooltip" },
  { id: "templates-onboarding--confetti-burst", testId: "template-confetti" },
] as const;

export const tokenStories = [
  { id: "tokens-typography--type-scale", role: "heading", name: "Checkout summary" },
  { id: "tokens-semantic-tokens--semantic-swatches", text: "Semantic tokens" },
] as const;

export const allStories = [
  ...atomStories,
  ...compositeStories,
  ...foundationStories,
  ...templateStories,
  ...tokenStories,
] as const;

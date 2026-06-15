/*
 * English dictionary — the single source of truth for the demo's string keys.
 * `Dict = typeof en` makes every key required in `ru.ts`, so a missing or
 * misspelled translation is a `tsc` error (and a red key-parity unit test).
 * Templated strings use the kit's `{placeholder}` convention (see `tkFormat`).
 *
 * Values are intentionally typed as plain `string` (no `as const`), so the
 * Russian dictionary may carry different copy under the identical key set.
 */
export const en = {
  // App identity
  "app.name": "Trailhead",
  "app.tagline": "Guided hikes, booked in Telegram",

  // Tabs
  "tab.discover": "Discover",
  "tab.trips": "Trips",
  "tab.train": "Train",
  "tab.guide": "Guide",
  "tab.profile": "Profile",

  // Shell / mock
  "shell.mockBadge": "MOCK",
  "shell.mockBadgeAria": "Running on the injected mock Telegram bridge",

  // Placeholder panels (M0 spine — replaced by real content in later milestones)
  "placeholder.openNext": "Open next screen",
  "placeholder.depth": "Depth {depth}",
  "placeholder.scrollHint": "Scroll down, then swipe back from the left edge.",
  "placeholder.bottomMarker": "End of screen",

  // First-run welcome (M1; thickened into coach marks in M6)
  "welcome.title": "Welcome to Trailhead",
  "welcome.body": "Book guided hikes, pay in Telegram Stars, and check in on the trail.",
  "welcome.dismiss": "Start exploring",

  // Checkout summary (line-item labels resolved from pricing.ts)
  "checkout.lineExperience": "{title}",
  "checkout.lineTrailPass": "Trail Pass — 15% off",
  "checkout.lineDemoCap": "Demo safety cap",
  "checkout.total": "Total",
  "checkout.stars": "{count} Stars",

  // Discover feed
  "discover.feedTitle": "Find your trail",
  "discover.searchPlaceholder": "Search hikes",
  "discover.banner.title": "Sunrise Ridge is calling",
  "discover.banner.text": "You're on day 5 of your streak — ready for the ridge.",
  "discover.banner.cta": "Open",
  "discover.cat.all": "All",
  "discover.cat.summit": "Summit",
  "discover.cat.forest": "Forest",
  "discover.cat.water": "Water",
  "discover.cat.sunrise": "Sunrise",
  "discover.chip.easy": "Easy",
  "discover.chip.moderate": "Moderate",
  "discover.chip.hard": "Hard",
  "discover.from": "from {price}",
  "discover.error.title": "Couldn't load hikes",
  "discover.error.text": "Something went wrong. Check your connection and try again.",
  "discover.error.retry": "Retry",
  "discover.empty.title": "No hikes match",
  "discover.empty.text": "Try clearing the filters or search.",
  "discover.empty.cta": "Clear filters",
  "discover.filters.cta": "Filters",
  "discover.filters.active": "{count} filters",
  "discover.filters.title": "Filters",
  "discover.filters.category": "Category",
  "discover.filters.difficulty": "Difficulty",
  "discover.filters.reset": "Reset",
  "discover.filters.apply": "Apply",

  // Experience detail
  "detail.about": "About this hike",
  "detail.guide": "Your guide",
  "detail.route": "Route",
  "detail.stat.distance": "Distance",
  "detail.stat.duration": "Duration",
  "detail.stat.ascent": "Ascent",
  "detail.stat.difficulty": "Difficulty",
  "detail.difficulty.easy": "Easy",
  "detail.difficulty.moderate": "Moderate",
  "detail.difficulty.hard": "Hard",
  "detail.book": "Book — {price}",
  "unit.min": "{count} min",
  "unit.km": "{count} km",
  "unit.m": "{count} m",
  "unit.stars": "{count} Stars",
  "unit.starsShort": "★ {count}",

  // Date & slot
  "datetime.title": "Pick a date",
  "datetime.slotTitle": "Choose a time",
  "datetime.soldOut": "Sold out",
  "datetime.continue": "Continue — {price}",
  "datetime.pickSlot": "Select a time to continue",

  // Checkout
  "checkout.title": "Review & pay",
  "checkout.when": "{date} · {slot}",
  "checkout.pay": "Pay {price}",
  "checkout.confirmTitle": "Confirm payment",
  "checkout.confirmBody": "{title} on {date} at {slot}",
  "checkout.confirmCta": "Pay with Stars",
  "checkout.safety.title": "This is a real Stars payment",
  "checkout.safety.text": "Telegram may charge 1 Star. This demo is not responsible for accidental payments. To test without spending, close the payment and use demo completion.",
  "checkout.pinTitle": "Enter your PIN to pay",
  "checkout.pinSetTitle": "Set a PIN for payments",
  "checkout.pinHelp": "Enter 4-8 digits, then tap Done.",
  "checkout.pinSetHelp": "No PIN yet: enter 4-8 digits, then tap Done. This code becomes your demo PIN.",
  "checkout.paying": "Processing payment…",
  "checkout.successTitle": "You're booked!",
  "checkout.successToast": "Booked! See you on the trail.",
  "checkout.successCta": "View my trips",
  "checkout.payError": "Payment was closed, no Stars were charged.",
  "checkout.retry": "Try again",
  "checkout.demoPaidCta": "Complete demo without spending",
  "checkout.empty.title": "No active checkout",
  "checkout.empty.text": "The cart is empty. If payment already completed, the booking is in Trips.",
  "checkout.empty.cta": "Open Trips",

  // Trips
  "trips.title": "Your trips",
  "trips.status.pending": "Pending",
  "trips.status.paid": "Confirmed",
  "trips.status.checkedIn": "Checked in",
  "trips.action.checkIn": "Check in",
  "trips.action.view": "View",
  "trips.swipe.reschedule": "Reschedule",
  "trips.swipe.cancel": "Cancel",
  "trips.undo": "Booking cancelled",
  "trips.undoAction": "Undo",
  "trips.rescheduleToast": "Rescheduling is coming soon",
  "trips.hint.pull": "Pull down to refresh trip status.",
  "trips.hint.swipe": "Swipe a trip left for actions.",
  "trips.empty.title": "No trips yet",
  "trips.empty.text": "Book a guided hike and it will show up here.",
  "trips.empty.cta": "Browse hikes",

  // Trail check-in (the signature QR → biometric → location chain)
  "checkin.title": "Trail check-in",
  "checkin.cta": "Check in at trailhead",
  "checkin.scanning": "Scanning the trailhead QR…",
  "checkin.verifying": "Verifying it's you…",
  "checkin.locating": "Confirming you're at the trailhead…",
  "checkin.doneTitle": "You're checked in",
  "checkin.done": "Checked in! Have a great hike.",
  "checkin.alreadyTitle": "Checked in",
  "checkin.already": "You checked in for this trip.",
  "checkin.failed": "Check-in didn't complete. Try again.",
  "checkin.backCta": "Back to my trips",
  "checkin.test.title": "Test without a QR stand",
  "checkin.test.text": "Demo check-in reaches the same final status without opening the camera.",
  "checkin.test.cta": "Demo",

  // Common
  "common.cancel": "Cancel",
  "common.confirm": "Confirm",
  "common.done": "Done",

  // Profile
  "profile.title": "Profile",
  "profile.greeting": "Hi, {name}",
  "profile.walletSection": "TON Wallet",
  "wallet.connect": "Connect wallet",
  "wallet.name": "Tonkeeper",
  "wallet.status.active": "Connected",
  "wallet.disconnect": "Disconnect wallet",
  "wallet.disconnectTitle": "Disconnect wallet?",
  "wallet.disconnectBody": "You'll lose the Trail Pass discount on Stars checkout.",
  "wallet.gateTitle": "Confirm with your PIN",
  "wallet.gateSetTitle": "Set a PIN to connect",
  "wallet.gateHelp": "Enter 4-8 digits, then tap Done.",
  "wallet.gateSetHelp": "No PIN yet: enter 4-8 digits, then tap Done. This code becomes your demo PIN.",
  "trailPass.title": "Trail Pass active",
  "trailPass.subtitle": "15% off every Stars checkout",

  // Settings
  "settings.title": "Settings",
  "settings.closing": "Confirm before closing",
  "settings.demoSection": "Demo tools",
  "settings.lab": "Platform Lab",
  "settings.labSub": "Developer controls for theme, device and locale",

  // Platform Lab
  "lab.title": "Platform Lab",
  "lab.intro": "Tune the look and feel live — every choice persists across reloads.",
  "lab.accent": "Accent color",
  "lab.radius": "Corner radius",
  "lab.typeScale": "Type scale",
  "lab.motion": "Motion",
  "lab.motion.springy": "Springy",
  "lab.motion.smooth": "Smooth",
  "lab.appearance": "Appearance",
  "lab.appearance.light": "Light",
  "lab.appearance.dark": "Dark",
  "lab.cutouts": "Simulate notch & home bar",
  "lab.rtl": "Right-to-left layout",
  "lab.language": "Language",
  "lab.previewCard": "Sunrise Ridge · 1 Star checkout",
  "lab.reset": "Reset to defaults",

  // Train
  "train.title": "Train",
  "train.streakTitle": "Weekly streak",
  "train.streakRing": "Day {day} of 7",
  "train.streakHint": "Ready for Sunrise Ridge",
  "train.level": "Level {level}",
  "train.xpHint": "{xp} XP to the next level",
  "train.you": "You",
  "train.stat.sessions": "Sessions",
  "train.stat.distance": "Distance",
  "train.stat.ascent": "Ascent",
  "train.stat.minutes": "Minutes",
  "train.weeklyGoal": "Weekly goal",
  "train.leaderboard": "Friends on Sunrise Ridge",
  "train.sessions": "Sessions",
  "session.planTitle": "Your plan",
  "session.detailsTitle": "Details",
  "session.focus": "Focus",
  "session.done": "Completed",
  "session.upcoming": "Upcoming",

  // Guide
  "guide.title": "Guides",
  "guide.directory": "Your guides",
  "guide.bookedSame": "Same trip",
  "guide.action.message": "Message",
  "guide.action.share": "Share trip",
  "guide.action.mute": "Mute",
  "guide.actions": "Guide actions",
  "guide.muted": "{name} muted",
  "guide.shared": "Trip shared",
  "guide.writePlaceholder": "Message…",
  "guide.guides": "{count} guides",
  "guide.directoryHint": "{count} people ready before and after the hike",
  "guide.onTripCount": "On your trip",
  "guide.coverageCount": "Covered routes",
  "guide.routesCount": "{count} routes",
  "guide.routeSection": "Guided routes",
  "chat.now": "now",

  // Onboarding coach marks (M6)
  "onboarding.next": "Next",
  "onboarding.done": "Got it",
  "onboarding.skip": "Skip",
  "onboarding.feed.title": "Find your trail",
  "onboarding.feed.text": "Browse guided hikes and tap one to book it in Telegram Stars.",
  "onboarding.tabs.title": "Five tabs",
  "onboarding.tabs.text": "Trips, Train, Guide and Profile — switch between them here. Swipe from the left edge to go back.",
  "onboarding.streak.title": "Build your streak",
  "onboarding.streak.text": "Train tracks your weekly streak so you're ready for the ridge.",
  "home.prompt": "Add Trailhead to your home screen?",
  "home.add": "Add",
  "home.added": "Added to your home screen",
} satisfies Record<string, string>;

export type Dict = typeof en;
export type DictKey = keyof Dict;

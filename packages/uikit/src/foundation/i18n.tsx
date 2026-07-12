import { createContext, useContext, useMemo, type ReactNode } from "react";

/**
 * Every user-facing string the kit renders by default. Components resolve
 * strings as: component prop → `TKLocaleProvider` → English defaults, so the
 * kit is fully localizable without a fork and works unchanged without a
 * provider. Templates use `{placeholders}` (see `tkFormat`).
 */
export interface TKLocale {
  /** TKMainButton success label. */
  done: string;
  /** TKHeader back button aria label. */
  back: string;
  /** TKActionSheet cancel row, TKSearch cancel button. */
  cancel: string;
  /** TKSheet close button aria label. */
  close: string;
  /** Generic clear action. */
  clear: string;
  /** TKMultiselect placeholder. */
  selectOptions: string;
  /** TKFileInput button label. */
  chooseFile: string;
  /** TKFileInput empty state. */
  noFileSelected: string;
  /** TKSearch placeholder. */
  search: string;
  /** TKOTP success caption. */
  codeVerified: string;
  /** TKOTP resend prompt. */
  didntGetCode: string;
  /** TKOTP resend action. */
  resend: string;
  /** TKOTP hidden input aria label. */
  oneTimeCode: string;
  /** Product cards add-to-cart action. */
  addToCart: string;
  /** TKStatTile default label. */
  metric: string;
  /** TKStepper aria labels. */
  decrease: string;
  increase: string;
  /** TKRating star aria label template: `{value} of {max}`. */
  ratingValue: string;
  /** TKRating group aria label. */
  rating: string;
  /** TKImg / TKImage fallback label. */
  image: string;
  /** TKXPHeader level badge prefix. */
  lvl: string;
  /** TKLeaderboard current-user badge. */
  you: string;
  /** Wallet adapters. */
  connectWallet: string;
  walletConnected: string;
  wallet: string;
  connected: string;
  disconnected: string;
  /** TKProductCardB favorite toggle aria label. */
  toggleFavorite: string;
  /** TKPageDots dot aria label template: `Page {page}`. */
  page: string;
  /** TKInput password visibility toggle. */
  showPassword: string;
  hidePassword: string;
  /** TKMultiselect "select all" row. */
  selectAll: string;
  /** TKCalendar month navigation. */
  prevMonth: string;
  nextMonth: string;
  /** TKPinInput keypad. */
  backspace: string;
  biometrics: string;
  /** TKStepper editable value field aria label. */
  quantity: string;
  /** TKSpoiler tap-to-reveal aria label. */
  revealSpoiler: string;
  /** TKWriteBar send button aria label. */
  send: string;
  /** TKWriteBar textarea fallback accessible name (CHT-001). */
  composeMessage: string;
  /** TKOnboardingTooltip controls. */
  next: string;
  skip: string;
  /** TKProgress default aria label. */
  progress: string;
  /** TKInput built-in `type="email"` validation message. */
  invalidEmail: string;
  /** TKPhoneInput country-code selector aria label. */
  countryCode: string;
  /** TKDateInput calendar trigger button aria label. */
  openCalendar: string;
  /** Busy / async live-region announcements (CC-05). */
  loading: string;
  error: string;
  refreshing: string;
  loadingMore: string;
  /** TKPinInput progress announcement template: `{n} of {length} digits entered`. */
  pinProgress: string;
  /** TKGallery slide announcement template: `Slide {page} of {total}` (CRS-005). */
  slidePosition: string;
  /** TKActionSheet default accessible name (OVL-011). */
  actions: string;
  /** TKAvatar presence status labels (DSP-002). */
  online: string;
  offline: string;
  unavailable: string;
  tabs: string;
  categories: string;
  phoneNumber: string;
  noResults: string;
  asyncErrorTitle: string;
  asyncErrorText: string;
  asyncRetry: string;
  asyncEmptyTitle: string;
  sliderMin: string;
  sliderMax: string;
  leadingActions: string;
  trailingActions: string;
}

export const enLocale: TKLocale = {
  done: "Done",
  back: "Back",
  cancel: "Cancel",
  close: "Close",
  clear: "Clear",
  selectOptions: "Select options",
  chooseFile: "Choose file",
  noFileSelected: "No file selected",
  search: "Search",
  codeVerified: "Code verified",
  didntGetCode: "Didn't get the code?",
  resend: "Resend",
  oneTimeCode: "One-time code",
  addToCart: "Add to cart",
  metric: "Metric",
  decrease: "Decrease",
  increase: "Increase",
  ratingValue: "{value} of {max}",
  rating: "Rating",
  image: "image",
  lvl: "LVL",
  you: "You",
  connectWallet: "Connect wallet",
  walletConnected: "Wallet connected",
  wallet: "Wallet",
  connected: "Connected",
  disconnected: "Disconnected",
  toggleFavorite: "Toggle favorite",
  page: "Page {page}",
  showPassword: "Show password",
  hidePassword: "Hide password",
  selectAll: "Select all",
  prevMonth: "Previous month",
  nextMonth: "Next month",
  backspace: "Backspace",
  biometrics: "Unlock with biometrics",
  quantity: "Quantity",
  revealSpoiler: "Show hidden content",
  send: "Send",
  composeMessage: "Message",
  next: "Next",
  skip: "Skip",
  progress: "Progress",
  invalidEmail: "Enter a valid email address",
  countryCode: "Country code",
  openCalendar: "Open calendar",
  loading: "Loading…",
  error: "Something went wrong",
  refreshing: "Refreshing…",
  loadingMore: "Loading more…",
  pinProgress: "{n} of {length} digits entered",
  slidePosition: "Slide {page} of {total}",
  actions: "Actions",
  online: "Online",
  offline: "Offline",
  unavailable: "Unavailable",
  tabs: "Tabs",
  categories: "Categories",
  phoneNumber: "Phone number",
  noResults: "Nothing found",
  asyncErrorTitle: "Something went wrong",
  asyncErrorText: "Please try again.",
  asyncRetry: "Retry",
  asyncEmptyTitle: "Nothing here yet",
  sliderMin: "{label} minimum",
  sliderMax: "{label} maximum",
  leadingActions: "Leading actions",
  trailingActions: "Trailing actions",
};

/** Ready-made Russian preset. */
export const ruLocale: TKLocale = {
  done: "Готово",
  back: "Назад",
  cancel: "Отмена",
  close: "Закрыть",
  clear: "Очистить",
  selectOptions: "Выберите варианты",
  chooseFile: "Выберите файл",
  noFileSelected: "Файл не выбран",
  search: "Поиск",
  codeVerified: "Код подтверждён",
  didntGetCode: "Не пришёл код?",
  resend: "Отправить ещё раз",
  oneTimeCode: "Одноразовый код",
  addToCart: "В корзину",
  metric: "Метрика",
  decrease: "Уменьшить",
  increase: "Увеличить",
  ratingValue: "{value} из {max}",
  rating: "Оценка",
  image: "изображение",
  lvl: "УР",
  you: "Вы",
  connectWallet: "Подключить кошелёк",
  walletConnected: "Кошелёк подключён",
  wallet: "Кошелёк",
  connected: "Подключён",
  disconnected: "Отключён",
  toggleFavorite: "В избранное",
  page: "Страница {page}",
  showPassword: "Показать пароль",
  hidePassword: "Скрыть пароль",
  selectAll: "Выбрать все",
  prevMonth: "Предыдущий месяц",
  nextMonth: "Следующий месяц",
  backspace: "Удалить символ",
  biometrics: "Войти по биометрии",
  quantity: "Количество",
  revealSpoiler: "Показать скрытое",
  send: "Отправить",
  composeMessage: "Сообщение",
  next: "Далее",
  skip: "Пропустить",
  progress: "Прогресс",
  invalidEmail: "Введите корректный email",
  countryCode: "Код страны",
  openCalendar: "Открыть календарь",
  loading: "Загрузка…",
  error: "Что-то пошло не так",
  refreshing: "Обновление…",
  loadingMore: "Загрузка…",
  pinProgress: "Введено {n} из {length}",
  slidePosition: "Слайд {page} из {total}",
  actions: "Действия",
  online: "В сети",
  offline: "Не в сети",
  unavailable: "Недоступно",
  tabs: "Вкладки",
  categories: "Категории",
  phoneNumber: "Номер телефона",
  noResults: "Ничего не найдено",
  asyncErrorTitle: "Что-то пошло не так",
  asyncErrorText: "Попробуйте ещё раз.",
  asyncRetry: "Повторить",
  asyncEmptyTitle: "Здесь пока пусто",
  sliderMin: "{label} минимум",
  sliderMax: "{label} максимум",
  leadingActions: "Действия слева",
  trailingActions: "Действия справа",
};

const TKLocaleContext = /* @__PURE__ */ createContext<TKLocale>(enLocale);

export interface TKLocaleProviderProps {
  /** Partial dictionaries fall back to English per key. */
  locale?: Partial<TKLocale>;
  children?: ReactNode;
}

export function TKLocaleProvider({ locale, children }: TKLocaleProviderProps) {
  const value = useMemo(() => ({ ...enLocale, ...locale }), [locale]);
  return <TKLocaleContext.Provider value={value}>{children}</TKLocaleContext.Provider>;
}

/** Resolved dictionary (provider value or English defaults). */
export function useTKLocale(): TKLocale {
  return useContext(TKLocaleContext);
}

/** Fills `{placeholder}` slots in a locale template. */
export function tkFormat(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_match, key: string) => String(vars[key] ?? ""));
}

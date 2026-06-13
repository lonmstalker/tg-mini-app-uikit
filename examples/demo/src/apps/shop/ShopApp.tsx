import { useEffect, useMemo, useState } from "react";
import {
  TKAvatar,
  TKBadge,
  TKBannerCard,
  TKButton,
  TKCategoryTabs,
  TKCell,
  TKCounter,
  TKDialog,
  TKEmptyState,
  TKIconButton,
  TKImage,
  TKInput,
  TKListGroup,
  TKMainButton,
  TKPaymentSummary,
  TKProductCardA,
  TKProductCardB,
  TKSearch,
  TKSheet,
  TKSkeletonCard,
  TKStepper,
  TKTabbar,
  TKTimeline,
  TKToastProvider,
  useCloudStorage,
  useTKToast,
} from "tg-mini-app-uikit";
import { CATEGORIES, PRODUCTS, fmt, type Product } from "./data";
import { bootScreen, demoDelay } from "../../shell/boot";
import type { ShellApi } from "../../shell/types";

/* Shop — storefront example: catalog, product sheet, cart with a payment
   failure path, receipt, profile. */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const CART_KEY = "shop-cart";
const PROMO_CODE = "SPRING24";
const PROMO_RATE = 0.2;

const stockOf = (p: Product) => p.stock ?? 99;

export function ShopApp({ shell }: { shell: ShellApi }) {
  return (
    <TKToastProvider offset={96}>
      <ShopInner shell={shell} />
    </TKToastProvider>
  );
}

function ShopInner({ shell }: { shell: ShellApi }) {
  const toast = useTKToast();
  const storage = useCloudStorage();
  // Deep link (M8.10): ?app=shop&screen=cart opens the cart tab right away.
  const [tab, setTab] = useState(() => (bootScreen() === "cart" ? 2 : 0));
  const [cart, setCart] = useState<Record<string, number>>({ mug: 1, candle: 1 });
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [favs, setFavs] = useState<Record<string, boolean>>({});
  const [category, setCategory] = useState(0);
  const [query, setQuery] = useState("");
  const [sheetProduct, setSheetProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [failPayment, setFailPayment] = useState(false);
  const [payErrorOpen, setPayErrorOpen] = useState(false);
  const [receipt, setReceipt] = useState<{ items: number; total: number } | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Simulated network (M8.5): skeletons while the "catalog request" is in flight.
  useEffect(() => {
    let alive = true;
    demoDelay(700).then(() => {
      if (alive) setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Cart persistence (M8.4): best-effort restore from CloudStorage; errors
  // and unsupported environments are ignored silently.
  useEffect(() => {
    let alive = true;
    storage
      .get(CART_KEY)
      .then((raw) => {
        if (!alive || !raw) return;
        const parsed: unknown = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          const next: Record<string, number> = {};
          for (const [id, n] of Object.entries(parsed as Record<string, unknown>)) {
            const p = PRODUCTS.find((x) => x.id === id);
            if (p && typeof n === "number" && n > 0) next[id] = Math.min(Math.floor(n), stockOf(p));
          }
          setCart(next);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setHydrated(true);
      });
    return () => {
      alive = false;
    };
  }, [storage]);

  useEffect(() => {
    if (!hydrated) return;
    storage.set(CART_KEY, JSON.stringify(cart)).catch(() => {});
  }, [cart, hydrated, storage]);

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const visible = useMemo(() => {
    const cat = CATEGORIES[category];
    return PRODUCTS.filter(
      (p) =>
        (category === 0 || p.category === cat) &&
        p.title.toLowerCase().includes(query.trim().toLowerCase()),
    );
  }, [category, query]);

  const add = (p: Product, count = 1) => {
    const max = stockOf(p);
    if ((cart[p.id] ?? 0) >= max) {
      toast.error(`Only ${max} in stock`);
      return;
    }
    setCart((c) => ({ ...c, [p.id]: Math.min((c[p.id] ?? 0) + count, max) }));
    toast.show({ icon: "cart", color: "var(--tk-green)", text: `${p.title} added to cart` });
  };

  const openProduct = (p: Product) => {
    setQty(1);
    setSheetProduct(p);
  };

  const subtotal = Object.entries(cart).reduce((sum, [id, n]) => {
    const p = PRODUCTS.find((x) => x.id === id);
    return sum + (p ? p.price * n : 0);
  }, 0);

  const discount = promoApplied ? subtotal * PROMO_RATE : 0;
  const total = subtotal + 3.5 - discount;

  // Promo code (M8.8): SPRING24 → −20%, anything else → field error.
  const applyPromo = () => {
    if (promoCode.trim().toUpperCase() === PROMO_CODE) {
      setPromoApplied(true);
      setPromoError(null);
    } else {
      setPromoApplied(false);
      setPromoError("Invalid promo code");
    }
  };

  const pay = async () => {
    await sleep(1300);
    if (failPayment) {
      setPayErrorOpen(true);
      throw new Error("payment declined"); // rejected promise resets TKMainButton to idle
    }
    setReceipt({ items: cartCount, total });
    setCart({});
    setPromoCode("");
    setPromoApplied(false);
    setPromoError(null);
  };

  return (
    <div data-demo-app="shop" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        {tab === 0 ? (
          <>
            <div style={{ padding: "64px 16px 6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "var(--tk-fz-title1)", fontWeight: 700, letterSpacing: "-.02em" }}>Shop</span>
              <TKIconButton
                icon="bell"
                variant="tonal"
                size={36}
                label="Notifications"
                onClick={() => toast.show({ icon: "bell", color: "var(--tk-accent)", text: "No new notifications" })}
              />
            </div>
            <div style={{ padding: "6px 16px 4px" }}>
              <TKSearch placeholder="Search products" value={query} onChange={setQuery} />
            </div>
            <TKCategoryTabs tabs={CATEGORIES} value={category} onChange={setCategory} />
            <div style={{ flex: 1, overflow: "auto" }}>
              <div style={{ padding: "10px 16px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
              <TKBannerCard
                title="Spring sale"
                text="Up to 40% off on selected items this week"
                cta="Browse deals"
                onCta={() => setCategory(1)}
              />
              {loading ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {Array.from({ length: 4 }, (_, i) => (
                    <TKSkeletonCard key={i} />
                  ))}
                </div>
              ) : visible.length ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {visible.map((p) => (
                    <div key={p.id} data-demo-product={p.id} style={{ position: "relative" }}>
                      <TKProductCardA
                        title={p.title}
                        price={fmt(p.price)}
                        img={p.img}
                        src={p.photo}
                        onClick={() => openProduct(p)}
                        onAdd={() => add(p)}
                      />
                      {p.stock != null ? (
                        <span
                          data-demo-stock-badge
                          style={{ position: "absolute", top: 16, left: 16, zIndex: 1, pointerEvents: "none" }}
                        >
                          <TKBadge tone="orange">{p.stock} left</TKBadge>
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <TKEmptyState
                  icon="search"
                  title="Nothing found"
                  text="Try a different query or clear the filters."
                  cta="Clear search"
                  onCta={() => setQuery("")}
                  tone="red"
                />
              )}
              </div>
            </div>
          </>
        ) : null}

        {tab === 1 ? (
          <>
            <div style={{ padding: "64px 16px 10px" }}>
              <span style={{ fontSize: "var(--tk-fz-title1)", fontWeight: 700, letterSpacing: "-.02em" }}>Catalog</span>
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: "0 16px 16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {loading
                  ? Array.from({ length: 4 }, (_, i) => <TKSkeletonCard key={i} />)
                  : PRODUCTS.map((p) => (
                      <div key={p.id} style={{ position: "relative" }}>
                        <TKProductCardB
                          title={p.title}
                          price={fmt(p.price)}
                          oldPrice={p.oldPrice ? fmt(p.oldPrice) : undefined}
                          discount={p.oldPrice ? `−${Math.round((1 - p.price / p.oldPrice) * 100)}%` : undefined}
                          rating={p.rating}
                          reviews={`${p.reviews} reviews`}
                          img={p.img}
                          src={p.photo}
                          fav={!!favs[p.id]}
                          onFavChange={(on) => setFavs((f) => ({ ...f, [p.id]: on }))}
                          onAdd={() => add(p)}
                        />
                        {p.stock != null ? (
                          <span
                            data-demo-stock-badge
                            style={{
                              position: "absolute",
                              top: p.oldPrice ? 44 : 16,
                              left: 16,
                              zIndex: 1,
                              pointerEvents: "none",
                            }}
                          >
                            <TKBadge tone="orange">{p.stock} left</TKBadge>
                          </span>
                        ) : null}
                      </div>
                    ))}
              </div>
            </div>
          </>
        ) : null}

        {tab === 2 ? (
          <>
            <div style={{ padding: "64px 16px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "var(--tk-fz-title1)", fontWeight: 700, letterSpacing: "-.02em" }}>Cart</span>
              {cartCount ? <TKBadge soft>{cartCount} items</TKBadge> : null}
            </div>
            <div style={{ flex: 1, overflow: "auto" }}>
              <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
              {cartCount === 0 ? (
                <div style={{ marginTop: 60 }}>
                  <TKEmptyState
                    icon="cart"
                    title="Your cart is empty"
                    text="Browse the catalog and add something you like."
                    cta="Go to catalog"
                    onCta={() => setTab(1)}
                  />
                </div>
              ) : (
                <>
                  <TKListGroup>
                    {Object.entries(cart).map(([id, n]) => {
                      const p = PRODUCTS.find((x) => x.id === id);
                      if (!p) return null;
                      return (
                        <TKCell
                          key={id}
                          title={p.title}
                          subtitle={p.stock != null ? `${fmt(p.price)} · ${p.stock} left` : fmt(p.price)}
                          after={
                            <TKStepper
                              value={n}
                              min={0}
                              max={stockOf(p)}
                              onChange={(v) =>
                                setCart((c) => {
                                  const next = { ...c };
                                  if (v <= 0) delete next[id];
                                  else next[id] = Math.min(v, stockOf(p));
                                  return next;
                                })
                              }
                            />
                          }
                        />
                      );
                    })}
                  </TKListGroup>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <div data-demo-promo-input style={{ flex: 1 }}>
                      <TKInput
                        placeholder="Promo code"
                        value={promoCode}
                        onChange={(v) => {
                          setPromoCode(v);
                          setPromoError(null);
                        }}
                        error={promoError}
                        hint={promoApplied ? `${PROMO_CODE} applied — −20%` : undefined}
                      />
                    </div>
                    <div data-demo-promo-apply>
                      <TKButton variant="tonal" onClick={applyPromo}>
                        Apply
                      </TKButton>
                    </div>
                  </div>
                  <TKPaymentSummary
                    rows={[
                      { label: "Subtotal", value: fmt(subtotal) },
                      { label: "Delivery", value: fmt(3.5) },
                      ...(promoApplied
                        ? [{ label: `Promo ${PROMO_CODE} (−20%)`, value: `−${fmt(discount)}`, accent: true }]
                        : []),
                      { label: "Total", value: fmt(total), total: true },
                    ]}
                  />
                  <TKListGroup footer="The decline switch makes the next payment fail — for testing the error path.">
                    <TKCell icon="card" title="Visa ·· 4242" subtitle="Default payment method" chevron />
                    <div data-demo-decline-toggle>
                      <TKCell
                        icon="bolt"
                        iconBg="var(--tk-orange)"
                        title="Simulate decline"
                        subtitle="Next payment will fail"
                        toggle={failPayment}
                        onToggle={setFailPayment}
                      />
                    </div>
                  </TKListGroup>
                  <div data-demo-pay-button>
                    <TKMainButton label={`Pay ${fmt(total)}`} successLabel="Paid" onClick={pay} />
                  </div>
                </>
              )}
              </div>
            </div>
          </>
        ) : null}

        {tab === 3 ? (
          <>
            <div style={{ padding: "64px 16px 14px", display: "flex", alignItems: "center", gap: 14 }}>
              <TKAvatar initials="AK" size={56} />
              <div>
                <div style={{ fontSize: "var(--tk-fz-title3)", fontWeight: 700 }}>Anna Karlova</div>
                <div style={{ fontSize: "var(--tk-fz-sub)", color: "var(--tk-text-2)" }}>@annak · Gold member</div>
              </div>
            </div>
            <div style={{ flex: 1, overflow: "auto" }}>
              <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 16 }}>
              <TKListGroup title="Account">
                <TKCell icon="user" title="Profile" subtitle="Name, phone, addresses" chevron onClick={() => {}} />
                <TKCell icon="wallet" iconBg="var(--tk-green)" title="Payment methods" value="Visa ··42" chevron onClick={() => {}} />
                <TKCell icon="bell" iconBg="var(--tk-red)" title="Notifications" defaultToggle />
                <TKCell icon="moon" iconBg="#5856d6" title="Dark mode" toggle={shell.dark} onToggle={shell.setDark} />
              </TKListGroup>
              <TKListGroup title="Orders" footer="Receipts are stored for 24 months.">
                <TKCell icon="cart" iconBg="var(--tk-orange)" title="Order history" badge="2" chevron onClick={() => {}} />
                <TKCell icon="trash" iconBg="var(--tk-red)" title="Delete account" danger onClick={() => setDeleteOpen(true)} />
              </TKListGroup>
              </div>
            </div>
          </>
        ) : null}
      </div>

      <div data-demo-shop-tabbar style={{ position: "relative" }}>
        <TKTabbar
          value={tab}
          onChange={setTab}
          tabs={[
            { icon: "home", label: "Home" },
            { icon: "grid", label: "Catalog" },
            { icon: "cart", label: "Cart" },
            { icon: "user", label: "Profile" },
          ]}
        />
        {/* Cart badge with overflow cap (M8.8): 12 items render as 9+. */}
        {cartCount ? (
          <span style={{ position: "absolute", top: 5, left: "calc(62.5% + 2px)", zIndex: 1, pointerEvents: "none" }}>
            <TKCounter value={cartCount} max={9} />
          </span>
        ) : null}
        <div style={{ height: 16, background: "var(--tk-glass)" }} />
      </div>

      {/* Product details — bottom sheet */}
      <TKSheet open={sheetProduct !== null} onClose={() => setSheetProduct(null)} title={sheetProduct?.title}>
        {sheetProduct ? (
          <div data-demo-product-sheet style={{ display: "flex", flexDirection: "column", gap: 14, paddingBottom: 8 }}>
            <TKImage src={sheetProduct.photo} alt={sheetProduct.title} ratio="1.6 / 1" fallbackLabel={sheetProduct.img} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontSize: "var(--tk-fz-title2)", fontWeight: 700 }}>{fmt(sheetProduct.price)}</span>
                {sheetProduct.oldPrice ? (
                  <span style={{ fontSize: "var(--tk-fz-sub)", color: "var(--tk-text-3)", textDecoration: "line-through" }}>
                    {fmt(sheetProduct.oldPrice)}
                  </span>
                ) : null}
              </div>
              <TKStepper value={qty} min={1} max={stockOf(sheetProduct)} onChange={setQty} />
            </div>
            <div style={{ fontSize: "var(--tk-fz-sub)", color: "var(--tk-text-2)" }}>
              ★ {sheetProduct.rating} · {sheetProduct.reviews} reviews — hand-made, ships in 2 days.
              {sheetProduct.stock != null ? ` Only ${sheetProduct.stock} left in stock.` : ""}
            </div>
            <TKButton
              full
              icon="cart"
              onClick={() => {
                add(sheetProduct, qty);
                setSheetProduct(null);
              }}
            >
              Add {qty} to cart · {fmt(sheetProduct.price * qty)}
            </TKButton>
          </div>
        ) : null}
      </TKSheet>

      {/* Payment failure — error path with a retry */}
      <div data-demo-payment-error>
        <TKDialog
          open={payErrorOpen}
          onClose={() => setPayErrorOpen(false)}
          icon="card"
          tone="red"
          title="Payment declined"
          text="Your bank rejected the charge. No money was taken — try again or use another method."
          actions={
            <>
              <TKButton variant="tonal" onClick={() => setPayErrorOpen(false)}>
                Cancel
              </TKButton>
              <TKButton
                onClick={() => {
                  setFailPayment(false);
                  setPayErrorOpen(false);
                  toast.show({ icon: "check", color: "var(--tk-green)", text: "Decline test disabled — pay again" });
                }}
              >
                Try again
              </TKButton>
            </>
          }
        />
      </div>

      {/* Receipt — success path */}
      <TKSheet open={receipt !== null} onClose={() => setReceipt(null)} title="Order confirmed">
        {receipt ? (
          <div data-demo-receipt style={{ display: "flex", flexDirection: "column", gap: 14, paddingBottom: 8 }}>
            <TKPaymentSummary
              rows={[
                { label: `Items (${receipt.items})`, value: fmt(receipt.total - 3.5) },
                { label: "Delivery", value: fmt(3.5) },
                { label: "Paid", value: fmt(receipt.total), total: true },
              ]}
            />
            <TKTimeline
              steps={[
                { label: "Payment confirmed", time: "now", status: "done" },
                { label: "Packing your order", time: "~15 min", status: "active" },
                { label: "Courier on the way", status: "pending" },
                { label: "Delivered", status: "pending" },
              ]}
            />
            <TKButton full onClick={() => setReceipt(null)}>
              Done
            </TKButton>
          </div>
        ) : null}
      </TKSheet>

      {/* Destructive confirmation — dialog */}
      <TKDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        icon="trash"
        tone="red"
        title="Delete account?"
        text="This will erase your data and order history. This action can't be undone."
        actions={
          <>
            <TKButton variant="tonal" onClick={() => setDeleteOpen(false)}>
              Cancel
            </TKButton>
            <TKButton
              variant="destructive"
              onClick={() => {
                setDeleteOpen(false);
                toast.error("Account scheduled for deletion");
              }}
            >
              Delete
            </TKButton>
          </>
        }
      />
    </div>
  );
}

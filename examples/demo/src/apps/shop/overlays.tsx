import {
  TKButton,
  TKDialog,
  TKImage,
  TKPaymentSummary,
  TKSheet,
  TKStepper,
  TKTimeline,
} from "tg-mini-app-uikit";
import { fmt, type Product } from "./data";

export interface ShopReceipt {
  items: number;
  total: number;
}

interface ShopOverlaysProps {
  product: Product | null;
  qty: number;
  receipt: ShopReceipt | null;
  deleteOpen: boolean;
  paymentErrorOpen: boolean;
  stockOf: (product: Product) => number;
  onQtyChange: (qty: number) => void;
  onProductClose: () => void;
  onAddProduct: (product: Product, qty: number) => void;
  onReceiptClose: () => void;
  onDeleteClose: () => void;
  onDeleteAccount: () => void;
  onPaymentErrorClose: () => void;
  onPaymentRetry: () => void;
}

export function ShopOverlays({
  product,
  qty,
  receipt,
  deleteOpen,
  paymentErrorOpen,
  stockOf,
  onQtyChange,
  onProductClose,
  onAddProduct,
  onReceiptClose,
  onDeleteClose,
  onDeleteAccount,
  onPaymentErrorClose,
  onPaymentRetry,
}: ShopOverlaysProps) {
  return (
    <>
      <TKSheet open={product !== null} onClose={onProductClose} title={product?.title}>
        {product ? (
          <div data-demo-product-sheet style={{ display: "flex", flexDirection: "column", gap: 14, paddingBottom: 8 }}>
            <TKImage src={product.photo} alt={product.title} ratio="1.6 / 1" fallbackLabel={product.img} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontSize: "var(--tk-fz-title2)", fontWeight: 700 }}>{fmt(product.price)}</span>
                {product.oldPrice ? (
                  <span style={{ fontSize: "var(--tk-fz-sub)", color: "var(--tk-text-3)", textDecoration: "line-through" }}>
                    {fmt(product.oldPrice)}
                  </span>
                ) : null}
              </div>
              <TKStepper value={qty} min={1} max={stockOf(product)} onChange={onQtyChange} />
            </div>
            <div style={{ fontSize: "var(--tk-fz-sub)", color: "var(--tk-text-2)" }}>
              ★ {product.rating} · {product.reviews} reviews — hand-made, ships in 2 days.
              {product.stock != null ? ` Only ${product.stock} left in stock.` : ""}
            </div>
            <TKButton full icon="cart" onClick={() => onAddProduct(product, qty)}>
              Add {qty} to cart · {fmt(product.price * qty)}
            </TKButton>
          </div>
        ) : null}
      </TKSheet>

      <div data-demo-payment-error>
        <TKDialog
          open={paymentErrorOpen}
          onClose={onPaymentErrorClose}
          icon="card"
          tone="red"
          title="Payment declined"
          text="Your bank rejected the charge. No money was taken — try again or use another method."
          actions={
            <>
              <TKButton variant="tonal" onClick={onPaymentErrorClose}>
                Cancel
              </TKButton>
              <TKButton onClick={onPaymentRetry}>Try again</TKButton>
            </>
          }
        />
      </div>

      <TKSheet open={receipt !== null} onClose={onReceiptClose} title="Order confirmed">
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
            <TKButton full onClick={onReceiptClose}>
              Done
            </TKButton>
          </div>
        ) : null}
      </TKSheet>

      <TKDialog
        open={deleteOpen}
        onClose={onDeleteClose}
        icon="trash"
        tone="red"
        title="Delete account?"
        text="This will erase your data and order history. This action can't be undone."
        actions={
          <>
            <TKButton variant="tonal" onClick={onDeleteClose}>
              Cancel
            </TKButton>
            <TKButton variant="destructive" onClick={onDeleteAccount}>
              Delete
            </TKButton>
          </>
        }
      />
    </>
  );
}

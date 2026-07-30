import { computeBundleDiscount } from './bundle-discount';

export const MAX_CART_ITEMS = 30;
const MAX_QUANTITY = 99;

export interface CartSnapshotItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface CartSnapshot {
  items: CartSnapshotItem[];
  total: number;
}

type ProductLookup = (id: string) => { id: string; name: string; price: number } | undefined;

// Server-authoritative normalization of a client cart payload: names and
// prices come from the catalog, the client is trusted only for quantity (the
// same rule as checkout). Output is deterministic - duplicates merged, sorted
// by productId - so jsonb equality can detect whether the cart actually
// changed. Malformed payloads return null; unknown productIds are dropped
// (a delisted product must not freeze a member's sync forever); an empty
// result is valid and means "delete the snapshot".
export function normalizeCartItems(raw: unknown, getProduct: ProductLookup): CartSnapshot | null {
  if (!Array.isArray(raw) || raw.length > MAX_CART_ITEMS) return null;

  const quantities = new Map<string, number>();
  for (const entry of raw) {
    if (typeof entry !== 'object' || entry === null) return null;
    const candidate = entry as Record<string, unknown>;
    if (typeof candidate.productId !== 'string' || !candidate.productId) return null;
    const qty = Number(candidate.quantity);
    if (!Number.isInteger(qty) || qty < 1) return null;

    const product = getProduct(candidate.productId);
    if (!product) continue;

    const current = quantities.get(product.id) || 0;
    quantities.set(product.id, Math.min(current + qty, MAX_QUANTITY));
  }

  const items = [...quantities.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([productId, quantity]) => {
      const product = getProduct(productId) as { name: string; price: number };
      return { productId, name: product.name, quantity, price: product.price };
    });

  const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const { bundleDiscount } = computeBundleDiscount(
    items.map((it) => ({ productId: it.productId, quantity: it.quantity }))
  );

  return { items, total: subtotal - bundleDiscount };
}

// Defensive read of a member_carts row: Neon returns jsonb parsed, but the
// shape is still validated (mirrors parseCouponRow), and numeric comes back
// as a string.
export function parseMemberCartRow(row: Record<string, unknown>): CartSnapshot | null {
  if (!Array.isArray(row.items) || row.items.length === 0) return null;

  const items: CartSnapshotItem[] = [];
  for (const entry of row.items) {
    if (typeof entry !== 'object' || entry === null) return null;
    const it = entry as Record<string, unknown>;
    if (typeof it.productId !== 'string' || typeof it.name !== 'string') return null;
    const quantity = Number(it.quantity);
    const price = Number(it.price);
    if (!Number.isFinite(quantity) || !Number.isFinite(price)) return null;
    items.push({ productId: it.productId, name: it.name, quantity, price });
  }

  const total = Number(row.total);
  if (!Number.isFinite(total)) return null;

  return { items, total };
}

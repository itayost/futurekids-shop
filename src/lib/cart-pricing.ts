import { computeBundleDiscount } from './bundle-discount';
import { getProductById } from './products';
import { priceOf } from './promo';

interface CartLine {
  productId: string;
  quantity: number;
  price: number;
}

export type PricedLine<T extends CartLine> = T & { regularPrice: number };

export interface PricedCart<T extends CartLine> {
  lines: PricedLine<T>[];
  subtotal: number;
  bundleDiscount: number;
  bundleName: string | null;
  // Products after the bundle discount, before coupon and shipping.
  total: number;
  // What product promos (such as a launch price) take off the list prices.
  saleSavings: number;
}

const lineSum = (lines: { quantity: number }[], price: (i: number) => number) =>
  lines.reduce((sum, line, i) => sum + price(i) * line.quantity, 0);

// The one definition of what a cart costs at a given moment, shared by the
// storefront and the checkout server so they cannot disagree. Prices always come
// from the catalog: a price stored in the cart goes stale the moment a promo
// starts or ends, and showing less than checkout charges is the damaging
// direction. A stored price is only a fallback for a product no longer listed.
export function priceCart<T extends CartLine>(items: T[], now: number): PricedCart<T> {
  const lines = items.map((item) => {
    const product = getProductById(item.productId);
    return {
      ...item,
      price: product ? priceOf(product, now) : item.price,
      regularPrice: product ? product.price : item.price,
    };
  });

  const units = lines.map(({ productId, quantity }) => ({ productId, quantity }));
  const subtotal = lineSum(lines, (i) => lines[i].price);
  const { bundleDiscount, bundleName } = computeBundleDiscount(units);
  const total = subtotal - bundleDiscount;
  const regularSubtotal = lineSum(lines, (i) => lines[i].regularPrice);

  return { lines, subtotal, bundleDiscount, bundleName, total, saleSavings: regularSubtotal - subtotal };
}

// A reminder email quotes an order that may have been priced on the other side
// of a promo window. Re-quote it at today's prices when they moved; otherwise
// keep the stored total, which may legitimately include a coupon.
export function repriceForReminder<T extends CartLine>(
  items: T[],
  total: number,
  shippingCost: number,
  now: number
): { items: T[]; total: number } {
  const priced = priceCart(items, now);
  const moved = priced.lines.some((line, i) => line.price !== items[i].price);
  return moved ? { items: priced.lines, total: priced.total + shippingCost } : { items, total };
}

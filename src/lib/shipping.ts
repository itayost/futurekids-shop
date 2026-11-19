// Single source of truth for shipping prices, shared by the checkout page
// (display) and the checkout API (authoritative charge) so they can't diverge.
export const SHIPPING_COSTS = {
  'pickup-point': 20,
  delivery: 40,
} as const;

export type ShippingMethod = keyof typeof SHIPPING_COSTS;

// The products total from which each method ships free. Home delivery's
// threshold is above the pickup point's, so an order that delivers home free
// also gets a free pickup point.
export const FREE_SHIPPING_FROM: Record<ShippingMethod, number> = {
  'pickup-point': 100,
  delivery: 300,
};

export function isShippingMethod(value: unknown): value is ShippingMethod {
  return value === 'pickup-point' || value === 'delivery';
}

// `productsTotal` is the cart after the bundle discount and before any coupon
// (priceCart's `total`). Measuring before the coupon means applying one can
// never push the order under the threshold and make it cost more.
export function shippingCostFor(method: ShippingMethod, productsTotal: number): number {
  return productsTotal >= FREE_SHIPPING_FROM[method] ? 0 : SHIPPING_COSTS[method];
}

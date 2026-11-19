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

// `productsTotal` is what the products cost after every discount: the bundle
// discount and the coupon. The client's rule: a coupon that takes the cart
// under a threshold loses that free shipping, even though the order can then
// cost more than it would without the coupon. Checkout says so when it happens.
export function shippingCostFor(method: ShippingMethod, productsTotal: number): number {
  return productsTotal >= FREE_SHIPPING_FROM[method] ? 0 : SHIPPING_COSTS[method];
}

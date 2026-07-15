// Single source of truth for shipping prices, shared by the checkout page
// (display) and the checkout API (authoritative charge) so they can't diverge.
export const SHIPPING_COSTS = {
  'pickup-point': 20,
  delivery: 40,
} as const;

export type ShippingMethod = keyof typeof SHIPPING_COSTS;

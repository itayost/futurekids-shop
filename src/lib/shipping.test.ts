import { describe, expect, it } from 'vitest';
import { FREE_SHIPPING_FROM, SHIPPING_COSTS, isShippingMethod, shippingCostFor } from './shipping';

describe('shippingCostFor', () => {
  it('charges for a pickup point below ₪100', () => {
    expect(shippingCostFor('pickup-point', 99)).toBe(SHIPPING_COSTS['pickup-point']);
  });

  it('ships to a pickup point free from ₪100', () => {
    expect(shippingCostFor('pickup-point', 100)).toBe(0);
    expect(shippingCostFor('pickup-point', 102)).toBe(0);
  });

  it('charges for home delivery below ₪300, even when a pickup point would be free', () => {
    expect(shippingCostFor('delivery', 105)).toBe(SHIPPING_COSTS.delivery);
    expect(shippingCostFor('delivery', 299)).toBe(SHIPPING_COSTS.delivery);
  });

  it('delivers home free from ₪300, and the pickup point stays free too', () => {
    expect(shippingCostFor('delivery', 300)).toBe(0);
    expect(shippingCostFor('pickup-point', 300)).toBe(0);
  });

  it('keeps the thresholds the announcement bar promises', () => {
    expect(FREE_SHIPPING_FROM).toEqual({ 'pickup-point': 100, delivery: 300 });
  });
});

describe('isShippingMethod', () => {
  it('accepts the two methods and nothing else', () => {
    expect(isShippingMethod('pickup-point')).toBe(true);
    expect(isShippingMethod('delivery')).toBe(true);
    expect(isShippingMethod('express')).toBe(false);
    expect(isShippingMethod(null)).toBe(false);
  });
});

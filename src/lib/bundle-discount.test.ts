import { describe, it, expect } from 'vitest';
import { computeBundleDiscount } from './bundle-discount';

const all3Books = [
  { productId: 'ai-book', quantity: 1 },
  { productId: 'encryption-book', quantity: 1 },
  { productId: 'algorithms-book', quantity: 1 },
];
const oneOfEachWorkbook = [
  { productId: 'ai-workbook', quantity: 1 },
  { productId: 'encryption-workbook', quantity: 1 },
  { productId: 'algorithms-workbook', quantity: 1 },
];

describe('computeBundleDiscount', () => {
  it('no discount without all 3 books', () => {
    expect(computeBundleDiscount([{ productId: 'ai-book', quantity: 1 }]))
      .toEqual({ bundleDiscount: 0, bundleName: null });
  });
  it('15 for 3 books only', () => {
    expect(computeBundleDiscount(all3Books))
      .toEqual({ bundleDiscount: 15, bundleName: 'מארז הספרים' });
  });
  it('45 for 3 books + 1 of each workbook', () => {
    expect(computeBundleDiscount([...all3Books, ...oneOfEachWorkbook]))
      .toEqual({ bundleDiscount: 45, bundleName: 'מארז החוקרים הצעירים' });
  });
  it('115 for 3 books + 2 of each workbook', () => {
    const two = oneOfEachWorkbook.map((w) => ({ ...w, quantity: 2 }));
    expect(computeBundleDiscount([...all3Books, ...two]))
      .toEqual({ bundleDiscount: 115, bundleName: 'מארז המומחים' });
  });
});

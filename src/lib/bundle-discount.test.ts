import { describe, it, expect } from 'vitest';
import {
  BUNDLE_BOOK_IDS,
  BUNDLE_TIERS,
  BUNDLE_WORKBOOK_IDS,
  computeBundleDiscount,
} from './bundle-discount';
import { bundles } from './products';
import { salePriceOf } from './sale';

const BOOKS = ['ai-book', 'encryption-book', 'algorithms-book'];
const WORKBOOKS = ['ai-workbook', 'encryption-workbook', 'algorithms-workbook'];

// A cart holding `books` copies of every book title and `workbooks` copies of
// every workbook title, i.e. `books` complete book-triples.
const cart = (books: number, workbooks: number) => [
  ...BOOKS.map((productId) => ({ productId, quantity: books })),
  ...WORKBOOKS.map((productId) => ({ productId, quantity: workbooks })),
].filter((i) => i.quantity > 0);

describe('computeBundleDiscount', () => {
  it('no discount without all 3 books', () => {
    expect(computeBundleDiscount([{ productId: 'ai-book', quantity: 1 }]))
      .toEqual({ bundleDiscount: 0, bundleName: null });
  });

  it('extra copies of one title do not make a set', () => {
    expect(computeBundleDiscount([
      { productId: 'ai-book', quantity: 3 },
      { productId: 'encryption-book', quantity: 1 },
      { productId: 'algorithms-book', quantity: 1 },
    ])).toEqual({ bundleDiscount: 15, bundleName: 'מארז הספרים' });
  });

  it('15 for 3 books only', () =>
    expect(computeBundleDiscount(cart(1, 0)))
      .toEqual({ bundleDiscount: 15, bundleName: 'מארז הספרים' }));

  it('45 for 3 books + 1 of each workbook', () =>
    expect(computeBundleDiscount(cart(1, 1)))
      .toEqual({ bundleDiscount: 45, bundleName: 'מארז החוקרים הצעירים' }));

  it('85 for 3 books + 2 of each workbook', () =>
    expect(computeBundleDiscount(cart(1, 2)))
      .toEqual({ bundleDiscount: 85, bundleName: 'מארז המומחים' }));

  // The whole point of the optimal split: 6 books + 6 workbooks is two
  // researcher bundles (90), but splitting it as expert + books gives 100.
  it('6 books + 6 workbooks splits as expert + books, not two researchers', () =>
    expect(computeBundleDiscount(cart(2, 2)))
      .toEqual({ bundleDiscount: 100, bundleName: 'מארז המומחים + מארז הספרים' }));

  it('doubles the discount for 6 books with no workbooks', () =>
    expect(computeBundleDiscount(cart(2, 0)))
      .toEqual({ bundleDiscount: 30, bundleName: '2 מארזי ספרים' }));

  it('groups two identical bundles under a plural name', () =>
    expect(computeBundleDiscount(cart(2, 4)))
      .toEqual({ bundleDiscount: 170, bundleName: '2 מארזי מומחים' }));

  it('mixes tiers when the workbooks do not divide evenly', () =>
    expect(computeBundleDiscount(cart(2, 3)))
      .toEqual({ bundleDiscount: 130, bundleName: 'מארז המומחים + מארז החוקרים הצעירים' }));

  it('ignores workbooks that have no book set to attach to', () =>
    expect(computeBundleDiscount([...WORKBOOKS.map((productId) => ({ productId, quantity: 2 }))]))
      .toEqual({ bundleDiscount: 0, bundleName: null }));

  it('sums duplicate line items for the same product', () =>
    expect(computeBundleDiscount([
      ...BOOKS.map((productId) => ({ productId, quantity: 1 })),
      ...BOOKS.map((productId) => ({ productId, quantity: 1 })),
    ])).toEqual({ bundleDiscount: 30, bundleName: '2 מארזי ספרים' }));
});

// The counts multiply the tier discounts, so a junk quantity from a
// hand-edited localStorage cart must not reach the arithmetic.
describe('computeBundleDiscount ignores junk quantities', () => {
  const withQuantity = (quantity: unknown) =>
    BOOKS.map((productId) => ({ productId, quantity: quantity as number }));

  it('never returns NaN for a non-numeric quantity', () =>
    expect(computeBundleDiscount(withQuantity(NaN)))
      .toEqual({ bundleDiscount: 0, bundleName: null }));

  it('never returns NaN for a missing quantity', () =>
    expect(computeBundleDiscount(withQuantity(undefined)))
      .toEqual({ bundleDiscount: 0, bundleName: null }));

  it('never returns a negative discount for a negative quantity', () => {
    const result = computeBundleDiscount([
      ...BOOKS.map((productId) => ({ productId, quantity: 1 })),
      { productId: 'ai-workbook', quantity: -1 },
      { productId: 'encryption-workbook', quantity: 1 },
      { productId: 'algorithms-workbook', quantity: 1 },
    ]);
    expect(result).toEqual({ bundleDiscount: 15, bundleName: 'מארז הספרים' });
  });

  it('never returns a fractional discount for a fractional quantity', () =>
    expect(computeBundleDiscount(withQuantity(1.5)))
      .toEqual({ bundleDiscount: 0, bundleName: null }));
});

// The bundle pages add plain products to the cart and let this module price
// them, so a change to `savings` in products.ts that is not mirrored here
// silently overcharges or undercharges every bundle customer.
describe('BUNDLE_TIERS mirrors the advertised bundles', () => {
  it('has the same name, workbook count and savings as products.ts', () => {
    const advertised = [...bundles]
      .sort((a, b) => b.workbookQuantity - a.workbookQuantity)
      .map((b) => ({ name: b.name, workbookSets: b.workbookQuantity, discount: b.savings }));

    expect(BUNDLE_TIERS.map(({ name, workbookSets, discount }) => ({ name, workbookSets, discount })))
      .toEqual(advertised);
  });

  // packBundles charges every tier exactly one complete book set.
  it('every advertised bundle costs exactly one set of the three books', () => {
    for (const b of bundles) {
      expect([...b.bookIds].sort()).toEqual([...BUNDLE_BOOK_IDS].sort());
      if (b.workbookQuantity > 0) {
        expect([...b.workbookIds].sort()).toEqual([...BUNDLE_WORKBOOK_IDS].sort());
      }
    }
  });
});

// Reference implementation: exhaustively search every way of carving the cart
// into bundles. The shipped function must never leave money on the table.
function bestPossibleDiscount(bookSets: number, workbookSets: number): number {
  // Prices come from the one source of truth; only the search is independent.
  const tiers = BUNDLE_TIERS.map((t) => ({ b: 1, w: t.workbookSets, d: t.discount }));
  const memo = new Map<string, number>();
  const search = (b: number, w: number): number => {
    const key = `${b},${w}`;
    const seen = memo.get(key);
    if (seen !== undefined) return seen;
    let best = 0;
    for (const t of tiers) {
      if (b >= t.b && w >= t.w) best = Math.max(best, t.d + search(b - t.b, w - t.w));
    }
    memo.set(key, best);
    return best;
  };
  return search(bookSets, workbookSets);
}

describe('computeBundleDiscount is optimal for the customer', () => {
  it('matches an exhaustive search for every quantity up to 12x12', () => {
    const worse: string[] = [];
    for (let b = 0; b <= 12; b++) {
      for (let w = 0; w <= 12; w++) {
        const actual = computeBundleDiscount(cart(b, w)).bundleDiscount;
        const best = bestPossibleDiscount(b, w);
        if (actual !== best) worse.push(`${b} book sets + ${w} workbook sets: got ${actual}, best ${best}`);
      }
    }
    expect(worse).toEqual([]);
  });
});

describe('computeBundleDiscount during the sale', () => {
  it('uses the smaller sale discount for each tier', () => {
    expect(computeBundleDiscount(cart(1, 0), { sale: true }).bundleDiscount).toBe(11);
    expect(computeBundleDiscount(cart(1, 1), { sale: true }).bundleDiscount).toBe(35);
    expect(computeBundleDiscount(cart(1, 2), { sale: true }).bundleDiscount).toBe(67);
  });

  it('keeps the bundle name', () =>
    expect(computeBundleDiscount(cart(1, 1), { sale: true }).bundleName).toBe('מארז החוקרים הצעירים'));

  // Units at their sale prices minus the tier's sale discount must land exactly
  // on 15% off today's bundle price, rounded down.
  it('every tier lands on the advertised sale price of its bundle', () => {
    for (const b of bundles) {
      const units = 3 * salePriceOf(75) + 3 * b.workbookQuantity * salePriceOf(30);
      const tier = BUNDLE_TIERS.find((t) => t.name === b.name)!;
      expect(units - tier.saleDiscount).toBe(salePriceOf(b.price));
    }
  });

  it('still packs optimally for the customer with the sale discounts', () => {
    const tiers = BUNDLE_TIERS.map((t) => ({ w: t.workbookSets, d: t.saleDiscount }));
    const best = (b: number, w: number): number =>
      b === 0 ? 0 : Math.max(...tiers.filter((t) => w >= t.w).map((t) => t.d + best(b - 1, w - t.w)));
    const worse: string[] = [];
    for (let b = 0; b <= 6; b++) {
      for (let w = 0; w <= 6; w++) {
        const actual = computeBundleDiscount(cart(b, w), { sale: true }).bundleDiscount;
        if (actual !== best(b, w)) worse.push(`${b}x${w}: got ${actual}, best ${best(b, w)}`);
      }
    }
    expect(worse).toEqual([]);
  });
});

describe('computeBundleDiscount ignores series products', () => {
  it('the riddles book changes neither the discount nor the bundle name', () => {
    for (const [b, w] of [[0, 0], [1, 0], [1, 1], [2, 2]]) {
      const without = computeBundleDiscount(cart(b, w));
      const withRiddles = computeBundleDiscount([...cart(b, w), { productId: 'riddles-book-1', quantity: 3 }]);
      expect(withRiddles).toEqual(without);
    }
  });
});

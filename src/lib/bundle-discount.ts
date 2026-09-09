export interface BundleItem {
  productId: string;
  quantity: number;
}

export interface BundleResult {
  bundleDiscount: number;
  bundleName: string | null;
}

export const BUNDLE_BOOK_IDS = ['ai-book', 'encryption-book', 'algorithms-book'];
export const BUNDLE_WORKBOOK_IDS = ['ai-workbook', 'encryption-workbook', 'algorithms-workbook'];

// Mirrors the bundles in lib/products.ts: same names, same `savings`. The
// bundle pages add plain products to the cart and rely on this function for
// the price, so the two must not drift apart - bundle-discount.test.ts fails
// if they do. Ordered richest first, which is also the order the tiers are
// packed and named in.
export const BUNDLE_TIERS = [
  { name: 'מארז המומחים', plural: 'מארזי מומחים', workbookSets: 2, discount: 85 },
  { name: 'מארז החוקרים הצעירים', plural: 'מארזי חוקרים צעירים', workbookSets: 1, discount: 45 },
  { name: 'מארז הספרים', plural: 'מארזי ספרים', workbookSets: 0, discount: 15 },
] as const;

// Every tier costs one complete set of the three books, and differs only in how
// many workbook sets it swallows. Because the second workbook set is worth more
// than the first (45 -> 85 beats 15 -> 45), concentrating workbooks always beats
// spreading them: fill as many expert bundles as possible, then researchers,
// then plain book bundles. bundle-discount.test.ts checks this against an
// exhaustive search.
function packBundles(bookSets: number, workbookSets: number): number[] {
  const counts: number[] = [];
  let books = bookSets;
  let workbooks = workbookSets;

  for (const tier of BUNDLE_TIERS) {
    const take = tier.workbookSets > 0
      ? Math.min(books, Math.floor(workbooks / tier.workbookSets))
      : books;
    counts.push(take);
    books -= take;
    workbooks -= take * tier.workbookSets;
  }

  return counts;
}

// "הנחת מארז המומחים", "הנחת 2 מארזי ספרים",
// "הנחת מארז המומחים + מארז החוקרים הצעירים".
function describeBundles(counts: number[]): string {
  return counts
    .map((count, i) => {
      if (count === 0) return null;
      const tier = BUNDLE_TIERS[i];
      return count === 1 ? tier.name : `${count} ${tier.plural}`;
    })
    .filter((label): label is string => label !== null)
    .join(' + ');
}

export function computeBundleDiscount(items: BundleItem[]): BundleResult {
  // Sum the cart once, ignoring anything that is not a whole positive
  // quantity. The counts below multiply the tier discounts, so a NaN,
  // fractional or negative quantity - a hand-edited localStorage cart is the
  // realistic source - would otherwise leak straight into the price.
  const totals = new Map<string, number>();
  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) continue;
    totals.set(item.productId, (totals.get(item.productId) ?? 0) + item.quantity);
  }
  const qty = (id: string) => totals.get(id) ?? 0;

  // A bundle needs one of each title, so the number of complete sets in the
  // cart is capped by the scarcest title. Surplus copies of a single title
  // earn nothing.
  const bookSets = Math.min(...BUNDLE_BOOK_IDS.map(qty));
  const workbookSets = Math.min(...BUNDLE_WORKBOOK_IDS.map(qty));

  if (bookSets < 1) return { bundleDiscount: 0, bundleName: null };

  const counts = packBundles(bookSets, workbookSets);
  const bundleDiscount = counts.reduce((sum, count, i) => sum + count * BUNDLE_TIERS[i].discount, 0);

  return { bundleDiscount, bundleName: describeBundles(counts) };
}

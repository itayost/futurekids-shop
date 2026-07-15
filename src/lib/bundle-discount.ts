export interface BundleItem {
  productId: string;
  quantity: number;
}

export interface BundleResult {
  bundleDiscount: number;
  bundleName: string | null;
}

const BUNDLE_BOOK_IDS = ['ai-book', 'encryption-book', 'algorithms-book'];
const BUNDLE_WORKBOOK_IDS = ['ai-workbook', 'encryption-workbook', 'algorithms-workbook'];

export function computeBundleDiscount(items: BundleItem[]): BundleResult {
  const qty = (id: string) =>
    items.filter((i) => i.productId === id).reduce((sum, i) => sum + i.quantity, 0);

  const hasAllBooks = BUNDLE_BOOK_IDS.every((id) => qty(id) >= 1);
  const minWorkbook = Math.min(...BUNDLE_WORKBOOK_IDS.map(qty));

  if (hasAllBooks) {
    if (minWorkbook >= 2) return { bundleDiscount: 115, bundleName: 'מארז המומחים' };
    if (minWorkbook >= 1) return { bundleDiscount: 45, bundleName: 'מארז החוקרים הצעירים' };
    return { bundleDiscount: 15, bundleName: 'מארז הספרים' };
  }
  return { bundleDiscount: 0, bundleName: null };
}

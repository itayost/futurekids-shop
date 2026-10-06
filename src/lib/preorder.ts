import type { Product } from '@/types';
import { getProductById } from './products';

// How an order leaves the warehouse. A pre-order book ships on its release
// date; when it is ordered alongside in-stock items the whole order waits for
// it and goes out as one parcel.
export type OrderShipping = 'regular' | 'preorder-only' | 'mixed';

export type PreorderLookup = (id: string) => Pick<Product, 'name' | 'preorder'> | undefined;

type PreorderProduct = Pick<Product, 'name'> & { preorder: NonNullable<Product['preorder']> };

// An unknown productId (a delisted product on an old order) counts as in stock.
function scanOrder(productIds: string[], getProduct: PreorderLookup) {
  const preorderProducts = productIds
    .map((id) => getProduct(id))
    .filter((p): p is PreorderProduct => Boolean(p?.preorder));
  const shipping: OrderShipping =
    preorderProducts.length === 0 ? 'regular' : preorderProducts.length === productIds.length ? 'preorder-only' : 'mixed';
  return { shipping, preorderProduct: preorderProducts[0] };
}

export function classifyOrderShipping(productIds: string[], getProduct: PreorderLookup = getProductById): OrderShipping {
  return scanOrder(productIds, getProduct).shipping;
}

// The shipping note shown in the cart and at checkout, or null for a regular
// cart. Name and date come from the catalog, never from copy.
export function preorderShippingNote(productIds: string[], getProduct: PreorderLookup = getProductById): string | null {
  const { shipping, preorderProduct } = scanOrder(productIds, getProduct);
  if (!preorderProduct) return null;

  const { name, preorder } = preorderProduct;
  return shipping === 'preorder-only'
    ? `רכישה מוקדמת: הספר יישלח עם צאתו ב${preorder.shipsBy}.`
    : `רכישה מוקדמת: כל ההזמנה, כולל הספרים שבמלאי, תישלח במשלוח אחד עם צאת ${name} ב${preorder.shipsBy}.`;
}

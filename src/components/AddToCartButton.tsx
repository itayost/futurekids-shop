'use client';

import { useCart } from './CartProvider';
import { Product } from '@/types';

interface AddToCartButtonProps {
  product: Product;
  className?: string;
}

export default function AddToCartButton({ product, className }: AddToCartButtonProps) {
  const { addItem } = useCart();

  return (
    <button
      onClick={() => addItem(product)}
      className={className}
    >
      הוספה לסל הקניות
    </button>
  );
}

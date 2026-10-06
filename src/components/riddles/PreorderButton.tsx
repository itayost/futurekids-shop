'use client';

import { ShoppingCart } from 'lucide-react';
import AddToCartButton from '@/components/AddToCartButton';
import { book, shipsBy } from './content';
import styles from './riddles.module.css';

interface PreorderButtonProps {
  className?: string;
}

export function PreorderButton({ className = '' }: PreorderButtonProps) {
  return (
    <AddToCartButton
      product={book}
      skipCompanionCheck
      className={`${styles.press} inline-flex w-full cursor-pointer items-center justify-center gap-3 rounded-[14px] border-[3px] border-(--r-ink) bg-(--r-red) px-6 py-4 text-lg font-black text-white hover:bg-(--r-red-deep) md:py-5 md:text-xl ${className}`}
    >
      <ShoppingCart className="size-6 shrink-0" strokeWidth={2.5} aria-hidden="true" />
      {shipsBy ? 'להזמנה מוקדמת' : 'הוספה לסל הקניות'}
    </AddToCartButton>
  );
}

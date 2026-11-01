interface SalePriceProps {
  price: number;
  was: number;
  className?: string;
  wasClassName?: string;
}

// The sale figure, then the price it replaces.
export function SalePrice({ price, was, className = '', wasClassName = '' }: SalePriceProps) {
  return (
    <span className={`inline-flex items-baseline gap-1.5 whitespace-nowrap tabular-nums ${className}`}>
      <span>₪{price}</span>
      <span className="sr-only">במקום</span>
      <s className={`text-[max(0.62em,12px)] font-bold decoration-2 ${wasClassName}`}>₪{was}</s>
    </span>
  );
}

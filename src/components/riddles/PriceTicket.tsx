import { book, listPrice, savings, savingsPercent, shipMonth, shipYear } from './content';
import styles from './riddles.module.css';

interface PriceTicketProps {
  label?: string;
  meta?: string;
  className?: string;
}

// The pre-order price as a ticket: price on the main part, the month the book
// arrives on the perforated stub.
export function PriceTicket({ label, meta, className = '' }: PriceTicketProps) {
  return (
    <div
      className={`grid grid-cols-[1fr_auto] overflow-hidden rounded-[18px] border-4 border-(--r-ink) bg-(--r-paper) shadow-[6px_6px_0_0_var(--r-ink)] ${className}`}
    >
      <div className="min-w-0 px-4 py-4 md:px-6">
        {label && <p className="text-sm font-bold text-(--r-navy)">{label}</p>}
        <p className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-2">
          <span className="text-[44px] font-black leading-none tracking-[-0.02em] tabular-nums md:text-[56px]">
            <span className="text-[0.5em]">₪</span>
            {book.price}
          </span>
          {savings > 0 && (
            <>
              <span className="sr-only">במקום</span>
              <s className="text-[22px] font-bold text-[#767676] tabular-nums decoration-(--r-red) decoration-[3px]">
                ₪{listPrice}
              </s>
            </>
          )}
          {savings > 0 && (
            <span className="rounded-md border-2 border-(--r-ink) bg-(--r-red) px-2 py-1 text-sm font-black text-white">
              חוסכים {savingsPercent}%
            </span>
          )}
        </p>
        {meta && <p className="mt-2 text-sm font-medium max-md:hidden">{meta}</p>}
      </div>
      {shipMonth && (
        <div className="grid place-content-center border-s-4 border-dashed border-(--r-ink) bg-(--r-sun) px-4 text-center md:px-5">
          <span className="text-xs font-bold">יגיע במהלך</span>
          <span className={`${styles.hand} text-[40px] leading-[0.9] md:text-[46px]`}>{shipMonth}</span>
          <span className="text-sm font-black tabular-nums">{shipYear}</span>
        </div>
      )}
    </div>
  );
}

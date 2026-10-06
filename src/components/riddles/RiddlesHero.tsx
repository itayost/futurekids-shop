import Image from 'next/image';
import { Truck } from 'lucide-react';
import { PreorderTape } from './PreorderTape';
import { PriceTicket } from './PriceTicket';
import { PreorderButton } from './PreorderButton';
import { book, shipMonth, shipsBy } from './content';
import styles from './riddles.module.css';

export function RiddlesHero() {
  return (
    <header className={`${styles.hero} relative overflow-hidden border-b-4 border-(--r-ink)`}>
      {shipsBy && <PreorderTape text={`רכישה מוקדמת · הספר יגיע במהלך ${shipsBy}`} />}

      {/* Mobile: title beside a small cover, price and CTA full width below, so
          the buy box lands in the first screen. Desktop: the cover spans both. */}
      <div className="container mx-auto grid grid-cols-[1fr_auto] content-center gap-x-4 gap-y-6 px-4 pb-10 pt-7 [grid-template-areas:'title_cover''buy_buy'] md:grid-cols-[1.1fr_0.9fr] md:gap-x-12 md:gap-y-7 md:px-6 md:pb-16 md:pt-12 md:[grid-template-areas:'title_cover''buy_cover']">
        <div className="min-w-0 self-center [grid-area:title] md:self-end">
          <h1>
            <span className={`${styles.titleWarm} block text-[60px] font-black leading-[0.9] tracking-[-0.03em] text-(--r-ink-strong) md:text-[128px]`}>
              חידה!
            </span>
            <span className={`${styles.hand} ${styles.titleWarm} mt-1.5 block text-[36px] leading-none text-(--r-ink-strong) md:text-[64px]`}>
              לכל המשפחה
            </span>
          </h1>
          <p className="mt-4 flex items-center gap-2.5 text-[15px] font-bold leading-snug text-(--r-ink-strong) md:gap-3 md:text-lg">
            <span
              className="grid size-9 shrink-0 place-items-center rounded-full border-[3px] border-(--r-ink) bg-(--r-navy) text-xl font-black text-white md:size-[54px] md:text-[28px]"
              aria-label="ספר ראשון בסדרה"
            >
              1
            </span>
            <span className="text-balance">ד&quot;ר סתיו אלבר ושמרית שולמן</span>
          </p>
        </div>

        <div className="grid max-w-[520px] gap-4 self-start [grid-area:buy]">
          <PriceTicket
            label={shipsBy ? 'מחיר רכישה מוקדמת' : undefined}
            meta="כריכה קשה · 104 עמודים צבעוניים · מגיל 7"
          />
          <PreorderButton />
          {shipsBy && (
            <p className="flex items-center gap-3 rounded-xl border-2 border-dashed border-white/70 px-4 py-3 font-bold leading-snug text-white">
              <Truck className="size-6 shrink-0" strokeWidth={2.5} aria-hidden="true" />
              <span className="text-balance">
                הזמנתם גם ספרים מהמלאי? כל ההזמנה תגיע יחד, במשלוח אחד, במהלך {shipsBy}.
              </span>
            </p>
          )}
        </div>

        <div className="relative self-center justify-self-center [grid-area:cover]">
          <Image
            src={book.image}
            alt="כריכת הספר חידה! לכל המשפחה"
            width={1149}
            height={1600}
            priority
            sizes="(max-width: 767px) 140px, 400px"
            className="h-auto w-[140px] -rotate-4 rounded-md border-4 border-(--r-ink) shadow-[6px_6px_0_0_var(--r-ink)] md:rounded-lg md:border-[5px] md:w-[400px] md:shadow-[14px_14px_0_0_var(--r-ink)]"
          />
          {shipsBy && (
            <p className="absolute -right-3 bottom-5 -rotate-8 whitespace-nowrap rounded-lg border-[3px] border-(--r-ink) bg-(--r-red) px-2.5 py-1.5 text-center text-white shadow-[4px_4px_0_0_var(--r-ink)] md:-right-12 md:bottom-24 md:px-5 md:py-2.5">
              <span className="block text-sm font-black leading-tight md:text-[26px]">רכישה מוקדמת</span>
              <span className="block text-xs font-bold md:text-base">יגיע ב{shipMonth}</span>
            </p>
          )}
        </div>
      </div>
    </header>
  );
}

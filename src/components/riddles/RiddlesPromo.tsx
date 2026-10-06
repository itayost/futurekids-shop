import Image from 'next/image';
import Link from 'next/link';
import { Info, ShoppingCart } from 'lucide-react';
import AddToCartButton from '@/components/AddToCartButton';
import { book, listPrice, savings, shipsBy } from './content';
import styles from './riddles.module.css';

// Homepage band introducing the new series: buy from here, or read more on /riddles.
export function RiddlesPromo() {
  return (
    <section className={`${styles.root} container mx-auto px-4 pt-16 md:px-6 md:pt-20`} aria-labelledby="riddles-promo">
      <div
        className={`${styles.promo} relative mx-auto grid max-w-[960px] items-center gap-6 overflow-hidden rounded-3xl border-4 border-(--r-ink) px-5 py-7 shadow-[8px_8px_0_0_var(--r-ink)] md:grid-cols-[auto_1fr] md:gap-12 md:px-12 md:py-10`}
      >
        <span className="absolute left-4 top-4 -rotate-6 rounded-full border-2 border-(--r-ink) bg-(--r-sun) px-3 py-1 text-lg font-black text-(--r-ink) md:left-6 md:top-6 md:px-4 md:text-xl">
          חדש
        </span>
        <div className="relative justify-self-center">
          <Image
            src={book.image}
            alt=""
            width={1149}
            height={1600}
            sizes="(max-width: 767px) 150px, 200px"
            className="h-auto w-[150px] -rotate-4 rounded-md border-4 border-(--r-ink) shadow-[6px_6px_0_0_var(--r-ink)] md:w-[200px]"
          />
          {shipsBy && (
            <span className="absolute -right-4 bottom-6 -rotate-8 whitespace-nowrap rounded-lg border-[3px] border-(--r-ink) bg-(--r-red) px-2.5 py-1 text-sm font-black text-white shadow-[3px_3px_0_0_var(--r-ink)] md:text-base">
              רכישה מוקדמת
            </span>
          )}
        </div>
        <div className="text-center md:text-start">
          <h2 id="riddles-promo" className={`${styles.titleWarm} text-3xl font-black leading-tight text-(--r-ink-strong) md:text-5xl`}>
            חידה! לכל המשפחה
          </h2>
          <p className="mx-auto mt-3 max-w-[52ch] text-lg font-bold text-(--r-ink-strong) md:mx-0">
            מאות חידות של משחקי מילים, הצפנה, מספרים ותבניות. מגיל 7, וגם למבוגרים.
          </p>
          <p className="mt-5 flex flex-wrap items-center justify-center gap-3 md:justify-start">
            <span className="rounded-xl border-[3px] border-(--r-ink) bg-(--r-paper) px-3 py-1.5 font-black tabular-nums">
              <span className="text-2xl">₪{book.price}</span>
              {savings > 0 && (
                <>
                  {' '}
                  <s className="text-base text-[#767676] decoration-(--r-red) decoration-2">₪{listPrice}</s>
                </>
              )}
            </span>
            {shipsBy && (
              <span className="rounded-xl border-[3px] border-(--r-ink) bg-(--r-sun) px-3 py-2 font-black">
                יגיע במהלך {shipsBy}
              </span>
            )}
            <AddToCartButton
              product={book}
              skipCompanionCheck
              className={`${styles.press} inline-flex cursor-pointer items-center gap-2 rounded-xl border-[3px] border-(--r-ink) bg-(--r-red) px-4 py-2 font-black text-white hover:bg-(--r-red-deep)`}
            >
              <ShoppingCart className="size-5" strokeWidth={2.5} aria-hidden="true" />
              {shipsBy ? 'לרכישה מוקדמת' : 'הוספה לסל'}
            </AddToCartButton>
          </p>
          <Link
            href="/riddles"
            className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-(--r-navy) hover:underline"
          >
            <Info className="size-4" aria-hidden="true" />
            לפרטים נוספים
          </Link>
        </div>
      </div>
    </section>
  );
}

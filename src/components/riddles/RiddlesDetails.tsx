import Image from 'next/image';
import { PackageCheck, TicketPercent, Truck } from 'lucide-react';
import { PriceTicket } from './PriceTicket';
import { PreorderButton } from './PreorderButton';
import { book, shipsBy } from './content';
import styles from './riddles.module.css';

// The book colour-codes each riddle family; the page headers in the gallery
// carry the same colours, so this row doubles as their legend.
// Black rather than the ink grey so the purple pill keeps large-text contrast.
const CATEGORIES = [
  { label: 'משחקי מילים', color: 'bg-(--r-purple)' },
  { label: 'הצפנה', color: 'bg-(--r-orange)' },
  { label: 'מספרים ותבניות', color: 'bg-(--r-green)' },
];

const FACTS = [
  { value: '104', label: 'עמודים צבעוניים בכריכה קשה' },
  { value: '3', label: 'עולמות: מילים, הצפנה, מספרים' },
  { value: '+7', label: 'מגיל 7, וגם למבוגרים' },
];

export function RiddleCategories() {
  return (
    <ul className="mt-5 flex flex-wrap justify-center gap-2.5 md:gap-3" aria-label="שלושת סוגי החידות בספר">
      {CATEGORIES.map((c) => (
        <li
          key={c.label}
          className={`${styles.hand} ${c.color} rounded-lg text-black border-2 border-(--r-ink) px-3 pb-0.5 pt-1 text-[26px] leading-none md:text-[28px]`}
        >
          {c.label}
        </li>
      ))}
    </ul>
  );
}

export function RiddlesAbout() {
  const [question, ...paragraphs] = book.description.split('\n\n');
  return (
    <section className="mt-20 grid items-start gap-10 md:mt-28 md:grid-cols-[1.3fr_1fr]" aria-labelledby="riddles-about">
      <div>
        <h2 id="riddles-about" className="text-balance text-3xl font-black tracking-[-0.02em] md:text-[40px] md:leading-tight">
          {question}
        </h2>
        {paragraphs.map((p) => (
          <p key={p} className="mt-5 max-w-[62ch] text-lg leading-relaxed md:text-[19px]">
            {p}
          </p>
        ))}
        <p className="mt-4 max-w-[62ch] text-lg leading-relaxed md:text-[19px]">
          זמן איכות לכל המשפחה, בנסיעות, בטיולים, בשבתות וחגים וגם סתם ככה בשגרה.
        </p>
      </div>
      <dl className="grid gap-3.5 rounded-[18px] border-4 border-(--r-ink) bg-(--r-paper) p-6 shadow-[6px_6px_0_0_var(--r-ink)]">
        {FACTS.map((f) => (
          <div key={f.label} className="flex items-baseline gap-3.5 text-lg">
            <dt className="min-w-[70px] text-[30px] font-black tabular-nums text-(--r-navy)">{f.value}</dt>
            <dd>{f.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

// The terms a pre-order buyer needs, stated plainly. Hidden once released.
export function PreorderTerms() {
  if (!shipsBy) return null;
  const terms = [
    {
      Icon: Truck,
      title: 'מתי הספר יגיע?',
      text: `הספר זמין כעת לרכישה מוקדמת, ויהיה מוכן בחודש ${shipsBy}. הרוכשים ברכישה מוקדמת יקבלו את הספרים ראשונים מיד כשיהיו מוכנים.`,
    },
    {
      Icon: PackageCheck,
      title: 'הזמנתם גם ספרים מהמלאי?',
      text: `כל ההזמנה תגיע יחד, במשלוח אחד, במהלך ${shipsBy}.`,
    },
    {
      Icon: TicketPercent,
      title: 'קופונים',
      text: 'הספר כבר במחיר מבצע, ולכן קופונים אינם חלים עליו.',
    },
  ];
  return (
    <section
      className="mt-16 grid gap-5 rounded-[18px] border-4 border-(--r-ink) bg-(--r-paper) px-6 py-5 shadow-[6px_6px_0_0_var(--r-ink)] md:mt-20 md:grid-cols-3 md:gap-8"
      aria-label="תנאי הרכישה המוקדמת"
    >
      {terms.map(({ Icon, title, text }) => (
        <div key={title} className="flex gap-3">
          <Icon className="mt-0.5 size-6 shrink-0 text-(--r-navy)" strokeWidth={2.5} aria-hidden="true" />
          <div>
            <h3 className="text-[17px] font-black">{title}</h3>
            <p className="mt-1 text-[15px] leading-normal">{text}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

export function RiddlesClose() {
  return (
    <section
      className="mx-auto mt-16 grid max-w-[880px] items-center gap-6 rounded-3xl border-4 border-(--r-ink) bg-(--r-orange) px-5 py-6 text-center shadow-[10px_10px_0_0_var(--r-ink)] md:mt-20 md:grid-cols-[180px_1fr] md:gap-8 md:p-8 md:text-start"
      aria-labelledby="riddles-close"
    >
      <Image
        src={book.image}
        alt=""
        width={1149}
        height={1600}
        sizes="180px"
        className="mx-auto h-auto w-[150px] -rotate-3 rounded-md border-4 border-(--r-ink) shadow-[6px_6px_0_0_var(--r-ink)] md:w-[180px]"
      />
      <div className="min-w-0">
        <h2 id="riddles-close" className={`${styles.title} mb-4 text-3xl font-black text-white md:text-[40px]`}>
          {shipsBy ? 'הבטיחו לעצמכם עותק ראשון' : 'הספר כאן'}
        </h2>
        <PriceTicket className="mb-5 text-start md:max-w-[460px]" />
        <PreorderButton />
      </div>
    </section>
  );
}

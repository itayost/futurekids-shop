import { SALE } from '@/lib/sale';

// Sits above the free shipping bar on every page while the sale is on. Both are
// Ink, so a faint rule keeps them reading as two lines of one band.
export function SaleBar() {
  return (
    <aside
      aria-label={`מבצע ${SALE.name}`}
      className="when-sale border-b border-white/20 bg-[#545454] px-2.5 py-[7px] text-center text-[13px] font-bold leading-snug text-white md:px-4 md:py-[9px] md:text-[15px]"
    >
      <b className="font-black text-[#facc15]">{SALE.name}</b>
      <span className="mx-[0.5em] opacity-55" aria-hidden="true">·</span>
      {SALE.percent}% הנחה על כל האתר
      <span className="mx-[0.5em] opacity-55" aria-hidden="true">·</span>
      {SALE.dates}
      <span className="max-md:hidden">
        <span className="mx-[0.5em] opacity-55" aria-hidden="true">·</span>
        ללא כפל קופונים
      </span>
    </aside>
  );
}

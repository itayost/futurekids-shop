import { FREE_SHIPPING_FROM } from '@/lib/shipping';

// Sits above the navbar on every page. The thresholds come from lib/shipping,
// the same numbers the checkout charges by, so the promise and the price cannot
// drift apart. Each offer gets its own line on phones; from md up they share one.
export function FreeShippingBar() {
  return (
    <aside
      aria-label="משלוח חינם"
      className="bg-[#545454] px-4 py-[7px] text-center text-[13px] font-bold leading-snug text-white md:py-[9px] md:text-[15px]"
    >
      <p>
        <span className="block md:inline">
          <b className="font-black text-[#facc15]">משלוח חינם</b> לנקודת חלוקה ברכישה מעל{' '}
          {FREE_SHIPPING_FROM['pickup-point']} ש&quot;ח
        </span>
        <span className="sr-only">. </span>
        <span className="mx-[0.6em] opacity-55 max-md:hidden" aria-hidden="true">·</span>
        <span className="block md:inline">
          <b className="font-black text-[#facc15]">משלוח חינם</b> עד הבית ברכישה מעל{' '}
          {FREE_SHIPPING_FROM.delivery} ש&quot;ח
        </span>
      </p>
    </aside>
  );
}

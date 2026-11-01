// Sits above the navbar on every page while the sale is on. The RLM after "IL"
// stops the browser reading "IL · 15%" as one left-to-right run, which would show
// the percentage before the campaign name.
export function SaleBar() {
  return (
    <aside
      aria-label="מבצע שופינג IL"
      className="when-sale bg-[#545454] px-2.5 py-[7px] text-center text-[13px] font-bold leading-snug text-white md:px-4 md:py-[9px] md:text-[15px]"
    >
      <b className="font-black text-[#facc15]">שופינג IL&rlm;</b>
      <span className="mx-[0.5em] opacity-55" aria-hidden="true">·</span>
      15% הנחה על כל האתר
      <span className="mx-[0.5em] opacity-55" aria-hidden="true">·</span>
      4-5 בנובמבר
      <span className="max-md:hidden">
        <span className="mx-[0.5em] opacity-55" aria-hidden="true">·</span>
        ללא כפל קופונים
      </span>
    </aside>
  );
}

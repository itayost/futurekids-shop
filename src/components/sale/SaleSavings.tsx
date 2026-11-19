// The savings confirmation line, under the total in the cart and at checkout,
// for what a product's own promo (such as a launch price) takes off.
export function SaleSavings({ amount }: { amount: number }) {
  if (amount <= 0) return null;
  return (
    <p className="mt-3 flex items-center justify-between gap-3 rounded-lg border-[3px] border-[#545454] bg-[#facc15] px-3 py-2 text-sm font-black text-[#3a3a3a]">
      <span>חסכתם במחיר המבצע</span>
      <span className="whitespace-nowrap text-[17px] tabular-nums">₪{amount}</span>
    </p>
  );
}

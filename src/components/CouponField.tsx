'use client';

import { Check } from 'lucide-react';

interface CouponFieldProps {
  value: string;
  onChange: (value: string) => void;
  onApply: () => void;
  applied: boolean;
  discount: number;
  message: string | null;
  hasExcludedItem: boolean;
}

export default function CouponField({
  value,
  onChange,
  onApply,
  applied,
  discount,
  message,
  hasExcludedItem,
}: CouponFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex gap-2 py-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            // Enter applies the coupon, like the button next to it.
            if (e.key === 'Enter') {
              e.preventDefault();
              onApply();
            }
          }}
          placeholder="קוד קופון"
          aria-label="קוד קופון"
          className="input-brutal flex-1 rounded-lg p-2 bg-gray-50 text-sm"
        />
        <button
          type="button"
          onClick={onApply}
          className="btn-retro bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-lg px-4 py-2 border-2 border-[#545454] text-sm"
        >
          החל
        </button>
      </div>
      {hasExcludedItem && (
        <p className="text-xs text-gray-500">ספרים שכבר נמכרים במחיר מבצע אינם כלולים בהנחת קופון</p>
      )}
      {message && applied && (
        <p className="flex items-center gap-1.5 text-sm font-bold text-emerald-600">
          <Check size={18} strokeWidth={3} aria-hidden="true" />
          {discount > 0 ? `${message}, חסכתם ₪${discount}` : message}
        </p>
      )}
      {message && !applied && <p className="text-sm text-red-600">{message}</p>}
    </div>
  );
}

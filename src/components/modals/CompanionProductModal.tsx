'use client';

import { useEffect } from 'react';
import { Product } from '@/types';
import { CompanionOffer } from '@/domain/product-relationships';
import { X, Plus, Check } from 'lucide-react';
import Image from 'next/image';

interface CompanionProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: CompanionOffer;
  onAddCompanion: () => void;
  onSkip: () => void;
}

export function CompanionProductModal({
  isOpen,
  onClose,
  offer,
  onAddCompanion,
  onSkip,
}: CompanionProductModalProps) {
  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const { baseProduct, companionProduct, bundlePrice } = offer;
  const isBaseBook = baseProduct.type === 'book';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white border-4 border-[#545454] rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto hard-shadow-lg animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-pink-100 to-sky-100 border-b-4 border-[#545454] p-6 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 hover:bg-white/50 rounded-full transition-colors"
            aria-label="סגור"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="text-center">
            <div className="inline-block bg-yellow-400 border-2 border-[#545454] px-4 py-1 rounded-full font-bold text-sm mb-3 transform -rotate-2">
              המלצה חמה!
            </div>
            <h2 className="text-2xl font-black">
              {isBaseBook ? 'הספר נוסף! מה עם החוברת?' : 'החוברת נוספה! מה עם הספר?'}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Product Preview */}
          <div className="flex gap-3 items-center justify-center">
            <ProductPreview product={baseProduct} isAdded />
            <div className="flex-shrink-0 bg-gray-100 rounded-full p-2 border-2 border-[#545454]">
              <Plus className="w-6 h-6" />
            </div>
            <ProductPreview product={companionProduct} />
          </div>

          {/* Value Proposition */}
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-4 border-emerald-400 rounded-xl p-5 text-center">
            <p className="text-xl font-black mb-2">
              יחד ב-₪{bundlePrice} בלבד!
            </p>
            <p className="text-gray-700 font-medium">
              {isBaseBook
                ? 'הספר מלמד, החוברת מתרגלת - החוויה המושלמת!'
                : 'החוברת מתרגלת, הספר מעמיק - החבילה המנצחת!'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onAddCompanion}
              className="btn-retro bg-emerald-500 hover:bg-emerald-600 text-white text-xl py-4 rounded-xl font-black border-4 border-[#545454] w-full transition-transform hover:scale-[1.02]"
            >
              כן! הוסף גם {companionProduct.type === 'book' ? 'את הספר' : 'את החוברת'} - ₪{companionProduct.price}
            </button>
            <button
              onClick={onSkip}
              className="text-gray-500 hover:text-gray-700 font-bold py-3 w-full transition-colors underline underline-offset-4"
            >
              לא תודה, רק {baseProduct.type === 'book' ? 'הספר' : 'החוברת'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductPreview({ product, isAdded = false }: { product: Product; isAdded?: boolean }) {
  const colorBg = {
    blue: 'bg-sky-100',
    pink: 'bg-pink-100',
    green: 'bg-emerald-100',
  };

  return (
    <div className="flex-1 max-w-[140px] relative">
      {isAdded && (
        <div className="absolute -top-2 -right-2 z-10 bg-emerald-500 rounded-full p-1.5 border-2 border-[#545454]">
          <Check className="w-4 h-4 text-white" strokeWidth={3} />
        </div>
      )}
      <div className={`${colorBg[product.color]} rounded-xl p-3 border-3 border-[#545454] ${isAdded ? 'opacity-75' : ''}`}>
        <Image
          src={product.image}
          alt={product.name}
          width={120}
          height={160}
          className="w-full h-auto object-contain"
        />
      </div>
      <p className="text-xs font-bold mt-2 text-center line-clamp-2">{product.name}</p>
      <p className="text-sm font-black text-center">₪{product.price}</p>
    </div>
  );
}

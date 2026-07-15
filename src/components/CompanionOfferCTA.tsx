'use client';

import { useState } from 'react';
import { Product } from '@/types';
import { CompanionOffer } from '@/domain/product-relationships';
import { useCart } from './CartProvider';
import { CompanionProductModal } from './modals/CompanionProductModal';
import { books, workbooks, bundles } from '@/lib/products';
import { Package, ShoppingCart, Sparkles } from 'lucide-react';
import Link from 'next/link';

// The full "complete trilogy" bundle (3 books + 3 workbooks); adding it
// triggers the cart's automatic bundle discount.
const FULL_BUNDLE = bundles[1];

interface CompanionOfferCTAProps {
  offer: CompanionOffer;
  colorClasses: {
    button: string;
    accent: string;
    accentHover: string;
  };
}

export function CompanionOfferCTA({ offer, colorClasses }: CompanionOfferCTAProps) {
  const { addItem, addItems, setIsOpen, items } = useCart();
  const [showModal, setShowModal] = useState(false);
  const { baseProduct, companionProduct, bundlePrice } = offer;

  const cartProductIds = items.map(item => item.productId);
  const hasBaseInCart = cartProductIds.includes(baseProduct.id);
  const hasCompanionInCart = cartProductIds.includes(companionProduct.id);

  const handleAddBoth = () => {
    addItem(baseProduct);
    addItem(companionProduct);
  };

  const handleAddFullBundle = () => {
    const bundleProducts: Product[] = [
      ...FULL_BUNDLE.bookIds.flatMap((id) => {
        const book = books.find((b) => b.id === id);
        return book ? [book] : [];
      }),
      ...FULL_BUNDLE.workbookIds.flatMap((id) => {
        const workbook = workbooks.find((w) => w.id === id);
        return workbook
          ? (Array.from({ length: FULL_BUNDLE.workbookQuantity }, () => workbook) as Product[])
          : [];
      }),
    ];
    addItems(bundleProducts);
    setIsOpen(true);
  };

  const handleAddSingle = () => {
    addItem(baseProduct);
    // Check if companion is already in cart, if not show modal
    if (!hasCompanionInCart) {
      setShowModal(true);
    }
  };

  const handleAddCompanionFromModal = () => {
    addItem(companionProduct);
    setShowModal(false);
  };

  return (
    <>
      <div className="space-y-4 mb-10">
        {/* Primary CTA: Bundle */}
        <button
          onClick={handleAddBoth}
          className={`btn-retro ${colorClasses.accent} ${colorClasses.accentHover} text-white text-xl w-full py-5 rounded-xl font-black border-2 border-[#545454] text-center transition-transform hover:scale-[1.02]`}
        >
          <div className="flex items-center justify-center gap-3">
            <Package className="w-7 h-7" />
            <span>
              {baseProduct.type === 'book' ? 'ספר' : 'חוברת'} + {companionProduct.type === 'book' ? 'ספר' : 'חוברת'} ביחד
            </span>
          </div>
          <div className="text-3xl font-black mt-1">₪{bundlePrice}</div>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-0.5 bg-gray-300"></div>
          <span className="text-gray-500 font-bold text-sm">או קנה בנפרד</span>
          <div className="flex-1 h-0.5 bg-gray-300"></div>
        </div>

        {/* Secondary CTAs: Individual */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleAddSingle}
            className={`btn-retro ${colorClasses.button} text-white py-4 rounded-xl font-bold border-2 border-[#545454] text-center transition-transform hover:scale-[1.02]`}
          >
            <ShoppingCart className="w-5 h-5 mx-auto mb-1" />
            <div className="text-sm">רק {baseProduct.type === 'book' ? 'הספר' : 'החוברת'}</div>
            <div className="text-xl font-black">₪{baseProduct.price}</div>
          </button>
          <Link
            href={`/products/${companionProduct.slug}`}
            className="btn-retro bg-white hover:bg-gray-50 text-gray-800 py-4 rounded-xl font-bold border-2 border-[#545454] text-center transition-transform hover:scale-[1.02] flex flex-col items-center justify-center"
          >
            <div className="text-sm">רק {companionProduct.type === 'book' ? 'הספר' : 'החוברת'}</div>
            <div className="text-xl font-black">₪{companionProduct.price}</div>
            <div className="text-xs text-gray-500">לפרטים נוספים &larr;</div>
          </Link>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-0.5 bg-gray-300"></div>
          <span className="text-gray-500 font-bold text-sm">או קחו את הכל</span>
          <div className="flex-1 h-0.5 bg-gray-300"></div>
        </div>

        {/* Full bundle upsell: all 3 books + 3 workbooks */}
        <button
          onClick={handleAddFullBundle}
          className="btn-retro bg-pink-500 hover:bg-pink-600 text-white w-full py-4 rounded-xl font-black border-2 border-[#545454] text-center transition-transform hover:scale-[1.02]"
        >
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6" />
            <span>{FULL_BUNDLE.name} - כל הספרים + החוברות</span>
          </div>
          <div className="flex items-center justify-center gap-3 mt-1">
            <span className="text-2xl font-black">₪{FULL_BUNDLE.price}</span>
            <span className="text-base line-through opacity-70">₪{FULL_BUNDLE.originalPrice}</span>
            <span className="text-xs bg-white/25 px-2 py-0.5 rounded-full border border-white/40">
              חיסכון ₪{FULL_BUNDLE.savings}
            </span>
          </div>
        </button>
      </div>

      {/* Companion suggestion modal */}
      <CompanionProductModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        offer={offer}
        onAddCompanion={handleAddCompanionFromModal}
        onSkip={() => setShowModal(false)}
      />
    </>
  );
}

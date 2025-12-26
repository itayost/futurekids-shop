'use client';

import { useState } from 'react';
import { Product } from '@/types';
import { CompanionOffer } from '@/domain/product-relationships';
import { useCart } from './CartProvider';
import { CompanionProductModal } from './modals/CompanionProductModal';
import { Package, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

interface CompanionOfferCTAProps {
  offer: CompanionOffer;
  colorClasses: {
    button: string;
    accent: string;
    accentHover: string;
  };
}

export function CompanionOfferCTA({ offer, colorClasses }: CompanionOfferCTAProps) {
  const { addItem, items } = useCart();
  const [showModal, setShowModal] = useState(false);
  const { baseProduct, companionProduct, bundlePrice } = offer;

  const cartProductIds = items.map(item => item.productId);
  const hasBaseInCart = cartProductIds.includes(baseProduct.id);
  const hasCompanionInCart = cartProductIds.includes(companionProduct.id);

  const handleAddBoth = () => {
    addItem(baseProduct);
    addItem(companionProduct);
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
          className={`btn-retro ${colorClasses.accent} ${colorClasses.accentHover} text-white text-xl w-full py-5 rounded-xl font-black border-2 border-black text-center transition-transform hover:scale-[1.02]`}
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
            className={`btn-retro ${colorClasses.button} text-white py-4 rounded-xl font-bold border-2 border-black text-center transition-transform hover:scale-[1.02]`}
          >
            <ShoppingCart className="w-5 h-5 mx-auto mb-1" />
            <div className="text-sm">רק {baseProduct.type === 'book' ? 'הספר' : 'החוברת'}</div>
            <div className="text-xl font-black">₪{baseProduct.price}</div>
          </button>
          <Link
            href={`/products/${companionProduct.slug}`}
            className="btn-retro bg-white hover:bg-gray-50 text-gray-800 py-4 rounded-xl font-bold border-2 border-black text-center transition-transform hover:scale-[1.02] flex flex-col items-center justify-center"
          >
            <div className="text-sm">רק {companionProduct.type === 'book' ? 'הספר' : 'החוברת'}</div>
            <div className="text-xl font-black">₪{companionProduct.price}</div>
            <div className="text-xs text-gray-500">לפרטים נוספים &larr;</div>
          </Link>
        </div>
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

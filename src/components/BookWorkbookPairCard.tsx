'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Package, ShoppingCart, Info } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from './CartProvider';
import { CompanionProductModal } from './modals/CompanionProductModal';
import { productRelationshipService } from '@/domain/product-relationships';

interface BookWorkbookPairCardProps {
  book: Product;
  workbook: Product;
}

const colorClasses = {
  blue: {
    bg: 'bg-sky-50',
    bgLight: 'bg-sky-100',
    accent: 'bg-sky-500',
    accentHover: 'hover:bg-sky-600',
    text: 'text-sky-600',
    border: 'border-sky-300',
  },
  pink: {
    bg: 'bg-pink-50',
    bgLight: 'bg-pink-100',
    accent: 'bg-pink-500',
    accentHover: 'hover:bg-pink-600',
    text: 'text-pink-600',
    border: 'border-pink-300',
  },
  green: {
    bg: 'bg-emerald-50',
    bgLight: 'bg-emerald-100',
    accent: 'bg-emerald-500',
    accentHover: 'hover:bg-emerald-600',
    text: 'text-emerald-600',
    border: 'border-emerald-300',
  },
};

export default function BookWorkbookPairCard({ book, workbook }: BookWorkbookPairCardProps) {
  const { addItem, items } = useCart();
  const [showModal, setShowModal] = useState(false);
  const colors = colorClasses[book.color];
  const bundlePrice = book.price + workbook.price;

  const cartProductIds = items.map(item => item.productId);
  const hasWorkbookInCart = cartProductIds.includes(workbook.id);

  const handleAddBoth = () => {
    addItem(book);
    addItem(workbook);
  };

  const handleAddBookOnly = () => {
    addItem(book);
    // Show modal if workbook not in cart
    if (!hasWorkbookInCart) {
      setShowModal(true);
    }
  };

  const handleAddWorkbookOnly = () => {
    addItem(workbook);
  };

  const handleAddCompanion = () => {
    addItem(workbook);
    setShowModal(false);
  };

  const offer = productRelationshipService.createCompanionOffer(book, workbook);

  return (
    <>
      <div className={`${colors.bg} border-4 border-black rounded-3xl overflow-hidden hard-shadow`}>
        {/* Product Images */}
        <div className={`${colors.bgLight} p-6 relative`}>
          <div className="flex gap-4 justify-center items-end">
            {/* Book Image */}
            <div className="relative">
              <Image
                src={book.image}
                alt={book.name}
                width={140}
                height={200}
                className="rounded-lg border-2 border-black shadow-lg"
              />
            </div>
            {/* Workbook Image */}
            <div className="relative -mr-8">
              <Image
                src={workbook.image}
                alt={workbook.name}
                width={100}
                height={140}
                className="rounded-lg border-2 border-black shadow-lg"
              />
            </div>
          </div>
          {/* Price Badge */}
          <div className="absolute top-3 left-3 bg-yellow-400 border-2 border-black text-black font-black text-lg px-3 py-1 rounded-full transform -rotate-6">
            ₪{bundlePrice}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Title */}
          <h3 className="font-black text-xl mb-2 text-gray-900">{book.name}</h3>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {book.description.split('\n')[0]}
          </p>

          {/* Main CTA: Buy Both */}
          <button
            onClick={handleAddBoth}
            className={`btn-retro ${colors.accent} ${colors.accentHover} text-white w-full py-3 rounded-xl font-bold border-2 border-black mb-3 flex items-center justify-center gap-2`}
          >
            <Package className="w-5 h-5" />
            <span>ספר + חוברת ביחד</span>
            <span className="font-black">₪{bundlePrice}</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-xs text-gray-500 font-medium">או בנפרד</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Secondary: Individual Options */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleAddBookOnly}
              className="btn-retro bg-white hover:bg-gray-50 text-gray-800 py-2 rounded-lg text-sm font-bold border-2 border-black flex flex-col items-center"
            >
              <ShoppingCart className="w-4 h-4 mb-1" />
              <span>רק ספר</span>
              <span className="font-black">₪{book.price}</span>
            </button>
            <button
              onClick={handleAddWorkbookOnly}
              className="btn-retro bg-white hover:bg-gray-50 text-gray-800 py-2 rounded-lg text-sm font-bold border-2 border-black flex flex-col items-center"
            >
              <ShoppingCart className="w-4 h-4 mb-1" />
              <span>רק חוברת</span>
              <span className="font-black">₪{workbook.price}</span>
            </button>
          </div>

          {/* Details Link */}
          <Link
            href={`/products/${book.slug}`}
            className={`mt-3 flex items-center justify-center gap-1 text-sm ${colors.text} font-bold hover:underline`}
          >
            <Info className="w-4 h-4" />
            לפרטים נוספים
          </Link>
        </div>
      </div>

      {/* Companion Modal */}
      <CompanionProductModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        offer={offer}
        onAddCompanion={handleAddCompanion}
        onSkip={() => setShowModal(false)}
      />
    </>
  );
}

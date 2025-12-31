'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Star, Check, Gift, Users, BookOpen } from 'lucide-react';
import BookComposite from '@/components/BookComposite';
import { bundles, books, workbooks } from '@/lib/products';
import { useCart } from '@/components/CartProvider';

const bundleIcons = [
  <BookOpen key="books" className="w-5 h-5" />,
  <Gift key="complete" className="w-5 h-5" />,
  <Users key="ultimate" className="w-5 h-5" />,
];

function BundleContent() {
  const { addItem } = useCart();
  const searchParams = useSearchParams();
  const initialIndex = parseInt(searchParams.get('selected') || '1', 10);
  const [selectedIndex, setSelectedIndex] = useState(
    initialIndex >= 0 && initialIndex < bundles.length ? initialIndex : 1
  );

  // Update selection when URL param changes
  useEffect(() => {
    const selected = parseInt(searchParams.get('selected') || '1', 10);
    if (selected >= 0 && selected < bundles.length) {
      setSelectedIndex(selected);
    }
  }, [searchParams]);

  const selectedBundle = bundles[selectedIndex];

  const handleAddBundle = () => {
    // Add all books
    selectedBundle.bookIds.forEach((bookId) => {
      const book = books.find((b) => b.id === bookId);
      if (book) addItem(book);
    });

    // Add workbooks based on bundle
    if (selectedBundle.workbookQuantity > 0) {
      selectedBundle.workbookIds.forEach((workbookId) => {
        const workbook = workbooks.find((w) => w.id === workbookId);
        if (workbook) {
          for (let i = 0; i < selectedBundle.workbookQuantity; i++) {
            addItem(workbook);
          }
        }
      });
    }
  };

  // Get items to display in checklist
  const getBundleItems = () => {
    const items: string[] = [];

    // Add books
    selectedBundle.bookIds.forEach((bookId) => {
      const book = books.find((b) => b.id === bookId);
      if (book) items.push(`ספר ${book.name}`);
    });

    // Add workbooks with quantity
    if (selectedBundle.workbookQuantity > 0) {
      selectedBundle.workbookIds.forEach((workbookId) => {
        const workbook = workbooks.find((w) => w.id === workbookId);
        if (workbook) {
          const qty = selectedBundle.workbookQuantity;
          items.push(qty > 1 ? `${workbook.name} (${qty}x)` : workbook.name);
        }
      });
    }

    return items;
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Bundle Selector Tabs */}
      <div className="flex justify-center mb-8 mt-4">
        <div className="bg-white border-4 border-[#545454] rounded-2xl p-2 flex gap-2 hard-shadow">
          {bundles.map((bundle, index) => (
            <button
              key={bundle.id}
              onClick={() => setSelectedIndex(index)}
              className={`relative px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                selectedIndex === index
                  ? 'bg-pink-500 text-white border-2 border-[#545454]'
                  : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              {bundleIcons[index]}
              <span className="hidden sm:inline">{bundle.name}</span>
              <span className="sm:hidden">{bundle.subtitle}</span>
              {index === 1 && (
                <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full border border-[#545454]">
                  פופולרי
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Card */}
      <div className="w-full bg-white border-4 border-[#545454] rounded-3xl overflow-hidden hard-shadow flex flex-col md:flex-row">
        {/* Image Section */}
        <div className="md:w-1/2 bg-pink-100 flex items-center justify-center p-6 md:p-12 border-b-4 md:border-b-0 md:border-l-4 border-[#545454] relative">
          <BookComposite size="md" />
          {selectedBundle.workbookQuantity > 0 && (
            <div className="absolute bottom-4 right-4 bg-white border-2 border-[#545454] rounded-lg px-3 py-2 text-sm font-bold">
              + {selectedBundle.workbookQuantity * 3} חוברות פעילות
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="md:w-1/2 p-6 md:p-10 flex flex-col justify-center bg-white">
          <div className="inline-block bg-pink-500 text-white px-4 py-1 rounded-full border-2 border-[#545454] font-bold text-sm mb-6 w-fit flex items-center gap-2">
            <Star className="w-4 h-4" fill="currentColor" />
            {selectedIndex === 1 ? 'הכי פופולרי' : selectedIndex === 2 ? 'הכי משתלם' : 'בסיסי'}
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
            {selectedBundle.name}
            <span className="block text-pink-500 text-2xl mt-2 font-bold">
              {selectedBundle.subtitle}
            </span>
          </h1>

          <p className="text-xl text-gray-700 mb-8 font-medium">{selectedBundle.description}</p>

          <ul className="space-y-3 mb-10">
            {getBundleItems().map((item, index) => (
              <li key={index} className="flex items-center text-lg font-bold text-gray-800">
                <Check className="w-6 h-6 text-emerald-500 ml-3 flex-shrink-0" strokeWidth={3} />
                {item}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-end gap-3 sm:gap-4 mb-8">
            <div className="text-5xl sm:text-6xl font-black text-gray-900">₪{selectedBundle.price}</div>
            <div className="text-xl sm:text-2xl text-gray-400 line-through font-bold mb-1 sm:mb-2">
              ₪{selectedBundle.originalPrice}
            </div>
            <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold border border-emerald-300 mb-1 sm:mb-2">
              חיסכון של ₪{selectedBundle.savings}
            </div>
          </div>

          <button
            onClick={handleAddBundle}
            className="btn-retro bg-pink-500 text-white text-xl w-full py-5 rounded-xl font-black border-2 border-[#545454] hover:bg-pink-600"
          >
            אני רוצה את המארז הזה!
          </button>

          {/* Bundle comparison hint */}
          {selectedIndex === 0 && (
            <p className="text-center text-gray-500 text-sm mt-4">
              רוצים גם חוברות פעילות? בחרו במארז החוקרים הצעירים
            </p>
          )}
          {selectedIndex === 1 && (
            <p className="text-center text-gray-500 text-sm mt-4">
              מתאים לכל המשפחה! מארז פופולרי לילדים ולהורים
            </p>
          )}
          {selectedIndex === 2 && (
            <p className="text-center text-gray-500 text-sm mt-4">
              מושלם למשפחות גדולות או לכיתות - 2 חוברות מכל סוג!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BundlePage() {
  return (
    <div className="bg-pink-50 min-h-screen p-6">
      <Suspense fallback={<div className="max-w-6xl mx-auto text-center py-20">טוען...</div>}>
        <BundleContent />
      </Suspense>
    </div>
  );
}

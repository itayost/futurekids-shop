'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Minus, Plus, ShoppingBag, Sparkles, Star, Gift } from 'lucide-react';
import { useCart } from './CartProvider';
import { products, bundles, books, workbooks } from '@/lib/products';
import { Product } from '@/types';
import { getCompanionProduct } from '@/application/hooks/useCompanionOffer';

export default function Cart() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, subtotal, bundleDiscount, bundleName, hasBundle, total, itemCount, addItem } = useCart();
  const [isClosing, setIsClosing] = useState(false);
  const bundle = bundles[1]; // Default bundle (most popular)

  const handleAddBundle = () => {
    // Add all books
    bundle.bookIds.forEach((bookId) => {
      const book = books.find((b) => b.id === bookId);
      if (book) addItem(book);
    });

    // Add workbooks based on bundle
    if (bundle.workbookQuantity > 0) {
      bundle.workbookIds.forEach((workbookId) => {
        const workbook = workbooks.find((w) => w.id === workbookId);
        if (workbook) {
          for (let i = 0; i < bundle.workbookQuantity; i++) {
            addItem(workbook);
          }
        }
      });
    }
  };

  // Get products not in cart for suggestions - prioritize companion products
  const cartProductIds = items.map((item) => item.productId);

  const getSmartSuggestions = (): Product[] => {
    const companions: Product[] = [];

    // Find missing companions for products in cart
    items.forEach(item => {
      const companion = getCompanionProduct(item.productId);
      if (companion && !cartProductIds.includes(companion.id) && !companions.find(c => c.id === companion.id)) {
        companions.push(companion);
      }
    });

    // Get other products not in cart or already in companions
    const others = products.filter(p =>
      !cartProductIds.includes(p.id) && !companions.find(c => c.id === p.id)
    );

    return [...companions, ...others];
  };

  const suggestions = getSmartSuggestions();

  // Reset closing state when cart opens
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
    }, 300); // Match animation duration
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
        onClick={handleClose}
      />

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-full sm:max-w-md bg-white z-50 border-r-4 border-[#545454] flex flex-col ${isClosing ? 'animate-slide-out-left' : 'animate-slide-in-left'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-4 border-[#545454]">
          <h2 className="text-2xl font-black flex items-center gap-2">
            <ShoppingBag size={24} />
            סל הקניות
            {itemCount > 0 && (
              <span
                key={itemCount}
                className="text-sm font-bold bg-pink-500 text-white px-2 py-1 rounded-full animate-badge-bounce"
              >
                {itemCount}
              </span>
            )}
          </h2>
          <button
            onClick={handleClose}
            className="p-3 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="space-y-6">
              {/* Empty State Header */}
              <div className="text-center py-4">
                <ShoppingBag size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 text-lg font-medium">הסל ריק</p>
                <p className="text-gray-400 text-sm">בחרו ספרים להוספה לסל</p>
              </div>

              {/* Bundle Deal */}
              <button
                onClick={handleAddBundle}
                className="w-full text-right bg-pink-50 border-2 border-pink-300 rounded-xl p-4 hover:bg-pink-100 transition"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Star size={16} className="text-pink-500" fill="currentColor" />
                  <span className="text-pink-600 font-bold text-sm">הכי פופולרי!</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
                    <Gift size={28} className="text-pink-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-sm">{bundle.name}</p>
                    <p className="text-xs text-gray-600">3 ספרים + 3 חוברות</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-pink-500 font-black">₪{bundle.price}</span>
                      <span className="text-gray-400 text-xs line-through">₪{bundle.originalPrice}</span>
                    </div>
                  </div>
                  <div className="bg-pink-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex-shrink-0">
                    + הוסף
                  </div>
                </div>
              </button>

              {/* All Products */}
              <div>
                <h3 className="font-bold text-sm text-gray-600 mb-3 flex items-center gap-2">
                  <Sparkles size={16} className="text-pink-500" />
                  הספרים שלנו
                </h3>
                <div className="space-y-3">
                  {products.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => addItem(product)}
                      className="w-full flex items-center gap-3 bg-gray-50 border-2 border-[#545454] rounded-xl p-3 hover:bg-gray-100 transition text-right"
                    >
                      <div className="w-14 h-18 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={44}
                          height={60}
                          className="object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{product.name}</p>
                        <p className="text-pink-500 font-black">₪{product.price}</p>
                      </div>
                      <div className="bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold flex-shrink-0">
                        + הוסף
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-4 bg-gray-50 border-2 border-[#545454] rounded-xl p-4"
                >
                  <div className="w-20 h-24 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={60}
                      height={80}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm mb-1">{item.name}</h3>
                    <p className="text-pink-500 font-black">₪{item.price}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-10 h-10 bg-white border-2 border-[#545454] rounded-lg flex items-center justify-center hover:bg-gray-100 active:scale-95 transition-transform"
                      >
                        <Minus size={18} />
                      </button>
                      <span
                        key={item.quantity}
                        className="font-bold w-8 text-center animate-pop"
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-10 h-10 bg-white border-2 border-[#545454] rounded-lg flex items-center justify-center hover:bg-gray-100 active:scale-95 transition-transform"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-gray-400 hover:text-red-500 transition"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {items.length > 0 && suggestions.length > 0 && (
            <div className="mt-6 pt-6 border-t-2 border-gray-200">
              <h3 className="font-bold text-sm text-gray-600 mb-3 flex items-center gap-2">
                <Sparkles size={16} className="text-pink-500" />
                אולי יעניין אותך גם...
              </h3>
              <div className="space-y-3">
                {suggestions.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addItem(product)}
                    className="w-full flex items-center gap-3 bg-gray-50 border-2 border-[#545454] rounded-xl p-3 hover:bg-gray-100 transition text-right"
                  >
                    <div className="w-14 h-18 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={44}
                        height={60}
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{product.name}</p>
                      <p className="text-pink-500 font-black">₪{product.price}</p>
                    </div>
                    <div className="bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold flex-shrink-0">
                      + הוסף
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t-4 border-[#545454] bg-gray-50">
            {/* Subtotal */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">סכום ביניים:</span>
              <span className="font-bold">₪{subtotal}</span>
            </div>

            {/* Bundle Discount */}
            {hasBundle && bundleName && (
              <div className="flex items-center justify-between mb-2 text-emerald-600">
                <span className="flex items-center gap-1">
                  <Gift size={16} />
                  הנחת {bundleName}:
                </span>
                <span className="font-bold">-₪{bundleDiscount}</span>
              </div>
            )}

            {/* Total */}
            <div className="flex items-center justify-between mb-4 pt-2 border-t border-gray-200">
              <span className="text-lg font-bold">סה&quot;כ לתשלום:</span>
              <span key={total} className="text-3xl font-black animate-pop">
                ₪{total}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={handleClose}
              className="btn-retro block w-full bg-pink-500 text-white text-center py-4 rounded-xl font-black border-2 border-[#545454] hover:bg-pink-600"
            >
              לתשלום
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Minus, Plus, ShoppingBag, Sparkles } from 'lucide-react';
import { useCart } from './CartProvider';
import { products } from '@/lib/products';

export default function Cart() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, total, itemCount, addItem } = useCart();
  const [isClosing, setIsClosing] = useState(false);

  // Get products not in cart for suggestions
  const cartProductIds = items.map((item) => item.productId);
  const suggestions = products.filter((product) => !cartProductIds.includes(product.id));

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
      <div className={`fixed top-0 left-0 h-full w-full sm:max-w-md bg-white z-50 border-r-4 border-black flex flex-col ${isClosing ? 'animate-slide-out-left' : 'animate-slide-in-left'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-4 border-black">
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
            <div className="text-center py-12">
              <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg font-medium">הסל ריק</p>
              <p className="text-gray-400 text-sm mt-2">הוסיפו ספרים לסל הקניות</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-4 bg-gray-50 border-2 border-black rounded-xl p-4"
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
                        className="w-10 h-10 bg-white border-2 border-black rounded-lg flex items-center justify-center hover:bg-gray-100 active:scale-95 transition-transform"
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
                        className="w-10 h-10 bg-white border-2 border-black rounded-lg flex items-center justify-center hover:bg-gray-100 active:scale-95 transition-transform"
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
              <div className="flex gap-3 overflow-x-auto pb-2">
                {suggestions.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addItem(product)}
                    className="flex-shrink-0 w-32 bg-gray-50 border-2 border-black rounded-xl p-3 hover:bg-gray-100 transition text-right"
                  >
                    <div className="w-full h-16 bg-white rounded-lg flex items-center justify-center mb-2">
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={40}
                        height={56}
                        className="object-contain"
                      />
                    </div>
                    <p className="font-bold text-xs truncate">{product.name}</p>
                    <p className="text-pink-500 font-black text-sm">₪{product.price}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t-4 border-black bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-bold">סה&quot;כ לתשלום:</span>
              <span key={total} className="text-3xl font-black animate-pop">
                ₪{total}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={handleClose}
              className="btn-retro block w-full bg-pink-500 text-white text-center py-4 rounded-xl font-black border-2 border-black hover:bg-pink-600"
            >
              לתשלום
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

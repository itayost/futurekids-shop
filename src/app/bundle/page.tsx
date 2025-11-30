'use client';

import { Star, Check } from 'lucide-react';
import BookComposite from '@/components/BookComposite';
import { bundle, products } from '@/lib/products';
import { useCart } from '@/components/CartProvider';

export default function BundlePage() {
  const { addItem } = useCart();

  const handleAddBundle = () => {
    // Add all products in the bundle
    products.forEach((product) => {
      addItem(product);
    });
  };

  return (
    <div className="bg-pink-50 min-h-screen flex items-center justify-center p-6">
      <div className="mt-8 w-full max-w-6xl bg-white border-4 border-black rounded-3xl overflow-hidden hard-shadow flex flex-col md:flex-row">
        {/* Image Section */}
        <div className="md:w-1/2 bg-pink-100 flex items-center justify-center p-6 md:p-12 border-b-4 md:border-b-0 md:border-l-4 border-black relative">
          <BookComposite size="md" />
        </div>

        {/* Content Section */}
        <div className="md:w-1/2 p-6 md:p-10 flex flex-col justify-center bg-white">
          <div className="inline-block bg-pink-500 text-white px-4 py-1 rounded-full border-2 border-black font-bold text-sm mb-6 w-fit flex items-center gap-2">
            <Star className="w-4 h-4" fill="currentColor" />
            הכי משתלם
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
            {bundle.name}
            <span className="block text-pink-500 text-2xl mt-2 font-bold">
              {bundle.subtitle}
            </span>
          </h1>

          <p className="text-xl text-gray-700 mb-8 font-medium">{bundle.description}</p>

          <ul className="space-y-4 mb-10">
            {products.map((product) => (
              <li key={product.id} className="flex items-center text-lg font-bold text-gray-800">
                <Check className="w-6 h-6 text-emerald-500 ml-3 flex-shrink-0" strokeWidth={3} />
                {product.name}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-end gap-3 sm:gap-4 mb-8">
            <div className="text-5xl sm:text-6xl font-black text-gray-900">₪{bundle.price}</div>
            <div className="text-xl sm:text-2xl text-gray-400 line-through font-bold mb-1 sm:mb-2">
              ₪{bundle.originalPrice}
            </div>
            <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold border border-emerald-300 mb-1 sm:mb-2">
              חיסכון של ₪{bundle.savings}
            </div>
          </div>

          <button
            onClick={handleAddBundle}
            className="btn-retro bg-pink-500 text-white text-xl w-full py-5 rounded-xl font-black border-2 border-black hover:bg-pink-600"
          >
            אני רוצה את המארז הזה!
          </button>
        </div>
      </div>
    </div>
  );
}

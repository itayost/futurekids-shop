'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

const colorClasses = {
  blue: {
    bg: 'bg-sky-100',
    text: 'text-sky-600',
    hover: 'hover:bg-sky-50',
    border: 'border-sky-400',
  },
  pink: {
    bg: 'bg-pink-100',
    text: 'text-pink-600',
    hover: 'hover:bg-pink-50',
    border: 'border-pink-400',
  },
  green: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-600',
    hover: 'hover:bg-emerald-50',
    border: 'border-emerald-400',
  },
};

export default function ProductCard({ product }: ProductCardProps) {
  const colors = colorClasses[product.color];

  return (
    <Link href={`/products/${product.slug}`} className="block group">
      <div
        className={`bg-white border-4 border-black rounded-2xl p-6 hard-shadow ${colors.hover} transition-all duration-200`}
      >
        <div
          className={`${colors.bg} rounded-xl h-48 flex items-center justify-center mb-4 overflow-hidden`}
        >
          <Image
            src={product.image}
            alt={product.name}
            width={140}
            height={200}
            className="object-contain transform group-hover:scale-105 transition-transform duration-200"
          />
        </div>
        <h3 className="font-black text-xl mb-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-black">₪{product.price}</span>
          <span
            className={`${colors.text} font-bold text-sm group-hover:underline`}
          >
            לפרטים נוספים ←
          </span>
        </div>
      </div>
    </Link>
  );
}

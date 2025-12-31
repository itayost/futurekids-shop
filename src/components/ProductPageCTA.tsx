'use client';

import { Product } from '@/types';
import { useCompanionOffer } from '@/application/hooks/useCompanionOffer';
import { CompanionOfferCTA } from './CompanionOfferCTA';
import AddToCartButton from './AddToCartButton';

interface ProductPageCTAProps {
  product: Product;
  colorClasses: {
    button: string;
    accent: string;
    accentHover: string;
  };
}

export function ProductPageCTA({ product, colorClasses }: ProductPageCTAProps) {
  const offer = useCompanionOffer(product);

  // If there's a companion product, show the enhanced CTA
  if (offer) {
    return <CompanionOfferCTA offer={offer} colorClasses={colorClasses} />;
  }

  // Fallback to regular add to cart button
  return (
    <div className="flex gap-4 mb-10">
      <AddToCartButton
        product={product}
        className={`btn-retro ${colorClasses.button} text-white text-xl w-full py-4 rounded-xl font-bold border-2 border-[#545454] text-center`}
      />
    </div>
  );
}

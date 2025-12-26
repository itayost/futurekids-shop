'use client';

import { useMemo } from 'react';
import { Product } from '@/types';
import { productRelationshipService, CompanionOffer } from '@/domain/product-relationships';
import { products } from '@/lib/products';

export function useCompanionOffer(product: Product): CompanionOffer | null {
  return useMemo(() => {
    const companionId = productRelationshipService.getCompanionId(product.id);

    if (!companionId) return null;

    const companionProduct = products.find(p => p.id === companionId);
    if (!companionProduct) return null;

    return productRelationshipService.createCompanionOffer(product, companionProduct);
  }, [product]);
}

export function getCompanionProduct(productId: string): Product | null {
  const companionId = productRelationshipService.getCompanionId(productId);

  if (!companionId) return null;

  return products.find(p => p.id === companionId) || null;
}

export function shouldShowCompanionModal(productId: string, cartProductIds: string[]): boolean {
  const companionId = productRelationshipService.getCompanionId(productId);

  if (!companionId) return false;

  return !cartProductIds.includes(companionId);
}

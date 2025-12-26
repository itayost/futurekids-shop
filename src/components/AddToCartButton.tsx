'use client';

import { useState, useMemo, ReactNode } from 'react';
import { useCart } from './CartProvider';
import { Product } from '@/types';
import { getCompanionProduct } from '@/application/hooks/useCompanionOffer';
import { CompanionProductModal } from './modals/CompanionProductModal';
import { productRelationshipService } from '@/domain/product-relationships';

interface AddToCartButtonProps {
  product: Product;
  className?: string;
  skipCompanionCheck?: boolean;
  children?: ReactNode;
}

export default function AddToCartButton({
  product,
  className,
  skipCompanionCheck = false,
  children,
}: AddToCartButtonProps) {
  const { addItem, items } = useCart();
  const [showModal, setShowModal] = useState(false);
  const [companionProduct, setCompanionProduct] = useState<Product | null>(null);

  // Memoize cart product IDs
  const cartProductIds = useMemo(
    () => items.map(item => item.productId),
    [items]
  );

  const handleClick = () => {
    // First, add the product to cart
    addItem(product);

    // Check if we should show companion modal (only if not skipped)
    if (!skipCompanionCheck) {
      const companion = getCompanionProduct(product.id);

      // Show modal if:
      // 1. Companion exists
      // 2. Companion is not already in the cart
      if (companion && !cartProductIds.includes(companion.id)) {
        setCompanionProduct(companion);
        setShowModal(true);
      }
    }
  };

  const handleAddCompanion = () => {
    if (companionProduct) {
      addItem(companionProduct);
    }
    setShowModal(false);
    setCompanionProduct(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCompanionProduct(null);
  };

  // Memoize the offer calculation
  const offer = useMemo(() => {
    if (!companionProduct) return null;
    return productRelationshipService.createCompanionOffer(product, companionProduct);
  }, [product, companionProduct]);

  return (
    <>
      <button onClick={handleClick} className={className}>
        {children || 'הוספה לסל הקניות'}
      </button>

      {offer && (
        <CompanionProductModal
          isOpen={showModal}
          onClose={handleCloseModal}
          offer={offer}
          onAddCompanion={handleAddCompanion}
          onSkip={handleCloseModal}
        />
      )}
    </>
  );
}

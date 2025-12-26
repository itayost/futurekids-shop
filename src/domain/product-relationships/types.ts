import { Product } from '@/types';

export type ProductRelationType = 'companion' | 'bundle' | 'accessory';

export interface ProductRelationship {
  readonly productId: string;
  readonly relatedProductId: string;
  readonly relationType: ProductRelationType;
}

export interface CompanionOffer {
  readonly baseProduct: Product;
  readonly companionProduct: Product;
  readonly bundlePrice: number;
  readonly individualPrices: {
    base: number;
    companion: number;
  };
}

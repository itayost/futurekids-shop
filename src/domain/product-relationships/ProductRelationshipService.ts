import { Product } from '@/types';
import { ProductRelationship, CompanionOffer } from './types';

export class ProductRelationshipService {
  private relationships: Map<string, ProductRelationship[]>;

  constructor(relationships: ProductRelationship[]) {
    this.relationships = this.indexRelationships(relationships);
  }

  private indexRelationships(relationships: ProductRelationship[]): Map<string, ProductRelationship[]> {
    const map = new Map<string, ProductRelationship[]>();
    relationships.forEach(rel => {
      const existing = map.get(rel.productId) || [];
      map.set(rel.productId, [...existing, rel]);
    });
    return map;
  }

  getCompanionId(productId: string): string | null {
    const relations = this.relationships.get(productId);
    if (!relations) return null;
    const companion = relations.find(r => r.relationType === 'companion');
    return companion?.relatedProductId || null;
  }

  hasCompanionInCart(productId: string, cartProductIds: string[]): boolean {
    const companionId = this.getCompanionId(productId);
    if (!companionId) return false;
    return cartProductIds.includes(companionId);
  }

  createCompanionOffer(
    baseProduct: Product,
    companionProduct: Product
  ): CompanionOffer {
    const bundlePrice = baseProduct.price + companionProduct.price;

    return {
      baseProduct,
      companionProduct,
      bundlePrice,
      individualPrices: {
        base: baseProduct.price,
        companion: companionProduct.price,
      },
    };
  }
}

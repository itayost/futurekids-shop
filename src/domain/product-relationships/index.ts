export * from './types';
export * from './relationships';
export { ProductRelationshipService } from './ProductRelationshipService';

// Singleton instance for performance
import { ProductRelationshipService } from './ProductRelationshipService';
import { PRODUCT_RELATIONSHIPS } from './relationships';

export const productRelationshipService = new ProductRelationshipService(PRODUCT_RELATIONSHIPS);

import { ProductRelationship } from './types';

export const PRODUCT_RELATIONSHIPS: ProductRelationship[] = [
  // AI Book <-> Workbook
  { productId: 'ai-book', relatedProductId: 'ai-workbook', relationType: 'companion' },
  { productId: 'ai-workbook', relatedProductId: 'ai-book', relationType: 'companion' },

  // Encryption Book <-> Workbook
  { productId: 'encryption-book', relatedProductId: 'encryption-workbook', relationType: 'companion' },
  { productId: 'encryption-workbook', relatedProductId: 'encryption-book', relationType: 'companion' },

  // Algorithms Book <-> Workbook
  { productId: 'algorithms-book', relatedProductId: 'algorithms-workbook', relationType: 'companion' },
  { productId: 'algorithms-workbook', relatedProductId: 'algorithms-book', relationType: 'companion' },
];

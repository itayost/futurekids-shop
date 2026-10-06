export interface ExamplePage {
  src: string;
  source: 'book' | 'workbook';
  width: number;
  height: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  image: string;
  color: 'blue' | 'pink' | 'green';
  features: string[];
  audience?: string;
  type?: 'book' | 'workbook';
  examplePages?: ExamplePage[];
  // A product outside the original KidCode trilogy. Series products never
  // join the trilogy bundles and have no companion workbook.
  series?: 'riddles';
  // Pre-sale price display: the list price struck through next to `price`.
  compareAtPrice?: number;
  // Already discounted (e.g. pre-sale), so coupons never apply to it.
  excludeFromCoupons?: boolean;
  // Not in stock yet; shipsBy is a Hebrew label such as 'נובמבר 2026'.
  preorder?: { shipsBy: string };
  // A dedicated page that replaces the generic /products/[slug] page.
  landingPath?: string;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'undo';
  productName?: string;
  undoAction?: () => void;
}

export interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => void;
  addItems: (products: Product[]) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  bundleDiscount: number;
  bundleName: string | null;
  hasBundle: boolean;
  total: number;
  itemCount: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toasts: Toast[];
  dismissToast: (id: string) => void;
}

export interface Order {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  street?: string | null;
  house_number?: string | null;
  apartment?: string | null;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  total: number;
  items: OrderItem[];
  createdAt: Date;
  paidAt?: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
}

export interface PickupPoint {
  code: string;
  name: string;
  city: string;
  street: string;
  house: string;
  remarks: string;
  latitude: string;
  longitude: string;
}

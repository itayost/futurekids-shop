'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { CartItem, CartContextType, Product, Toast } from '@/types';
import ToastContainer from './Toast';

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'futurekids-cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch {
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage when items change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((current) => [...current, { ...toast, id }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const addItem = (product: Product) => {
    setItems((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if (existing) {
        return current.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...current,
        {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.image,
        },
      ];
    });
    // Show toast instead of opening cart
    addToast({
      type: 'success',
      message: 'נוסף לסל!',
      productName: product.name,
    });
  };

  const removeItem = (productId: string) => {
    const removedItem = items.find((item) => item.productId === productId);
    if (!removedItem) return;

    setItems((current) => current.filter((item) => item.productId !== productId));

    // Show undo toast
    addToast({
      type: 'undo',
      message: 'הפריט הוסר מהסל',
      productName: removedItem.name,
      undoAction: () => {
        setItems((current) => [...current, removedItem]);
      },
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((current) =>
      current.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  // Bundle detection: check which bundle applies and give best discount
  const BUNDLE_BOOK_IDS = ['ai-book', 'encryption-book', 'algorithms-book'];
  const BUNDLE_WORKBOOK_IDS = ['ai-workbook', 'encryption-workbook', 'algorithms-workbook'];

  // Helper to count items by ID
  const getItemQuantity = (productId: string) => {
    const item = items.find((i) => i.productId === productId);
    return item?.quantity || 0;
  };

  // Check if all 3 books are in cart
  const hasAllBooks = BUNDLE_BOOK_IDS.every((bookId) => getItemQuantity(bookId) >= 1);

  // Count workbooks
  const workbookCounts = BUNDLE_WORKBOOK_IDS.map((id) => getItemQuantity(id));
  const minWorkbookCount = Math.min(...workbookCounts);

  // Determine which bundle applies (check from highest discount first)
  let bundleDiscount = 0;
  let bundleName: string | null = null;

  if (hasAllBooks) {
    if (minWorkbookCount >= 2) {
      // Bundle 3: 3 books + 6 workbooks (2 of each) - saves 115₪
      bundleDiscount = 115;
      bundleName = 'מארז המומחים';
    } else if (minWorkbookCount >= 1) {
      // Bundle 2: 3 books + 3 workbooks - saves 45₪
      bundleDiscount = 45;
      bundleName = 'מארז החוקרים הצעירים';
    } else {
      // Bundle 1: 3 books only - saves 15₪
      bundleDiscount = 15;
      bundleName = 'מארז הספרים';
    }
  }

  const hasBundle = bundleDiscount > 0;
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal - bundleDiscount;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        bundleDiscount,
        bundleName,
        hasBundle,
        total,
        itemCount,
        isOpen,
        setIsOpen,
        toasts,
        dismissToast,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

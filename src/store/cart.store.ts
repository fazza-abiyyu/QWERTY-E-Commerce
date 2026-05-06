import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  product_id: string;
  variant_sku: string;
  name: string;
  variant_name: string;
  price: number;
  quantity: number;
  image_url: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (product_id: string, variant_sku: string) => void;
  updateQuantity: (product_id: string, variant_sku: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (newItem) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => item.product_id === newItem.product_id && item.variant_sku === newItem.variant_sku
          );

          if (existingItemIndex >= 0) {
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex].quantity += newItem.quantity;
            return { items: updatedItems };
          }

          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (product_id, variant_sku) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.product_id === product_id && item.variant_sku === variant_sku)
          )
        }));
      },

      updateQuantity: (product_id, variant_sku, quantity) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.product_id === product_id && item.variant_sku === variant_sku) {
              return { ...item, quantity: Math.max(1, quantity) };
            }
            return item;
          })
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      }
    }),
    {
      name: 'ecommerce-cart', // local storage key
    }
  )
);

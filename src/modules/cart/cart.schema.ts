export interface CartItem {
  product_id: string;
  variant_sku: string;
  quantity: number;
}

export interface Cart {
  id: string; // The ID is usually the user_id (one cart per user)
  items: CartItem[];
  updated_at: string;
}

export interface CartSyncPayload {
  user_id: string;
  items: CartItem[];
}

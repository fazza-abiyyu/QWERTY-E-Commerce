export interface OrderItem {
  product_id: string;
  variant_sku: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string; // Order ID e.g., ORD-12345
  user_id: string;
  items: OrderItem[];
  total_amount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: string;
  shipping_cost: number;
  payment_token?: string; // Token for custom payment processing
  payment_url?: string; // Midtrans or custom payment link
  payment_method?: string; // e.g. bca_va, gopay
  payment_code?: string; // The generated VA number or payment code
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

export interface PaymentWebhookPayload {
  order_id: string;
  transaction_status: string;
  fraud_status?: string;
}

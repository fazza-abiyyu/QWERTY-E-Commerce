import { JsonHandler } from '../../infrastructure/database/json-handler';
import { Order, PaymentWebhookPayload } from './order.schema';
import crypto from 'crypto';

const orderDb = new JsonHandler<Order>('orders.json');

export const OrderService = {
  async getAllOrders(): Promise<Order[]> {
    await this.autoExpireOrders();
    return await orderDb.readAll();
  },

  async getOrderById(id: string): Promise<Order | undefined> {
    return await orderDb.findById(id);
  },

  async getOrdersByUser(user_id: string): Promise<Order[]> {
    await this.autoExpireOrders();
    const all = await orderDb.readAll();
    return all.filter(o => o.user_id === user_id);
  },

  async createOrder(payload: Omit<Order, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<Order> {
    const orderId = `ORD-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`;
    const newOrder: Order = {
      id: orderId,
      ...payload,
      status: 'pending',
      payment_url: `/midtrans-simulator?order_id=${orderId}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString() // 1 hour
    };

    await orderDb.insert(newOrder);
    return newOrder;
  },

  async processPaymentByToken(token: string, action: 'pay' | 'cancel'): Promise<Order | null> {
    const allOrders = await orderDb.readAll();
    const order = allOrders.find(o => o.payment_token === token);
    
    if (!order) return null;

    let newStatus = order.status;
    if (action === 'pay') {
      newStatus = 'paid';
    } else if (action === 'cancel') {
      newStatus = 'cancelled';
    }

    return await orderDb.update(order.id, {
      status: newStatus,
      updated_at: new Date().toISOString()
    });
  },

  async processWebhook(payload: PaymentWebhookPayload): Promise<Order | null> {
    const order = await orderDb.findById(payload.order_id);
    if (!order) return null;

    let newStatus = order.status;
    if (payload.transaction_status === 'settlement' || payload.transaction_status === 'capture') {
      newStatus = 'paid';
    } else if (payload.transaction_status === 'cancel' || payload.transaction_status === 'expire') {
      newStatus = 'cancelled';
    }

    return await orderDb.update(payload.order_id, {
      status: newStatus,
      updated_at: new Date().toISOString()
    });
  },

  async updateOrderStatus(id: string, status: Order['status']): Promise<Order | null> {
    const order = await orderDb.findById(id);
    if (!order) return null;

    return await orderDb.update(id, {
      status,
      updated_at: new Date().toISOString()
    });
  },

  async updatePaymentCode(id: string, payment_method: string, payment_code: string): Promise<Order | null> {
    const order = await orderDb.findById(id);
    if (!order) return null;

    return await orderDb.update(id, {
      payment_method,
      payment_code,
      updated_at: new Date().toISOString()
    });
  },

  async getOrderByPaymentCode(payment_code: string): Promise<Order | undefined> {
    const all = await orderDb.readAll();
    return all.find(o => o.payment_code === payment_code);
  },

  async autoExpireOrders(): Promise<void> {
    const allOrders = await orderDb.readAll();
    const now = new Date();
    let changed = false;

    for (const order of allOrders) {
      if (order.status === 'pending' && order.expires_at) {
        const expiryDate = new Date(order.expires_at);
        if (now > expiryDate) {
          order.status = 'cancelled';
          order.updated_at = now.toISOString();
          changed = true;
        }
      }
    }

    if (changed) {
      await orderDb.writeAll(allOrders);
    }
  }
};

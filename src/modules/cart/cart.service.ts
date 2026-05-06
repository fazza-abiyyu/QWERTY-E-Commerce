import { JsonHandler } from '../../infrastructure/database/json-handler';
import { Cart, CartSyncPayload } from './cart.schema';

const cartDb = new JsonHandler<Cart>('cart.json');

export const CartService = {
  async getCartByUserId(user_id: string): Promise<Cart> {
    const cart = await cartDb.findById(user_id);
    if (!cart) {
      // Return empty cart if not exists
      return {
        id: user_id,
        items: [],
        updated_at: new Date().toISOString()
      };
    }
    return cart;
  },

  async syncCart(payload: CartSyncPayload): Promise<Cart> {
    const existingCart = await cartDb.findById(payload.user_id);
    
    if (existingCart) {
      return await cartDb.update(payload.user_id, {
        items: payload.items,
        updated_at: new Date().toISOString()
      }) as Cart;
    } else {
      const newCart: Cart = {
        id: payload.user_id,
        items: payload.items,
        updated_at: new Date().toISOString()
      };
      return await cartDb.insert(newCart);
    }
  }
};

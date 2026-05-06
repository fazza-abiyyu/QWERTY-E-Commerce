import { NextResponse } from 'next/server';
import { CartService } from '../../../../src/modules/cart/cart.service';
import { ResponseHandler } from '../../../../src/utils/handler/respon.utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.user_id || !Array.isArray(body.items)) {
      return ResponseHandler.badRequest('user_id and an array of items are required');
    }

    const updatedCart = await CartService.syncCart(body);
    return ResponseHandler.success(updatedCart, 'Cart synced successfully');
  } catch (error) {
    return ResponseHandler.error('Failed to sync cart', error);
  }
}

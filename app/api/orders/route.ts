import { NextResponse } from 'next/server';
import { OrderService } from '../../../src/modules/orders/order.service';
import { ResponseHandler } from '../../../src/utils/handler/respon.utils';

export async function GET() {
  try {
    const orders = await OrderService.getAllOrders();
    return ResponseHandler.success(orders, 'Orders retrieved successfully');
  } catch (error) {
    return ResponseHandler.error('Failed to retrieve orders', error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.user_id || !Array.isArray(body.items) || !body.total_amount || !body.shipping_address || typeof body.shipping_cost === 'undefined') {
      return ResponseHandler.badRequest('Missing required order fields');
    }

    const newOrder = await OrderService.createOrder(body);
    return ResponseHandler.success(newOrder, 'Order created successfully', 201);
  } catch (error) {
    return ResponseHandler.error('Failed to create order', error);
  }
}

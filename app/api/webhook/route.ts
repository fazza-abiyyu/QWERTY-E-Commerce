import { NextResponse } from 'next/server';
import { OrderService } from '../../../src/modules/orders/order.service';
import { ResponseHandler } from '../../../src/utils/handler/respon.utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.order_id || !body.transaction_status) {
      return ResponseHandler.badRequest('Missing webhook payload fields');
    }

    const updatedOrder = await OrderService.processWebhook(body);
    
    if (!updatedOrder) {
      return ResponseHandler.notFound('Order not found');
    }

    return ResponseHandler.success(updatedOrder, 'Webhook processed successfully');
  } catch (error) {
    return ResponseHandler.error('Failed to process webhook', error);
  }
}

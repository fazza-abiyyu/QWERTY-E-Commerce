import { NextResponse } from 'next/server';
import { OrderService } from '../../../../../src/modules/orders/order.service';
import { ResponseHandler } from '../../../../../src/utils/handler/respon.utils';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const order = await OrderService.getOrderByPaymentCode(code);
    
    if (!order) {
      return ResponseHandler.notFound('Order not found with this payment code');
    }

    return ResponseHandler.success(order, 'Order retrieved successfully');
  } catch (error) {
    return ResponseHandler.error('Failed to retrieve order', error);
  }
}

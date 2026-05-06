import { NextResponse } from 'next/server';
import { OrderService } from '../../../../src/modules/orders/order.service';
import { PaymentWebhookPayload } from '../../../../src/modules/orders/order.schema';

// Midtrans Webhook Handler
export async function POST(request: Request) {
  try {
    const body: PaymentWebhookPayload = await request.json();
    
    // In a real Midtrans integration, you would verify the signature key here:
    // const signatureKey = crypto.createHash('sha512').update(body.order_id + body.status_code + body.gross_amount + SERVER_KEY).digest('hex');
    // if (signatureKey !== body.signature_key) throw new Error('Invalid signature');

    if (!body.order_id || !body.transaction_status) {
      return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
    }

    const updatedOrder = await OrderService.processWebhook(body);
    
    if (!updatedOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

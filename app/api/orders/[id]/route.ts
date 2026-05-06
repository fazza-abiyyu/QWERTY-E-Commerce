import { OrderService } from '../../../../src/modules/orders/order.service';
import { ProductService } from '../../../../src/modules/products/product.service';
import { ResponseHandler } from '../../../../src/utils/handler/respon.utils';
import { Order } from '../../../../src/modules/orders/order.schema';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;
    
    // Handle updating payment code
    if (body.action === 'set_payment_code' && body.payment_method && body.payment_code) {
      const updatedOrder = await OrderService.updatePaymentCode(id, body.payment_method, body.payment_code);
      if (!updatedOrder) return ResponseHandler.notFound('Order not found');
      return ResponseHandler.success(updatedOrder, 'Payment code updated successfully');
    }

    if (!body.status) {
      return ResponseHandler.badRequest('Missing status field');
    }

    const validStatuses: Order['status'][] = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(body.status)) {
      return ResponseHandler.badRequest('Invalid status value');
    }

    const updatedOrder = await OrderService.updateOrderStatus(id, body.status);
    
    if (!updatedOrder) {
      return ResponseHandler.notFound('Order not found');
    }

    return ResponseHandler.success(updatedOrder, 'Order status updated successfully');
  } catch (error) {
    return ResponseHandler.error('Failed to update order status', error);
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await OrderService.getOrderById(id);
    
    if (!order) {
      return ResponseHandler.notFound('Order not found');
    }

    // Enrich order items with product details
    const enrichedItems = await Promise.all(
      order.items.map(async (item) => {
        const product = await ProductService.getById(item.product_id);
        return {
          ...item,
          product_name: product?.name || 'Unknown Product',
          product_image: product?.image_url || '',
        };
      })
    );

    return ResponseHandler.success({
      ...order,
      items: enrichedItems
    }, 'Order retrieved successfully');
  } catch (error) {
    return ResponseHandler.error('Failed to retrieve order', error);
  }
}

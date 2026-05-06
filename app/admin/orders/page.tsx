import { OrderService } from '../../../src/modules/orders/order.service';
import { ProductService } from '../../../src/modules/products/product.service';
import StatusUpdater from '../../../components/admin/StatusUpdater';
import { Package, User as UserIcon, Calendar, MapPin, Tag } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const orders = await OrderService.getAllOrders();
  const products = await ProductService.getAll();
  
  const currentFilter = searchParams.status || 'all';

  // Map products for easy lookup
  const productMap = products.reduce((acc, p) => {
    acc[p.id] = p.name;
    return acc;
  }, {} as Record<string, string>);

  const filteredOrders = orders
    .filter(order => currentFilter === 'all' || order.status === currentFilter)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const filters = [
    { label: 'All Orders', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Paid', value: 'paid' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 mt-1">Manage customer orders and shipments.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-fit overflow-x-auto">
        {filters.map((f) => (
          <a
            key={f.value}
            href={f.value === 'all' ? '/admin/orders' : `/admin/orders?status=${f.value}`}
            className={`px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all whitespace-nowrap ${
              currentFilter === f.value
                ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                : 'text-gray-400 hover:text-gray-900'
            }`}
          >
            {f.label}
          </a>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-gray-900 text-[14px]">{order.id}</span>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {new Date(order.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-[13px] font-medium text-gray-700">
                        <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                        {order.user_id === 'b1a2c3d4-e5f6-7890-abcd-ef1234567890' ? 'Admin' : 'Customer'}
                      </div>
                      <div className="flex items-start gap-1.5 text-[11px] text-gray-400 max-w-[200px]">
                        <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                        <span className="line-clamp-2">{order.shipping_address}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[12px] text-gray-600">
                          <Package className="w-3 h-3 text-gray-400" />
                          <span className="font-medium">{productMap[item.product_id] || 'Product'}</span>
                          <span className="text-gray-400 text-[10px]">({item.variant_sku})</span>
                          <span className="ml-auto text-gray-400 font-bold">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-black text-gray-900 text-[14px]">
                        Rp {order.total_amount.toLocaleString('id-ID')}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                        <Tag className="w-2.5 h-2.5" />
                        {order.payment_method || 'Unset'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-3">
                      <StatusUpdater orderId={order.id} currentStatus={order.status} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredOrders.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <ShoppingCart className="w-12 h-12 text-gray-100 mx-auto mb-3" />
            <p className="text-[14px]">No orders found with status &quot;{currentFilter}&quot;.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Just to avoid TS errors for the icon
import { ShoppingCart } from 'lucide-react';

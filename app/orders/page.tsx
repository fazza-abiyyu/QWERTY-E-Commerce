'use client';
import { useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import Link from 'next/link';

interface Order {
  id: string;
  user_id: string;
  items: { product_id: string; variant_sku: string; quantity: number; price: number }[];
  total_amount: number;
  status: string;
  shipping_address: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-white border border-gray-200 text-gray-400',
  paid: 'bg-gray-900 text-white',
  shipped: 'bg-gray-100 text-gray-900',
  delivered: 'bg-gray-900 text-white',
  cancelled: 'bg-white border border-gray-100 text-gray-300',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrders([...data.data].sort((a: Order, b: Order) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        }
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold tracking-tight text-[#111] mb-1">My Orders</h1>
      <p className="text-[14px] text-gray-400 mb-10">Track and view your order history</p>

      {loading ? (
        <div className="py-24 text-center text-gray-300 text-[14px]">Loading...</div>
      ) : orders.length === 0 ? (
        <div className="py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#f5f5f5] flex items-center justify-center mx-auto mb-5">
            <Package className="w-7 h-7 text-gray-300" strokeWidth={1.5} />
          </div>
          <p className="text-[15px] font-medium text-[#111] mb-1">No orders yet</p>
          <p className="text-[14px] text-gray-400 mb-6">Start shopping and your orders will appear here.</p>
          <Link href="/products" className="inline-flex px-6 py-2.5 bg-[#111] text-white text-[13px] font-medium rounded-full hover:bg-[#333] transition-colors">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link 
              key={order.id} 
              href={`/orders/${order.id}`}
              data-testid={`order-item-${order.id}`} 
              className="block rounded-2xl bg-[#f7f7f7] p-5 hover:bg-[#f0f0f0] transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-[13px] font-bold text-[#111] font-mono">{order.id}</p>
                  <p className="text-[12px] text-gray-400 mt-0.5">
                    {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <span className={`text-[11px] font-bold tracking-wider uppercase px-3 py-1 rounded-full w-fit ${statusColors[order.status] || 'bg-gray-100 text-gray-500'}`}>
                  {order.status}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-200/80">
                <p className="text-[13px] text-gray-400">{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                <p className="text-[15px] font-bold text-[#111]">Rp {order.total_amount.toLocaleString('id-ID')}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, MapPin, Calendar, CreditCard, HelpCircle, Copy, Check } from 'lucide-react';
import Link from 'next/link';

interface OrderItem {
  product_id: string;
  variant_sku: string;
  quantity: number;
  price: number;
  product_name: string;
  product_image: string;
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  shipping_address: string;
  created_at: string;
  items: OrderItem[];
  payment_url?: string;
  payment_method?: string;
  payment_code?: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-white border border-gray-200 text-gray-400',
  paid: 'bg-gray-900 text-white',
  shipped: 'bg-gray-100 text-gray-900',
  delivered: 'bg-gray-900 text-white',
  cancelled: 'bg-white border border-gray-100 text-gray-300',
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    if (order?.payment_code) {
      navigator.clipboard.writeText(order.payment_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrder(data.data);
        }
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="max-w-3xl mx-auto px-6 py-32 text-center text-gray-300">Loading order details...</div>;
  if (!order) return <div className="max-w-3xl mx-auto px-6 py-32 text-center">Order not found</div>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <button onClick={() => router.push('/orders')} className="flex items-center gap-2 text-gray-400 hover:text-[#111] transition-colors mb-8 group">
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span className="text-[14px] font-medium">Back to Orders</span>
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111] mb-1">Order Details</h1>
          <p className="text-[14px] text-gray-400 font-mono">{order.id}</p>
        </div>
        <span className={`text-[12px] font-bold tracking-wider uppercase px-4 py-1.5 rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-500'}`}>
          {order.status}
        </span>
      </div>

      {order.status === 'pending' && (
        <div className="mb-8 rounded-2xl bg-gray-50 border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
          <div>
            <h3 className="text-gray-900 font-bold mb-2 flex items-center gap-2">
              <CreditCard className="w-5 h-5" /> Awaiting Payment
            </h3>
            {order.payment_code ? (
              <div className="space-y-1">
                <p className="text-gray-500 text-[14px]">Please transfer exact amount to complete your order.</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[12px] font-bold text-gray-900 bg-gray-200/50 px-2 py-1 rounded uppercase">
                    {order.payment_method?.replace('_', ' ')}
                  </span>
                  <span className="font-mono font-black text-lg tracking-tight text-gray-900">
                    {order.payment_code}
                  </span>
                  <button
                    onClick={copyCode}
                    className="text-gray-400 hover:text-gray-900 transition-colors p-1.5 rounded-lg hover:bg-gray-100 active:scale-90"
                    title="Copy number"
                  >
                    {copied ? <Check className="w-4 h-4 text-gray-900" /> : <Copy className="w-4 h-4" />}
                  </button>
                  
                  <div className="relative group ml-1 flex items-center">
                    <button className="text-gray-400 hover:text-gray-900 transition-colors p-1">
                      <HelpCircle className="w-4 h-4" />
                    </button>
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 w-[140px] p-2.5 bg-gray-900 text-white text-[11px] font-medium rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all text-center pointer-events-auto shadow-xl z-10">
                      Testing? <Link href="/webhook-simulator" className="text-gray-400 hover:text-white underline underline-offset-2 ml-1">Open Simulator</Link>
                      <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-gray-900 rotate-45 -mt-1"></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-[14px]">Please select a payment method to complete your order.</p>
            )}
          </div>
          <div className="shrink-0 flex flex-col gap-2">
            {!order.payment_code && order.payment_url ? (
              <button 
                onClick={() => router.push(order.payment_url!)}
                className="px-6 py-3 bg-gray-900 text-white text-[13px] font-bold rounded-xl hover:bg-black transition-colors shadow-sm"
              >
                Proceed to Payment
              </button>
            ) : null}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Items */}
          <div className="rounded-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-gray-100">
              <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Items</p>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div key={item.variant_sku} className="p-5 flex gap-4">
                  <div className="w-16 h-20 rounded-lg bg-gray-50 overflow-hidden flex-shrink-0">
                    <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="text-[14px] font-semibold text-[#111]">{item.product_name}</h3>
                    <p className="text-[12px] text-gray-400 mt-1">Qty: {item.quantity} × Rp {item.price.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="text-right flex flex-col justify-center">
                    <p className="text-[14px] font-bold text-[#111]">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Summary */}
          <div className="rounded-2xl bg-[#f7f7f7] p-6">
            <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-4">Summary</h3>
            <div className="space-y-3 text-[14px]">
              <div className="flex justify-between text-gray-500"><span>Subtotal</span><span className="text-[#111]">Rp {order.total_amount.toLocaleString('id-ID')}</span></div>
              <div className="flex justify-between text-gray-500"><span>Shipping</span><span className="text-green-600">Free</span></div>
              <div className="pt-3 border-t border-gray-200 flex justify-between font-bold text-[#111]">
                <span>Total</span>
                <span>Rp {order.total_amount.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-5 px-1">
            <div className="flex gap-3">
              <Calendar className="w-4 h-4 text-gray-400 mt-0.5" strokeWidth={1.5} />
              <div>
                <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-1">Date</p>
                <p className="text-[13px] text-[#111]">{new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" strokeWidth={1.5} />
              <div>
                <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-1">Shipping Address</p>
                <p className="text-[13px] text-[#111] leading-relaxed">{order.shipping_address}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

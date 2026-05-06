'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../../src/store/cart.store';
import { useAuthStore } from '../../src/store/auth.store';
import { MapPin } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const user = useAuthStore((s) => s.user);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const cartItems = useCartStore((s) => s.items);
  const totalPrice = useCartStore((s) => s.getTotalPrice());
  const clearCart = useCartStore((s) => s.clearCart);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (mounted) {
      if (user?.role === 'admin') {
        router.push('/');
        return;
      }
      if (!isSuccess && cartItems.length === 0) {
        router.push('/cart');
        return;
      }
      checkAuth();
    }
  }, [mounted, cartItems, router, checkAuth, isSuccess, user]);

  if (!mounted || (!isSuccess && cartItems.length === 0) || !user || user.role === 'admin') return null;

  const hasAddress = user.address && user.address.province && user.address.city && user.address.detail;

  const formatAddress = () => {
    if (!user.address) return '';
    const parts = [user.address.detail, user.address.district, user.address.city, user.address.province].filter(Boolean);
    return parts.join(', ');
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, items: cartItems.map(i => ({ product_id: i.product_id, variant_sku: i.variant_sku, quantity: i.quantity, price: i.price })), total_amount: totalPrice, shipping_address: formatAddress(), shipping_cost: 0 })
      });
      const result = await res.json();
      if (result.success) { 
        setIsSuccess(true);
        clearCart(); 
        router.push(result.data.payment_url); 
      }
      else setError(result.message || 'Failed to create order');
    } catch (err: any) { setError(err.message || 'An error occurred'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-lg mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold tracking-tight text-[#111] mb-8">Checkout</h1>
      {error && <div data-testid="checkout-error-message" className="mb-6 p-3 bg-red-50 text-red-600 text-[13px] rounded-xl">{error}</div>}
      <form onSubmit={handleCheckout} className="space-y-6">
        {/* Shipping Address from Profile */}
        <div>
          <label className="text-[13px] font-bold text-gray-500 uppercase tracking-wider block mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Delivery Address
          </label>
          {hasAddress ? (
            <div className="rounded-2xl bg-[#f7f7f7] p-5 border border-gray-100">
              <div className="space-y-1.5">
                <p className="text-[14px] font-semibold text-[#111]">{user.full_name}</p>
                <p className="text-[13px] text-gray-600 leading-relaxed">{user.address!.detail}</p>
                <p className="text-[13px] text-gray-500">
                  {[user.address!.district, user.address!.city, user.address!.province].filter(Boolean).join(', ')}
                </p>
              </div>
              <Link href="/profile" className="text-[12px] font-semibold text-blue-600 hover:text-blue-700 mt-3 inline-block">
                Change Address
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl bg-amber-50 border border-amber-100 p-5 text-center">
              <p className="text-[14px] text-amber-800 font-medium mb-3">You haven&apos;t set a delivery address yet.</p>
              <Link href="/profile" className="text-[13px] font-bold text-amber-700 bg-amber-100 px-5 py-2 rounded-full hover:bg-amber-200 transition-colors inline-block">
                Set Address in Profile
              </Link>
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-[#f7f7f7] p-5">
          <div className="flex justify-between text-[14px]"><span className="text-gray-400">Total</span><span className="font-bold text-[#111]">Rp {totalPrice.toLocaleString('id-ID')}</span></div>
        </div>
        <button type="submit" disabled={loading || !hasAddress} data-testid="checkout-submit-button"
          className="w-full py-3.5 bg-[#111] text-white text-[13px] font-medium rounded-full hover:bg-[#333] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors">
          {loading ? 'Processing...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
}

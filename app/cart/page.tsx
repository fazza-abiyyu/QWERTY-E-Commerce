'use client';
import Link from 'next/link';
import { Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../src/store/cart.store';
import { useEffect, useState } from 'react';

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const cartItems = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const totalPrice = useCartStore((s) => s.getTotalPrice());

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-32 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#f5f5f5] flex items-center justify-center mx-auto mb-5">
          <ShoppingBag className="w-7 h-7 text-gray-300" strokeWidth={1.5} />
        </div>
        <h2 className="text-lg font-bold text-[#111] mb-1">Your bag is empty</h2>
        <p className="text-[14px] text-gray-400 mb-6">Add some products to get started.</p>
        <Link href="/products" data-testid="cart-empty-cta" className="inline-flex px-6 py-2.5 bg-[#111] text-white text-[13px] font-medium rounded-full hover:bg-[#333] transition-colors">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold tracking-tight text-[#111] mb-8">Shopping Bag</h1>
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1 divide-y divide-gray-100">
          {cartItems.map((item) => (
            <div key={`${item.product_id}-${item.variant_sku}`} data-testid={`cart-item-${item.variant_sku}`} className="flex gap-4 py-5 first:pt-0">
              <div className="w-20 h-24 rounded-xl bg-[#f5f5f5] overflow-hidden flex-shrink-0">
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-[14px] font-semibold text-[#111]">{item.name}</h3>
                    <p className="text-[13px] text-gray-400">{item.variant_name}</p>
                  </div>
                  <button data-testid={`cart-remove-item-${item.variant_sku}`} onClick={() => removeItem(item.product_id, item.variant_sku)} className="text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <div className="flex items-center bg-[#f5f5f5] rounded-lg">
                    <button data-testid={`cart-qty-minus-${item.variant_sku}`} onClick={() => updateQuantity(item.product_id, item.variant_sku, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#111] text-sm">−</button>
                    <span className="w-6 text-center text-[12px] font-medium">{item.quantity}</span>
                    <button data-testid={`cart-qty-plus-${item.variant_sku}`} onClick={() => updateQuantity(item.product_id, item.variant_sku, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#111] text-sm">+</button>
                  </div>
                  <span className="text-[14px] font-bold text-[#111]">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="w-full lg:w-72">
          <div className="rounded-2xl bg-[#f7f7f7] p-6">
            <div className="space-y-3 text-[14px] mb-5">
              <div className="flex justify-between text-gray-400"><span>Subtotal</span><span className="text-[#111] font-medium">Rp {totalPrice.toLocaleString('id-ID')}</span></div>
              <div className="flex justify-between text-gray-400"><span>Shipping</span><span className="text-green-600 font-medium">Free</span></div>
            </div>
            <div className="border-t border-gray-200 pt-4 flex justify-between mb-6">
              <span className="font-bold text-[#111]">Total</span>
              <span className="font-bold text-[#111]">Rp {totalPrice.toLocaleString('id-ID')}</span>
            </div>
            <Link href="/checkout" data-testid="cart-checkout-button" className="block text-center py-3.5 bg-[#111] text-white text-[13px] font-medium rounded-full hover:bg-[#333] transition-colors">
              Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

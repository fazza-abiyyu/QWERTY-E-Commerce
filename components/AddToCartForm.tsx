'use client';
import { useState } from 'react';
import { Check } from 'lucide-react';
import { useCartStore } from '../src/store/cart.store';
import { Product } from '../src/modules/products/product.schema';

export default function AddToCartForm({ product }: { product: Product }) {
  const [selectedVariantSku, setSelectedVariantSku] = useState<string>(product.variants[0]?.sku || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const selectedVariant = product.variants.find((v) => v.sku === selectedVariantSku);

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addItem({
      product_id: product.id, variant_sku: selectedVariant.sku, name: product.name,
      variant_name: selectedVariant.name, price: selectedVariant.price, quantity, image_url: product.image_url,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-7">
      <div data-testid="product-price" className="text-xl font-bold text-[#111]">
        Rp {selectedVariant?.price.toLocaleString('id-ID') || 0}
      </div>

      <div>
        <p className="text-[13px] font-medium text-gray-400 mb-3">Size / Variant</p>
        <div className="flex flex-wrap gap-2">
          {product.variants.map((v) => (
            <button key={v.sku} data-testid={`variant-select-${v.sku}`} onClick={() => setSelectedVariantSku(v.sku)}
              className={`px-4 py-2.5 text-[13px] font-medium rounded-xl border transition-all ${
                selectedVariantSku === v.sku ? 'bg-[#111] text-white border-[#111]' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
              }`}
            >
              {v.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[13px] font-medium text-gray-400 mb-3">Quantity</p>
        <div className="flex items-center bg-[#f5f5f5] rounded-xl w-fit">
          <button data-testid="qty-minus" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-[#111] text-lg">−</button>
          <span data-testid="qty-value" className="w-10 h-10 flex items-center justify-center text-[14px] font-medium text-[#111]">{quantity}</span>
          <button data-testid="qty-plus" onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-[#111] text-lg">+</button>
        </div>
        <p className="text-[12px] text-gray-300 mt-2">{selectedVariant?.stock || 0} in stock</p>
      </div>

      <button data-testid="add-to-cart-button" onClick={handleAddToCart} disabled={!selectedVariant || selectedVariant.stock < 1}
        className={`w-full h-13 text-[14px] font-medium rounded-full transition-all ${
          added ? 'bg-green-600 text-white' : 'bg-[#111] text-white hover:bg-[#333] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed'
        }`}
      >
        {added ? <span className="flex items-center justify-center gap-2"><Check className="h-4 w-4" /> Added to Bag</span> : 'Add to Bag'}
      </button>
    </div>
  );
}

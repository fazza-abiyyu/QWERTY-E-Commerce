'use client';
import Link from 'next/link';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

interface Variant { sku: string; name: string; price: number; stock: number; weight: number; }
interface Product { id: string; name: string; category: string; description: string; image_url: string; variants: Variant[]; }

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc'>('name');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [loading, setLoading] = useState(true);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => { if (data.success) setProducts(data.data); setLoading(false); });
  }, []);

  const categories = [...new Set(products.map(p => p.category))].sort();

  const filtered = products
    .filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
      const matchCategory = !selectedCategory || p.category === selectedCategory;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price-asc') return (a.variants[0]?.price || 0) - (b.variants[0]?.price || 0);
      return (b.variants[0]?.price || 0) - (a.variants[0]?.price || 0);
    });

  const Sidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-[12px] font-bold text-gray-900 uppercase tracking-wider mb-3">Categories</h3>
        <div className="space-y-1">
          <button
            onClick={() => setSelectedCategory('')}
            className={`w-full text-left px-3 py-2 rounded-xl text-[13px] font-medium transition-colors ${
              !selectedCategory ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            All Products
          </button>
          {categories.map(cat => {
            const count = products.filter(p => p.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                className={`w-full text-left px-3 py-2 rounded-xl text-[13px] font-medium transition-colors flex justify-between items-center ${
                  selectedCategory === cat ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {cat}
                <span className={`text-[11px] ${selectedCategory === cat ? 'text-white/60' : 'text-gray-300'}`}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-[12px] font-bold text-gray-900 uppercase tracking-wider mb-3">Sort by</h3>
        <div className="space-y-1">
          {[
            { value: 'name', label: 'Name: A-Z' },
            { value: 'price-asc', label: 'Price: Low to High' },
            { value: 'price-desc', label: 'Price: High to Low' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value as any)}
              className={`w-full text-left px-3 py-2 rounded-xl text-[13px] font-medium transition-colors ${
                sortBy === opt.value ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {selectedCategory || 'All Products'}
          </h1>
          <p className="text-[13px] text-gray-400 mt-1">{filtered.length} items</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowMobileFilter(!showMobileFilter)} className="lg:hidden p-2 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" strokeWidth={1.5} />
        <input
          type="text"
          data-testid="products-search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-11 pr-10 py-3 bg-gray-50 rounded-2xl text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-shadow"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-900">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Mobile filter */}
      {showMobileFilter && (
        <div className="lg:hidden mb-8 p-5 bg-gray-50 rounded-2xl">
          <Sidebar />
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Mobile filter toggle (Sticky) */}
        <div className="lg:hidden sticky top-[64px] z-30 bg-white/90 backdrop-blur-sm py-3 flex gap-3 overflow-x-auto no-scrollbar border-b border-gray-50">
          <button 
            onClick={() => setShowMobileFilter(!showMobileFilter)} 
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 text-white text-[13px] font-bold"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
          <div className="flex gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-medium border transition-colors ${
                  selectedCategory === cat ? 'bg-gray-100 border-gray-200 text-gray-900' : 'bg-white border-gray-100 text-gray-500'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <Sidebar />
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="py-24 text-center text-gray-300 text-[14px]">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-gray-400 text-[15px] mb-2">No products found</p>
              <button onClick={() => { setSearch(''); setSelectedCategory(''); }} className="text-[13px] font-medium text-gray-900 underline underline-offset-4">
                Clear filters
              </button>
            </div>
          ) : (
            <div data-testid="product-grid" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-8">
              {filtered.map((product) => (
                <Link key={product.id} href={`/product/${product.id}`} data-testid={`product-card-${product.id}`} className="group block">
                  <div className="aspect-[4/5] overflow-hidden bg-gray-50 rounded-2xl sm:rounded-3xl shadow-sm group-hover:shadow-xl transition-all duration-500">
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <div className="mt-4 px-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{product.category}</p>
                        <h3 className="text-[14px] font-bold text-gray-900 mt-1 line-clamp-1">{product.name}</h3>
                      </div>
                      <p className="text-[14px] font-black text-gray-900">Rp {product.variants[0]?.price.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-6 py-24 text-center text-gray-300">Loading...</div>}>
      <ShopContent />
    </Suspense>
  );
}

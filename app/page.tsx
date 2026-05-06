import Link from 'next/link';
import { ProductService } from '../src/modules/products/product.service';
import { ArrowRight, Truck, ShieldCheck, RefreshCw } from 'lucide-react';

export default async function Home() {
  const products = await ProductService.getAll();
  const featured = products.slice(0, 4);
  const categories = [...new Set(products.map(p => p.category))];

  return (
    <div>
      {/* Hero */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="order-2 lg:order-1 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[12px] font-medium text-gray-500 shadow-sm mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              New arrivals available
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-gray-900 leading-[1.05] mb-5">
              Style Meets<br className="hidden sm:block" />Substance
            </h1>
            <p className="text-[15px] sm:text-[16px] text-gray-500 max-w-sm mx-auto lg:mx-0 leading-relaxed mb-8">
              Premium essentials crafted for the modern lifestyle. Quality you can feel, design you can see.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
              <Link href="/products" className="inline-flex items-center gap-2 px-8 py-3.5 bg-gray-900 text-white text-[14px] font-bold rounded-full hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-gray-200">
                Shop Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="rounded-3xl overflow-hidden aspect-[4/5] sm:aspect-video lg:aspect-[4/5] bg-gray-100 shadow-2xl">
              <img
                src={products[0]?.image_url || ''}
                alt="Hero product"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-b border-gray-100 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between sm:grid sm:grid-cols-3 sm:divide-x divide-gray-100 min-w-max sm:min-w-0 gap-8 sm:gap-0">
          {[
            { icon: Truck, text: 'Free Shipping' },
            { icon: ShieldCheck, text: 'Secure Payment' },
            { icon: RefreshCw, text: 'Easy Returns' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center justify-center gap-3 text-[13px] text-gray-500 font-bold tracking-tight">
              <Icon className="w-4 h-4 text-gray-900" strokeWidth={2} />
              {text}
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Shop by Category</h2>
          <Link href="/products" className="text-[13px] font-medium text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {categories.map((cat) => {
            const catProduct = products.find(p => p.category === cat);
            const count = products.filter(p => p.category === cat).length;
            return (
              <Link key={cat} href={`/products?category=${encodeURIComponent(cat)}`} className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
                <img src={catProduct?.image_url || ''} alt={cat} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="relative z-10 h-full flex flex-col justify-end p-4">
                  <h3 className="text-[14px] font-bold text-white">{cat}</h3>
                  <p className="text-[12px] text-white/70">{count} items</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Featured</h2>
            <Link href="/products" className="text-[13px] font-medium text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {featured.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`} className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-[3/4] overflow-hidden">
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-4">
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{product.category}</p>
                  <h3 className="text-[14px] font-semibold text-gray-900 mt-1">{product.name}</h3>
                  <p className="text-[14px] font-bold text-gray-900 mt-2">Rp {product.variants[0]?.price.toLocaleString('id-ID')}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-3">Ready to upgrade your wardrobe?</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">Explore {products.length} products across {categories.length} categories.</p>
        <Link href="/products" className="inline-flex items-center gap-2 px-8 py-3.5 bg-gray-900 text-white text-[13px] font-semibold rounded-full hover:bg-gray-800 transition-colors">
          Browse Collection <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}

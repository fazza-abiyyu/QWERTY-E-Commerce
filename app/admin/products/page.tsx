import { ProductService } from '../../../src/modules/products/product.service';
import { Package, Plus, AlertCircle, ShoppingCart, Tag, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default async function AdminProductsPage() {
  const products = await ProductService.getAll();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-500 mt-1">Manage products, variants, and stock levels.</p>
        </div>
        <button className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold text-[13px] hover:bg-black transition-all flex items-center gap-2 shadow-sm w-fit active:scale-95">
          <Plus className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Variants & Prices</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Availability</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(product => {
                const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
                const minPrice = Math.min(...product.variants.map(v => v.price));
                const maxPrice = Math.max(...product.variants.map(v => v.price));
                const hasPriceRange = minPrice !== maxPrice;
                
                return (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-50 shadow-sm">
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 text-[14px] truncate">{product.name}</p>
                          <p className="text-[11px] text-gray-400 font-mono mt-0.5 uppercase">{product.category} · {product.id.split('-')[1]}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[14px] font-black text-gray-900">
                          <Tag className="w-3 h-3 text-gray-400" />
                          {hasPriceRange ? (
                            <span>Rp {minPrice.toLocaleString('id-ID')} - {maxPrice.toLocaleString('id-ID')}</span>
                          ) : (
                            <span>Rp {minPrice.toLocaleString('id-ID')}</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {product.variants.map(v => (
                            <span key={v.sku} className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                              {v.name} (x{v.stock})
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold w-fit border ${
                          totalStock > 0 ? 'bg-white text-gray-900 border-gray-200' : 'bg-gray-900 text-white border-gray-900'
                        }`}>
                          {totalStock === 0 ? <AlertCircle className="w-3 h-3" /> : <Package className="w-3 h-3" />}
                          {totalStock === 0 ? 'Out of Stock' : `${totalStock} in stock`}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/products/${product.id}`} target="_blank" className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all" title="View on Shop">
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button className="text-[13px] font-bold text-gray-900 hover:underline px-3 py-1.5 transition-all">
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {products.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <Package className="w-12 h-12 text-gray-100 mx-auto mb-3" />
            <p className="text-[14px]">Your inventory is empty.</p>
          </div>
        )}
      </div>
    </div>
  );
}

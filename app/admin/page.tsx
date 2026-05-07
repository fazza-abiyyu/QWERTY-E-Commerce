import { OrderService } from '../../src/modules/orders/order.service';
import { ProductService } from '../../src/modules/products/product.service';
import { JsonHandler } from '../../src/infrastructure/database/json-handler';
import { User } from '../../src/modules/auth/auth.schema';
import { DollarSign, ShoppingBag, Truck, Users, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const userDb = new JsonHandler<User>('users.json');

export default async function AdminDashboard() {
  const orders = await OrderService.getAllOrders();
  const products = await ProductService.getAll();
  const users = await userDb.readAll();
  const customers = users.filter(u => u.role === 'customer');

  const totalRevenue = orders
    .filter(o => ['paid', 'shipped', 'delivered'].includes(o.status))
    .reduce((sum, order) => sum + order.total_amount, 0);

  const pendingPayments = orders.filter(o => o.status === 'pending').length;
  const toShip = orders.filter(o => o.status === 'paid').length;

  // Recent orders (last 5)
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  // Low stock products
  const lowStockProducts = products.filter(p => 
    p.variants.some(v => v.stock <= 5)
  ).slice(0, 5);

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    paid: 'bg-green-100 text-green-800',
    shipped: 'bg-blue-100 text-blue-800',
    delivered: 'bg-gray-900 text-white',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-[14px] text-gray-400 mt-1">Overview of your store performance.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mb-3">
            <DollarSign className="w-5 h-5 text-gray-900" />
          </div>
          <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Revenue</p>
          <h3 data-testid="admin-stat-revenue" className="text-xl font-black text-gray-900 mt-1">Rp {totalRevenue.toLocaleString('id-ID')}</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mb-3">
            <ShoppingBag className="w-5 h-5 text-gray-900" />
          </div>
          <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Total Orders</p>
          <h3 data-testid="admin-stat-orders" className="text-xl font-black text-gray-900 mt-1">{orders.length}</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mb-3">
            <Clock className="w-5 h-5 text-gray-900" />
          </div>
          <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Pending</p>
          <h3 data-testid="admin-stat-pending" className="text-xl font-black text-gray-900 mt-1">{pendingPayments}</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mb-3">
            <Users className="w-5 h-5 text-gray-900" />
          </div>
          <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Customers</p>
          <h3 className="text-xl font-black text-gray-900 mt-1">{customers.length}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[14px] font-bold text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-[12px] font-semibold text-gray-900 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recentOrders.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {recentOrders.map(order => (
                <div key={order.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-gray-900 truncate">{order.id}</p>
                    <p className="text-[12px] text-gray-400 mt-0.5">
                      {order.items.length} item{order.items.length > 1 ? 's' : ''} · {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span className="text-[13px] font-bold text-gray-900">Rp {order.total_amount.toLocaleString('id-ID')}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${
                      order.status === 'paid' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-900 border-gray-200'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 text-[14px]">No orders yet.</div>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-gray-900" />
            <h2 className="text-[14px] font-bold text-gray-900">Low Stock</h2>
          </div>
          {lowStockProducts.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {lowStockProducts.map(product => {
                const minStock = Math.min(...product.variants.map(v => v.stock));
                return (
                  <div key={product.id} className="px-6 py-3.5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-50 overflow-hidden shrink-0 grayscale">
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-gray-900 truncate">{product.name}</p>
                      <p className={`text-[11px] font-bold ${minStock === 0 ? 'text-gray-900' : 'text-gray-500'}`}>
                        {minStock === 0 ? 'Out of stock' : `${minStock} left`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 text-[14px]">All stocked up! 🎉</div>
          )}
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-[14px] font-bold text-gray-900 mb-4">Order Breakdown</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {['pending', 'paid', 'shipped', 'delivered', 'cancelled'].map(status => {
            const count = orders.filter(o => o.status === status).length;
            return (
              <div key={status} className="text-center p-3 rounded-xl bg-gray-50 border border-transparent hover:border-gray-200 transition-colors">
                <p className="text-xl font-black text-gray-900">{count}</p>
                <p className={`text-[11px] font-bold uppercase tracking-wider mt-1 ${
                  status === 'paid' ? 'text-gray-900' : 'text-gray-400'
                }`}>{status}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

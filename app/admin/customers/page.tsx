import { JsonHandler } from '../../../src/infrastructure/database/json-handler';
import { User } from '../../../src/modules/auth/auth.schema';
import { OrderService } from '../../../src/modules/orders/order.service';
import { Mail, MapPin, Calendar, ShoppingBag, User as UserIcon } from 'lucide-react';

const userDb = new JsonHandler<User>('users.json');

export default async function AdminCustomersPage() {
  const users = await userDb.readAll();
  const allOrders = await OrderService.getAllOrders();
  
  const customers = users.filter(u => u.role === 'customer');

  const getCustomerOrders = (userId: string) => {
    return allOrders.filter(o => o.user_id === userId);
  };

  const formatAddress = (address: any) => {
    if (!address) return 'No address set';
    const parts = [address.detail, address.district, address.city, address.province].filter(Boolean);
    return parts.join(', ');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-500 mt-1">Manage and view your registered customers.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Default Address</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Activity</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Orders</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map(customer => {
                const orders = getCustomerOrders(customer.id);
                return (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white text-[13px] font-bold">
                          {customer.full_name ? customer.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : <UserIcon className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{customer.full_name || 'Anonymous'}</p>
                          <p className="text-[11px] text-gray-400 font-mono">{customer.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-[13px] text-gray-600">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          {customer.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2 max-w-[250px]">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                        <p className="text-[13px] text-gray-600 leading-snug line-clamp-2">
                          {formatAddress(customer.address)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-[13px] text-gray-600">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        Joined {new Date(customer.created_at).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-gray-400" />
                        <span className="font-bold text-gray-900">{orders.length}</span>
                        <span className="text-[12px] text-gray-400">order{orders.length !== 1 ? 's' : ''}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {customers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No customers registered yet.
          </div>
        )}
      </div>
    </div>
  );
}

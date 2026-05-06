'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, Users, ChevronRight, Shield } from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/products', label: 'Inventory', icon: Package },
  { href: '/admin/customers', label: 'Customers', icon: Users },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-24">
          <div className="mb-5 px-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-gray-400" />
            <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Admin Panel</h2>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all text-[14px] font-medium group ${
                    active
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-[18px] h-[18px] ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    {item.label}
                  </div>
                  {active && <ChevronRight className="w-4 h-4 text-white/50" />}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 pt-5 border-t border-gray-100 px-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-white text-[11px] font-bold">
                AV
              </div>
              <div>
                <p className="text-[13px] font-bold text-gray-900">Admin QWERTY</p>
                <p className="text-[11px] text-gray-400">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Admin Content */}
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}

'use client';
import Link from 'next/link';
import { ShoppingBag, User, Menu, X } from 'lucide-react';
import { useCartStore } from '../src/store/cart.store';
import { useAuthStore } from '../src/store/auth.store';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const logout = useAuthStore((s) => s.logout);
  const totalItems = useCartStore((state) => state.getTotalItems());
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, [checkAuth]);

  // Close dropdown/menu when clicking outside or navigating
  useEffect(() => {
    const handleOutsideClick = () => {
      setShowDropdown(false);
    };
    window.addEventListener('click', handleOutsideClick);
    setMobileMenuOpen(false);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Mobile Menu Toggle & Logo */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1 text-gray-500 hover:text-gray-900"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <Link href="/" data-testid="header-home-link" className="text-lg font-black tracking-tighter text-gray-900">
            QWERTY
          </Link>
        </div>

        {/* Center: Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className={`text-sm font-semibold transition-colors ${pathname === '/' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-900'}`}>
            Home
          </Link>
          <Link href="/products" className={`text-sm font-semibold transition-colors ${pathname === '/products' || pathname.startsWith('/product/') ? 'text-gray-900' : 'text-gray-400 hover:text-gray-900'}`}>
            Shop
          </Link>
          {user?.role === 'admin' && (
            <Link href="/admin" className={`text-sm font-semibold transition-colors ${pathname.startsWith('/admin') ? 'text-gray-900' : 'text-gray-400 hover:text-gray-900'}`}>
              Admin Panel
            </Link>
          )}
        </nav>

        {/* Right: Auth & Cart */}
        <div className="flex items-center gap-2 sm:gap-4">
          {mounted && (
            <div className="flex items-center gap-2 sm:gap-4">
              {!user ? (
                <div className="hidden sm:flex items-center gap-4">
                  <Link href="/login" className="text-sm font-semibold text-gray-400 hover:text-gray-900 transition-colors">
                    Sign in
                  </Link>
                  <Link href="/register" className="text-sm font-bold text-white bg-gray-900 px-5 py-2 rounded-full hover:bg-gray-800 transition-all active:scale-95 shadow-sm">
                    Join
                  </Link>
                </div>
              ) : (
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white shadow-sm text-[12px] font-bold">
                      {user.full_name ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : <User className="w-4 h-4" />}
                    </div>
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-gray-50">
                        <div className="flex items-center gap-2">
                          <p className="text-[13px] font-bold text-gray-900 truncate">{user.full_name || 'User'}</p>
                          {user.role === 'admin' && <span className="text-[9px] font-black bg-gray-900 text-white px-1.5 py-0.5 rounded-md uppercase tracking-tighter">Admin</span>}
                        </div>
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">{user.email}</p>
                      </div>
                      
                      <Link href="/profile" className="block px-4 py-2.5 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                        Profile Settings
                      </Link>
                      
                      {user.role === 'admin' ? (
                        <Link href="/admin" className="block px-4 py-2.5 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                          Admin Dashboard
                        </Link>
                      ) : (
                        <Link href="/orders" className="block px-4 py-2.5 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                          My Orders
                        </Link>
                      )}
                      
                      <button onClick={logout} className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-red-500 hover:bg-red-50 transition-colors border-t border-gray-50">
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          <Link href="/cart" data-testid="header-cart-link" className="relative p-2 text-gray-500 hover:text-gray-900 transition-all hover:bg-gray-50 rounded-full group">
            <ShoppingBag className="h-5 w-5 group-hover:scale-110 transition-transform" strokeWidth={2} />
            {user?.role === 'admin' && (
              <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-[8px] font-black px-1 py-0.5 rounded-md uppercase">Preview</span>
            )}
            {mounted && totalItems > 0 && user?.role !== 'admin' && (
              <span data-testid="header-cart-count" className="absolute top-1 right-1 bg-gray-900 text-white text-[9px] font-black rounded-full w-[16px] h-[16px] flex items-center justify-center shadow-sm">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-100 shadow-xl py-6 px-6 flex flex-col gap-6 z-40 animate-in slide-in-from-top duration-300">
          <Link href="/" className="text-xl font-bold text-gray-900">Home</Link>
          <Link href="/products" className="text-xl font-bold text-gray-900">Shop</Link>
          {user?.role === 'admin' && <Link href="/admin" className="text-xl font-bold text-gray-900">Admin Panel</Link>}
          
          <hr className="border-gray-50" />
          {!user ? (
            <div className="flex flex-col gap-4">
              <Link href="/login" className="text-lg font-semibold text-gray-600">Sign in</Link>
              <Link href="/register" className="text-lg font-bold text-center bg-gray-900 text-white py-3 rounded-2xl">Join Now</Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white text-[13px] font-bold">
                  {user.full_name ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : <User className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-bold text-gray-900">{user.full_name || 'User'}</p>
                    {user.role === 'admin' && <span className="text-[9px] font-black bg-gray-900 text-white px-1.5 py-0.5 rounded-md uppercase tracking-tighter">Admin</span>}
                  </div>
                  <p className="text-[12px] text-gray-400">{user.email}</p>
                </div>
              </div>
              <Link href="/profile" className="text-lg font-semibold text-gray-900">Profile Settings</Link>
              {user.role === 'admin' ? (
                <Link href="/admin" className="text-lg font-semibold text-gray-900">Admin Panel</Link>
              ) : (
                <Link href="/orders" className="text-lg font-semibold text-gray-900">My Orders</Link>
              )}
              <button onClick={logout} className="text-lg font-bold text-red-500 text-left">Logout</button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

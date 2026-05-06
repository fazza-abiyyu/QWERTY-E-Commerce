import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row justify-between items-center gap-4">
        <span className="text-[13px] font-bold tracking-tight text-[#111]">QWERTY</span>
        <p className="text-[12px] text-gray-400">
          &copy; {new Date().getFullYear()} All rights reserved. Built with Next.js
        </p>
        <div className="flex gap-6">
          <Link href="/products" className="text-[12px] text-gray-400 hover:text-[#111] transition-colors">Shop</Link>
          <Link href="/orders" className="text-[12px] text-gray-400 hover:text-[#111] transition-colors">Orders</Link>
          <Link href="/admin" className="text-[12px] text-gray-400 hover:text-[#111] transition-colors">Admin</Link>
        </div>
      </div>
    </footer>
  );
}

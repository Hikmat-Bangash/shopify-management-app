'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaBoxOpen, FaCog, FaSignOutAlt, FaTimes } from 'react-icons/fa';
import useAuthStore from '../store/authStore';

export default function Sidebar({ open, setOpen }) {
  const pathname = usePathname();
  const shop = useAuthStore((state) => state.shop);
  const token = useAuthStore((state) => state.token);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const handleLogout = async () => {
    await fetch('/api/logout');
    clearAuth();
    window.location.reload();
  };

  if (!shop || !token) return null;

  
  const navItems = [
    { name: 'Home', href: '/', icon: <FaHome /> },
    { name: 'Products', href: '/products', icon: <FaBoxOpen /> },
    { name: 'Settings', href: '/settings', icon: <FaCog /> },
  ];

  return (
    <aside
      className={`
        fixed top-0 left-0 h-full w-60 bg-blue-100 flex flex-col p-0 z-50
        transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:h-screen
      `}
      style={{ boxShadow: '2px 0 8px rgba(0,0,0,0.04)' }}
    >
      {/* Close button for mobile */}
      <div className="flex md:hidden justify-end p-4">
        <button
          onClick={() => setOpen(false)}
          className="text-blue-700"
          aria-label="Close menu"
        >
          <FaTimes size={22} />
        </button>
      </div>
      <nav className="flex-1 flex flex-col gap-2 mt-6 px-4">
        {navItems.map(item => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center text-lg tracking-[2px] gap-3 px-4 py-2 rounded-lg transition cursor-pointer
              ${pathname === item.href
                ? 'bg-blue-500 text-white'
                : 'bg-blue-100 text-blue-900 hover:bg-blue-500 hover:text-white'}
            `}
            onClick={() => setOpen(false)}
          >
            {item.icon}
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
      <div className="px-4 mb-6 mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center text-lg tracking-[2px] gap-3 w-full px-4 py-2 rounded-lg text-red-600 hover:text-white cursor-pointer bg-red-200 hover:bg-red-500 transition"
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
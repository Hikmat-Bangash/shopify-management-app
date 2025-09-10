'use client';

import { FaBars } from 'react-icons/fa';

export default function MobileNavbar({ onMenuClick }) {
  return (
    <nav className="md:hidden flex items-center justify-between px-4 py-3 bg-white shadow sticky top-0 z-40">
      <button
        onClick={onMenuClick}
        aria-label="Open menu"
        className="text-blue-600 p-2 rounded-full focus:outline-none cursor-pointer"
      >
        <FaBars size={24} />
      </button>
      <span className="text-lg font-bold text-center flex-1 -ml-8">
        Management App
      </span>
      {/* Spacer for symmetry */}
      <span className="w-8" />
    </nav>
  );
}
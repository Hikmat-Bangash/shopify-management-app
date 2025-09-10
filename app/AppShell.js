'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import MobileNavbar from './components/MobileNavbar';

export default function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <MobileNavbar onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex h-screen">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 min-w-0 w-full h-full overflow-auto">
          {children}
        </main>
      </div>
    </>
  );
}
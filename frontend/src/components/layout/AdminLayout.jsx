import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { AdminSidebar } from './AdminSidebar';

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} showAdminMenu />
      <div className="flex flex-1">
        <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <main className="flex-1 p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-900/50 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

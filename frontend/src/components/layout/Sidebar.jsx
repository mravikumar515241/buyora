import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { 
    to: '/dashboard', 
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )
  },
  { 
    to: '/dashboard/products', 
    label: 'My Products',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    )
  },
  { 
    to: '/dashboard/inventory', 
    label: 'Inventory',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    )
  },
  { 
    to: '/orders', 
    label: 'Orders',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    )
  },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button - Fixed position with glass effect */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 w-12 h-12 rounded-xl 
          bg-indigo-600/90 dark:bg-indigo-500/80 
          backdrop-blur-xl 
          text-white shadow-xl shadow-indigo-500/30 dark:shadow-indigo-400/20
          hover:bg-indigo-700/95 dark:hover:bg-indigo-600/90
          hover:scale-110 active:scale-95
          transition-all duration-300 
          flex items-center justify-center
          border border-indigo-400/30 dark:border-indigo-300/20"
        style={{
          backdropFilter: 'blur(16px) saturate(150%)',
          WebkitBackdropFilter: 'blur(16px) saturate(150%)',
        }}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile overlay with blur */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-30 transition-all duration-300 animate-fadeIn"
          onClick={() => setIsOpen(false)}
          style={{
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
          }}
        />
      )}

      {/* Sidebar with glass effect */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-72
        lg:min-h-[calc(100vh-4rem)]
        bg-white/80 dark:bg-slate-800/80
        backdrop-blur-2xl backdrop-saturate-150
        border-r border-slate-200/60 dark:border-slate-700/60
        transition-all duration-500 ease-in-out
        shadow-2xl lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
      style={{
        backdropFilter: 'blur(24px) saturate(150%)',
        WebkitBackdropFilter: 'blur(24px) saturate(150%)',
      }}
      >
        <div className="p-6">
          {/* Header with close button for mobile */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100">Vendor Dashboard</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage your business</p>
            </div>
            
            {/* Close button for mobile */}
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 
                hover:bg-slate-100 dark:hover:bg-slate-700 
                transition-all duration-200 hover:scale-110"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav>
            <ul className="space-y-2">
              {navItems.map(({ to, label, icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === '/dashboard'}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) => {
                      const baseClasses = `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 group`;
                      const activeClasses = `bg-gradient-to-br from-indigo-500/90 via-indigo-600/90 to-indigo-700/90 dark:from-indigo-400/80 dark:via-indigo-500/80 dark:to-indigo-600/80 text-white shadow-lg shadow-indigo-500/30 dark:shadow-indigo-400/20 scale-[1.02]`;
                      const inactiveClasses = `text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-700/70 hover:scale-[1.01] hover:shadow-md backdrop-blur-sm`;
                      
                      return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
                    }}
                  >
                    {({ isActive }) => (
                      <>
                        <span className={`transition-transform duration-300 ${isActive ? '' : 'group-hover:scale-110'}`}>
                          {icon}
                        </span>
                        <span>{label}</span>
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Help Section */}
          <div className="mt-8 p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">Need Help?</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Contact support for any assistance with your vendor account.
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

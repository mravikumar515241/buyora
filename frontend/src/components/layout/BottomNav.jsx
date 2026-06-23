import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Home, LayoutGrid, Bell, ShoppingCart, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { notificationService } from '../../services/notificationService';
import { PRIORITY_BADGE } from '../notifications/notificationUtils';

const items = [
  { to: '/', label: 'Home', icon: Home, match: (p) => p === '/' },
  { to: '/search', label: 'Categories', icon: LayoutGrid, match: (p) => p.startsWith('/search') || p.startsWith('/products') },
  { to: '/notifications', label: 'Notifications', icon: Bell, auth: true, badge: 'notifications', fallback: '/login' },
  { to: '/cart', label: 'Cart', icon: ShoppingCart, auth: true, badge: 'cart', fallback: '/login' },
  { to: '/profile', label: 'Profile', icon: User, auth: true, fallback: '/login' },
];

export function BottomNav() {
  const location = useLocation();
  const { token } = useAuthStore();
  const cartCount = useCartStore((s) => s.itemCount);

  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationService.unreadCount(),
    enabled: !!token,
    refetchInterval: 30000,
  });

  const notificationCount = unreadData?.count ?? 0;
  const notificationBadgeColor = PRIORITY_BADGE[unreadData?.highestPriority] || PRIORITY_BADGE.MEDIUM;

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-slate-200/80 dark:border-slate-700/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]"
      aria-label="Primary mobile navigation"
    >
      <div className="grid grid-cols-5">
        {items.map(({ to, label, icon: Icon, match, auth, badge, fallback }) => {
          const href = auth && !token ? fallback || '/login' : to;
          const active = match ? match(location.pathname) : location.pathname.startsWith(to);
          const count = badge === 'cart' ? cartCount : badge === 'notifications' ? notificationCount : 0;
          const badgeColor = badge === 'notifications' ? notificationBadgeColor : 'bg-indigo-600';

          return (
            <Link
              key={label}
              to={href}
              className={`relative flex flex-col items-center justify-center gap-1 py-3 min-h-[56px] text-xs font-medium transition-colors ${
                active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
              <span>{label}</span>
              {count > 0 && (
                <span
                  className={`absolute top-1.5 right-[calc(50%-22px)] min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-bold flex items-center justify-center ${badgeColor}`}
                >
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

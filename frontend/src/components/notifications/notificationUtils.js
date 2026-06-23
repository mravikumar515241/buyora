import {
  Bell,
  Package,
  CreditCard,
  User,
  Gift,
  Shield,
  Megaphone,
  Settings,
  Store,
  AlertTriangle,
} from 'lucide-react';

export const PRIORITY_BADGE = {
  LOW: 'bg-emerald-500',
  MEDIUM: 'bg-blue-500',
  HIGH: 'bg-orange-500',
  CRITICAL: 'bg-red-500',
};

export const PRIORITY_BORDER = {
  LOW: 'border-emerald-400/60 dark:border-emerald-500/40',
  MEDIUM: 'border-blue-400/60 dark:border-blue-500/40',
  HIGH: 'border-orange-400/60 dark:border-orange-500/40',
  CRITICAL: 'border-red-400/60 dark:border-red-500/40',
};

export const PRIORITY_BG = {
  LOW: 'bg-emerald-50/80 dark:bg-emerald-950/30',
  MEDIUM: 'bg-blue-50/80 dark:bg-blue-950/30',
  HIGH: 'bg-orange-50/80 dark:bg-orange-950/30',
  CRITICAL: 'bg-red-50/80 dark:bg-red-950/30',
};

const CATEGORY_ICONS = {
  ORDER: Package,
  PAYMENT: CreditCard,
  ACCOUNT: User,
  PROMOTION: Gift,
  SECURITY: Shield,
  SYSTEM: Settings,
  VENDOR: Store,
  ANNOUNCEMENT: Megaphone,
};

const EVENT_EMOJI = {
  ORDER_CREATED: '📦',
  ORDER_CONFIRMED: '✅',
  ORDER_PACKED: '📦',
  ORDER_SHIPPED: '🚚',
  ORDER_OUT_FOR_DELIVERY: '🛵',
  ORDER_DELIVERED: '📦',
  ORDER_CANCELLED: '❌',
  PAYMENT_SUCCESSFUL: '💳',
  PAYMENT_FAILED: '⚠️',
  REFUND_INITIATED: '↩️',
  REFUND_COMPLETED: '✅',
  COUPON_RECEIVED: '🎁',
  COUPON_EXPIRED: '⏰',
  FLASH_SALE: '⚡',
  NEW_LOGIN: '🔐',
  PLATFORM_ANNOUNCEMENT: '📢',
};

export function getNotificationIcon(notification) {
  const Icon = CATEGORY_ICONS[notification?.category] || Bell;
  return Icon;
}

export function getNotificationEmoji(notification) {
  return EVENT_EMOJI[notification?.eventType] || null;
}

export function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export const FILTER_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread', read: false },
  { id: 'read', label: 'Read', read: true },
  { id: 'orders', label: 'Orders', category: 'ORDER' },
  { id: 'payments', label: 'Payments', category: 'PAYMENT' },
  { id: 'promotions', label: 'Promotions', category: 'PROMOTION' },
  { id: 'security', label: 'Security', category: 'SECURITY' },
  { id: 'announcements', label: 'Announcements', category: 'ANNOUNCEMENT' },
  { id: 'system', label: 'System', category: 'SYSTEM' },
];

export function filterToParams(filterId, search) {
  const filter = FILTER_OPTIONS.find((f) => f.id === filterId) || FILTER_OPTIONS[0];
  const params = { search: search || undefined };
  if (filter.read !== undefined) params.read = filter.read;
  if (filter.category) params.category = filter.category;
  return params;
}

export function requestBrowserPermission() {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    return Notification.requestPermission();
  }
  return Promise.resolve('denied');
}

export { AlertTriangle };

import { Link } from 'react-router-dom';
import { Trash2, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';
import {
  getNotificationIcon,
  getNotificationEmoji,
  formatTimeAgo,
  PRIORITY_BORDER,
  PRIORITY_BG,
} from './notificationUtils';

export function NotificationCard({ notification, onMarkRead, onDelete, compact = false }) {
  const Icon = getNotificationIcon(notification);
  const emoji = getNotificationEmoji(notification);
  const priority = notification.priority || 'MEDIUM';
  const unread = !notification.read;

  const handleOpen = () => {
    if (unread && onMarkRead) onMarkRead(notification.id);
  };

  const content = (
    <div
      className={`relative rounded-2xl border p-4 transition-all duration-300 ${
        unread
          ? `${PRIORITY_BG[priority]} ${PRIORITY_BORDER[priority]} shadow-md`
          : 'bg-white/70 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/80'
      } ${compact ? 'p-3' : 'p-5'}`}
    >
      {unread && (
        <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" aria-hidden />
      )}
      <div className="flex gap-3">
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
            unread
              ? 'bg-white/80 dark:bg-slate-900/60 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-700/60'
          }`}
        >
          {emoji || <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
        </div>
        <div className="flex-1 min-w-0 pr-4">
          <h3 className={`text-sm ${unread ? 'font-bold text-slate-900 dark:text-white' : 'font-semibold text-slate-800 dark:text-slate-200'}`}>
            {notification.title}
          </h3>
          <p className={`mt-1 text-slate-600 dark:text-slate-400 ${compact ? 'text-xs line-clamp-2' : 'text-sm'}`}>
            {notification.message}
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">{formatTimeAgo(notification.createdAt)}</p>
          {!compact && notification.actionUrl && (
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                to={notification.actionUrl}
                onClick={handleOpen}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View details
              </Link>
            </div>
          )}
        </div>
        {onDelete && !compact && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(notification.id);
            }}
            className="flex-shrink-0 p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            aria-label="Delete notification"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  if (compact && notification.actionUrl) {
    return (
      <Link to={notification.actionUrl} onClick={handleOpen} className="block hover:scale-[1.01] transition-transform">
        {content}
      </Link>
    );
  }

  return content;
}

export function NotificationSkeleton({ count = 3 }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-24 rounded-2xl bg-slate-200/80 dark:bg-slate-700/60" />
      ))}
    </div>
  );
}

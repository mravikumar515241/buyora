import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { NotificationCard, NotificationSkeleton } from './NotificationCard';
import { PRIORITY_BADGE } from './notificationUtils';
import { Button } from '../ui/Button';
import { showToast } from '../ui/Toast';

export function NotificationDropdown({ open, onClose, anchorRef }) {
  const panelRef = useRef(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationService.unreadCount(),
    refetchInterval: 30000,
  });

  const { data: recent = [], isLoading } = useQuery({
    queryKey: ['notifications', 'recent'],
    queryFn: () => notificationService.recent(8),
    enabled: open,
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => notificationService.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      showToast.success('All notifications marked as read');
    },
  });

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        anchorRef?.current &&
        !anchorRef.current.contains(e.target)
      ) {
        onClose();
      }
    }
    function handleEscape(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  const unreadCount = unreadData?.count ?? 0;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 mt-2 w-[min(100vw-2rem,24rem)] sm:w-96
        bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl
        rounded-2xl shadow-2xl border border-slate-200/70 dark:border-slate-700/70
        z-50 overflow-hidden animate-fadeIn origin-top-right"
      role="dialog"
      aria-label="Notifications"
    >
      <div className="px-4 py-3 border-b border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {unreadCount > 0 ? `${unreadCount > 99 ? '99+' : unreadCount} unread` : 'All caught up'}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-[min(70vh,28rem)] overflow-y-auto p-3 space-y-2">
        {isLoading ? (
          <NotificationSkeleton count={4} />
        ) : recent.length === 0 ? (
          <div className="py-10 text-center px-4">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Bell className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No notifications yet</p>
            <p className="text-xs text-slate-500 mt-1">We will notify you when something important happens.</p>
          </div>
        ) : (
          recent.map((n) => (
            <NotificationCard
              key={n.id}
              notification={n}
              compact
              onMarkRead={(id) => markReadMutation.mutate(id)}
            />
          ))
        )}
      </div>

      <div className="p-3 border-t border-slate-200/80 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/30">
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => {
            onClose();
            navigate('/notifications');
          }}
        >
          View all notifications
        </Button>
      </div>
    </div>
  );
}

export function NotificationBellButton({ onClick, unreadCount = 0, highestPriority = 'MEDIUM', className = '' }) {
  const badgeColor = PRIORITY_BADGE[highestPriority] || PRIORITY_BADGE.MEDIUM;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl
        hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all duration-300 ${className}`}
      aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
    >
      <Bell className="w-5 h-5 text-slate-700 dark:text-slate-300" />
      {unreadCount > 0 && (
        <span
          className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-lg ${badgeColor}`}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}

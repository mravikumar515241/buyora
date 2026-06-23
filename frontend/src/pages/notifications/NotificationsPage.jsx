import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Search, Trash2, CheckCheck } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { NotificationCard, NotificationSkeleton } from '../../components/notifications/NotificationCard';
import { FILTER_OPTIONS, filterToParams } from '../../components/notifications/notificationUtils';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { showToast } from '../../components/ui/Toast';

export function NotificationsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const size = 10;

  const params = { ...filterToParams(filter, search), page, size, sort: 'createdAt,desc' };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['notifications', 'list', params],
    queryFn: () => notificationService.list(params),
    placeholderData: (prev) => prev,
  });

  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationService.unreadCount(),
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => notificationService.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      showToast.success('All notifications marked as read');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => notificationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      showToast.success('Notification deleted');
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: () => notificationService.clearAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      showToast.success('All notifications cleared');
    },
  });

  const notifications = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const unreadCount = unreadData?.count ?? 0;

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(0);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:py-10 pb-24 md:pb-10">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              Notifications
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              {unreadCount > 0
                ? `${unreadCount > 99 ? '99+' : unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
                : 'Your communication hub for orders, offers, and alerts'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {unreadCount > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => markAllMutation.mutate()}
                disabled={markAllMutation.isPending}
              >
                <CheckCheck className="w-4 h-4 mr-1.5" />
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 dark:text-red-400"
                onClick={() => {
                  if (window.confirm('Clear all notifications? This cannot be undone.')) {
                    clearAllMutation.mutate();
                  }
                }}
                disabled={clearAllMutation.isPending}
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                Clear all
              </Button>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by title, message, or keyword..."
            className="pl-10"
          />
        </div>
      </form>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {FILTER_OPTIONS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => {
              setFilter(f.id);
              setPage(0);
            }}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
              filter === f.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <NotificationSkeleton count={5} />
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 flex items-center justify-center">
            <svg viewBox="0 0 120 120" className="w-20 h-20" aria-hidden>
              <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-300 dark:text-indigo-600" />
              <path d="M60 30v8M60 82v8M30 60h8M82 60h8" stroke="currentColor" strokeWidth="2" className="text-indigo-400" />
              <path d="M45 45l6 6M69 69l6 6M69 45l-6 6M45 69l-6 6" stroke="currentColor" strokeWidth="2" className="text-purple-400" />
              <circle cx="60" cy="60" r="12" fill="currentColor" className="text-indigo-500 dark:text-indigo-400" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">No Notifications Yet</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
            We will notify you whenever something important happens — orders, payments, offers, and security alerts.
          </p>
        </div>
      ) : (
        <div className={`space-y-3 ${isFetching ? 'opacity-70' : ''}`}>
          {notifications.map((n) => (
            <NotificationCard
              key={n.id}
              notification={n}
              onMarkRead={(id) => markReadMutation.mutate(id)}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <Button variant="secondary" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

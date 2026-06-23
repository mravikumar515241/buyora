import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Bell, Mail, Shield, Package, Gift, Megaphone } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { requestBrowserPermission } from '../../components/notifications/notificationUtils';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { showToast } from '../../components/ui/Toast';

const PREFERENCE_ITEMS = [
  { key: 'orderNotifications', label: 'Order Notifications', description: 'Order status, shipping, and delivery updates', icon: Package },
  { key: 'paymentNotifications', label: 'Payment Notifications', description: 'Payment success, failures, and refunds', icon: Bell },
  { key: 'promotionalNotifications', label: 'Promotional Notifications', description: 'Coupons, flash sales, and special offers', icon: Gift },
  { key: 'securityNotifications', label: 'Security Notifications', description: 'Login alerts and account security', icon: Shield },
  { key: 'announcementNotifications', label: 'Announcement Notifications', description: 'Platform announcements and policy updates', icon: Megaphone },
  { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive important updates via email', icon: Mail },
  { key: 'browserNotifications', label: 'Browser Notifications', description: 'Desktop push alerts in your browser', icon: Bell },
  { key: 'pushNotifications', label: 'Mobile Push Notifications', description: 'Coming soon — mobile app push alerts', icon: Bell, disabled: true },
];

export function NotificationSettingsPage() {
  const queryClient = useQueryClient();

  const { data: prefs, isLoading } = useQuery({
    queryKey: ['notifications', 'preferences'],
    queryFn: () => notificationService.getPreferences(),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => notificationService.updatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'preferences'] });
      showToast.success('Notification preferences saved');
    },
    onError: () => showToast.error('Failed to save preferences'),
  });

  const handleToggle = async (key, value) => {
    if (key === 'browserNotifications' && value) {
      const permission = await requestBrowserPermission();
      if (permission !== 'granted') {
        showToast.error('Browser notifications were not allowed');
        return;
      }
    }
    updateMutation.mutate({ ...prefs, [key]: value });
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 animate-pulse space-y-4">
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-64" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-10 pb-24 md:pb-10">
      <Link
        to="/profile"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to profile
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">Notification Settings</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8">
        Choose how and when you want to be notified about orders, offers, and account activity.
      </p>

      <div className="space-y-3">
        {PREFERENCE_ITEMS.map(({ key, label, description, icon: Icon, disabled }) => {
          const enabled = prefs?.[key] ?? true;
          return (
            <Card key={key} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{label}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
                  {disabled && (
                    <span className="inline-block mt-1 text-xs font-medium text-amber-600 dark:text-amber-400">Coming soon</span>
                  )}
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                disabled={disabled || updateMutation.isPending}
                onClick={() => !disabled && handleToggle(key, !enabled)}
                className={`relative w-12 h-7 rounded-full transition-colors duration-200 flex-shrink-0 ${
                  disabled ? 'opacity-40 cursor-not-allowed bg-slate-300 dark:bg-slate-600' : enabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                    enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </Card>
          );
        })}
      </div>

      <div className="mt-8">
        <Link to="/notifications">
          <Button variant="secondary">View notifications</Button>
        </Link>
      </div>
    </div>
  );
}

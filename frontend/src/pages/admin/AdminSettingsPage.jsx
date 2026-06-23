import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminSettingsService } from '../../services/adminSettingsService';
import { showToast } from '../../components/ui/Toast';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, setting: null });

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const response = await adminSettingsService.getAllSettings();
      return response.data || [];
    }
  });

  const updateSettingMutation = useMutation({
    mutationFn: ({ key, value }) => adminSettingsService.updateSetting(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-settings']);
      showToast('Setting updated successfully', 'success');
      setConfirmDialog({ isOpen: false, setting: null });
    },
    onError: (error) => {
      showToast(error.response?.data?.message || 'Failed to update setting', 'error');
    }
  });

  const handleToggleSetting = (setting) => {
    const currentValue = setting.value === 'true';
    const newValue = !currentValue;

    if (setting.key === 'ALLOW_USER_DELETION_WITH_DATA_LOSS' && newValue) {
      setConfirmDialog({
        isOpen: true,
        setting: { ...setting, newValue: String(newValue) }
      });
    } else {
      updateSettingMutation.mutate({
        key: setting.key,
        value: String(newValue)
      });
    }
  };

  const handleConfirmDangerousSetting = () => {
    if (confirmDialog.setting) {
      updateSettingMutation.mutate({
        key: confirmDialog.setting.key,
        value: confirmDialog.setting.newValue
      });
    }
  };

  const getSettingDisplayInfo = (key) => {
    const infoMap = {
      'ALLOW_USER_DELETION_WITH_DATA_LOSS': {
        title: 'Allow User Deletion with Data Loss',
        description: 'Enable permanent deletion of users including all their data (orders, reviews, cart items)',
        dangerLevel: 'critical'
      }
    };
    return infoMap[key] || { title: key, description: 'No description available', dangerLevel: 'normal' };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Settings</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Configure system-wide administrative settings
          </p>
        </div>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Dangerous Operations
        </h2>
        <p className="text-sm text-amber-600 dark:text-amber-400 mb-6">
          ⚠️ These settings control destructive operations. Enable with caution.
        </p>

        <div className="space-y-4">
          {settings && settings.length > 0 ? (
            settings.map((setting) => {
              const info = getSettingDisplayInfo(setting.key);
              const isEnabled = setting.value === 'true';

              return (
                <div
                  key={setting.key}
                  className="flex items-start justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {info.title}
                      </h3>
                      {info.dangerLevel === 'critical' && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded">
                          CRITICAL
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {info.description || setting.description}
                    </p>
                    {setting.updatedAt && (
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                        Last updated: {new Date(setting.updatedAt).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleToggleSetting(setting)}
                    disabled={updateSettingMutation.isPending}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ml-4 ${
                      isEnabled
                        ? 'bg-red-600 focus:ring-red-500'
                        : 'bg-gray-200 dark:bg-gray-700 focus:ring-gray-500'
                    } ${updateSettingMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">No settings configured</p>
              <Button
                onClick={() =>
                  updateSettingMutation.mutate({
                    key: 'ALLOW_USER_DELETION_WITH_DATA_LOSS',
                    value: 'false'
                  })
                }
                className="mt-4"
              >
                Initialize Default Settings
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Dangerous Setting Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, setting: null })}
        onConfirm={handleConfirmDangerousSetting}
        title="⚠️ Enable Dangerous Operation"
        confirmVariant="danger"
        confirmText="Yes, Enable"
        cancelText="Cancel"
      >
        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-200 font-semibold mb-2">
              🚨 CRITICAL WARNING
            </p>
            <p className="text-sm text-red-700 dark:text-red-300">
              You are about to enable <strong>PERMANENT USER DELETION</strong> with data loss.
            </p>
          </div>

          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <p className="font-semibold">This will allow you to:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Permanently delete user accounts</li>
              <li>Remove all associated data (orders, reviews, cart items)</li>
              <li>This action is <strong className="text-red-600 dark:text-red-400">IRREVERSIBLE</strong></li>
            </ul>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <p className="text-xs text-amber-800 dark:text-amber-200">
              💡 <strong>Recommendation:</strong> Only enable this when absolutely necessary for compliance (GDPR, etc.). 
              Consider using the "Deactivate" feature instead for safer account management.
            </p>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 pt-2">
            Are you sure you want to enable this dangerous operation?
          </p>
        </div>
      </ConfirmDialog>
    </div>
  );
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { adminUserService } from '../../services/adminUserService';
import { adminSettingsService } from '../../services/adminSettingsService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { showToast } from '../../components/ui/Toast';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Link } from 'react-router-dom';

export function AdminUsersPage() {
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });
  const [deletionEnabled, setDeletionEnabled] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-users', page, size],
    queryFn: () => adminUserService.getAllUsers(page, size)
  });

  // Check if deletion is enabled
  useEffect(() => {
    const checkDeletionSetting = async () => {
      try {
        const response = await adminSettingsService.getSetting('ALLOW_USER_DELETION_WITH_DATA_LOSS');
        setDeletionEnabled(response.data?.value === 'true');
      } catch (error) {
        setDeletionEnabled(false);
      }
    };
    checkDeletionSetting();
  }, []);

  const toggleActiveStatusMutation = useMutation({
    mutationFn: adminUserService.toggleUserActiveStatus,
    onSuccess: (response) => {
      const status = response.data?.active ? 'activated' : 'deactivated';
      showToast(`User ${status} successfully`, 'success');
      queryClient.invalidateQueries(['admin-users']);
    },
    onError: (error) => {
      showToast(error.response?.data?.message || 'Failed to toggle user status', 'error');
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: adminUserService.deleteUser,
    onSuccess: () => {
      showToast('User deleted successfully', 'success');
      queryClient.invalidateQueries(['admin-users']);
      setDeleteDialog({ open: false, id: null, name: '' });
    },
    onError: (error) => {
      showToast(error.response?.data?.message || 'Failed to delete user', 'error');
    }
  });

  const handleDeleteUser = (userId, userName) => {
    if (!deletionEnabled) {
      showToast('User deletion is disabled. Enable it in Admin Settings first.', 'error');
      return;
    }
    setDeleteDialog({ open: true, id: userId, name: userName });
  };

  const handleToggleActive = (userId) => {
    toggleActiveStatusMutation.mutate(userId);
  };

  const users = data?.data?.content || [];
  const totalPages = data?.data?.totalPages || 0;
  const totalElements = data?.data?.totalElements || 0;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">Error loading users: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Users Management</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Total Users: {totalElements}
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">ID</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Name</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Email</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Roles</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Joined Date</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isAdmin = user.roles?.includes('ADMIN');
                  const canDelete = !isAdmin && deletionEnabled;
                  
                  return (
                  <tr 
                    key={user.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="p-4 text-sm text-gray-900 dark:text-gray-100">
                      #{user.id}
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                      {user.fullName}
                    </td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                      {user.email}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.map((role) => (
                          <span
                            key={role}
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              role === 'ADMIN'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                : role === 'VENDOR'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                            }`}
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {user.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(user.id)}
                          disabled={toggleActiveStatusMutation.isPending}
                          className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                            user.active
                              ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                              : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                          }`}
                          title={user.active ? 'Deactivate User' : 'Activate User'}
                        >
                          {user.active ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.fullName)}
                          disabled={deleteUserMutation.isPending || !canDelete}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={
                            isAdmin 
                              ? 'Cannot delete admin users' 
                              : !deletionEnabled 
                              ? 'Deletion disabled in settings' 
                              : 'Delete User'
                          }
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Page {page + 1} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              <Button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages - 1}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null, name: '' })}
        onConfirm={() => deleteDialog.id && deleteUserMutation.mutate(deleteDialog.id)}
        title="⚠️ Permanent User Deletion"
        confirmText="Yes, Delete Permanently"
        confirmVariant="danger"
      >
        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-200 font-semibold mb-2">
              🚨 CRITICAL WARNING - DATA LOSS
            </p>
            <p className="text-sm text-red-700 dark:text-red-300">
              You are about to permanently delete <strong>{deleteDialog.name}</strong> and ALL associated data.
            </p>
          </div>

          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <p className="font-semibold">This will permanently delete:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>User account and profile</li>
              <li>All cart items</li>
              <li>All reviews and ratings</li>
              <li className="text-red-600 dark:text-red-400 font-semibold">
                <strong>If user is a vendor:</strong> All products and vendor data
              </li>
              <li>Other associated data</li>
            </ul>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <p className="text-xs text-amber-800 dark:text-amber-200">
              💡 <strong>Note:</strong> Orders are preserved for business records but will be anonymized.
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              ℹ️ <strong>Safer Alternative:</strong> Consider using the "Deactivate" button instead to preserve data while preventing user access.
            </p>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
            <p className="text-xs text-purple-800 dark:text-purple-200">
              🛡️ <strong>Protected:</strong> Admin users cannot be deleted for system security.
            </p>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold pt-2">
            This action is IRREVERSIBLE. Are you absolutely sure?
          </p>
        </div>
      </ConfirmDialog>

      {/* Settings Alert */}
      {!deletionEnabled && (
        <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-amber-800 dark:text-amber-200 font-semibold">
                User Deletion is Currently Disabled
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                Permanent user deletion with data loss is disabled. Enable it in{' '}
                <Link to="/admin/settings" className="font-semibold underline hover:text-amber-900 dark:hover:text-amber-100">
                  Admin Settings
                </Link>
                {' '}to use this feature.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

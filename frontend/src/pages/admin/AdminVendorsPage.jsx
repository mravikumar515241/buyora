import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { adminUserService } from '../../services/adminUserService';
import { adminSettingsService } from '../../services/adminSettingsService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { showToast } from '../../components/ui/Toast';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Link } from 'react-router-dom';

export function AdminVendorsPage() {
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [approveDialog, setApproveDialog] = useState({ open: false, id: null, name: '' });
  const [rejectDialog, setRejectDialog] = useState({ open: false, id: null, name: '' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });
  const [deletionEnabled, setDeletionEnabled] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-vendors', page, size],
    queryFn: () => adminUserService.getAllVendors(page, size)
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

  const approveVendorMutation = useMutation({
    mutationFn: adminUserService.approveVendor,
    onSuccess: () => {
      showToast('Vendor approved successfully', 'success');
      queryClient.invalidateQueries(['admin-vendors']);
      setApproveDialog({ open: false, id: null, name: '' });
    },
    onError: (error) => {
      showToast(error.response?.data?.message || 'Failed to approve vendor', 'error');
    }
  });

  const rejectVendorMutation = useMutation({
    mutationFn: adminUserService.rejectVendor,
    onSuccess: () => {
      showToast('Vendor rejected successfully', 'success');
      queryClient.invalidateQueries(['admin-vendors']);
      setRejectDialog({ open: false, id: null, name: '' });
    },
    onError: (error) => {
      showToast(error.response?.data?.message || 'Failed to reject vendor', 'error');
    }
  });

  const deleteVendorMutation = useMutation({
    mutationFn: adminUserService.deleteVendor,
    onSuccess: () => {
      showToast('Vendor deleted successfully', 'success');
      queryClient.invalidateQueries(['admin-vendors']);
      setDeleteDialog({ open: false, id: null, name: '' });
    },
    onError: (error) => {
      showToast(error.response?.data?.message || 'Failed to delete vendor', 'error');
    }
  });

  const handleApproveVendor = (vendorId, businessName) => {
    setApproveDialog({ open: true, id: vendorId, name: businessName });
  };

  const handleRejectVendor = (vendorId, businessName) => {
    setRejectDialog({ open: true, id: vendorId, name: businessName });
  };

  const handleDeleteVendor = (vendorId, businessName) => {
    if (!deletionEnabled) {
      showToast('Vendor deletion is disabled. Enable it in Admin Settings first.', 'error');
      return;
    }
    setDeleteDialog({ open: true, id: vendorId, name: businessName });
  };

  const vendors = data?.data?.content || [];
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
          <p className="text-red-800 dark:text-red-200">Error loading vendors: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Vendors Management</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Total Vendors: {totalElements}
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">ID</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">User Name</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Email</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Business Name</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Products</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Orders</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Revenue</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Joined</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {vendors.length === 0 ? (
                <tr>
                  <td colSpan="10" className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No vendors found
                  </td>
                </tr>
              ) : (
                vendors.map((vendor) => (
                  <tr 
                    key={vendor.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="p-4 text-sm text-gray-900 dark:text-gray-100">
                      #{vendor.id}
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                      {vendor.userName}
                    </td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                      {vendor.userEmail}
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                      {vendor.businessName}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          vendor.status === 'APPROVED'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : vendor.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}
                      >
                        {vendor.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-900 dark:text-gray-100">
                      {vendor.totalProducts}
                    </td>
                    <td className="p-4 text-sm text-gray-900 dark:text-gray-100">
                      {vendor.totalOrders}
                    </td>
                    <td className="p-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      ₹{vendor.totalRevenue?.toLocaleString() || '0'}
                    </td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(vendor.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {vendor.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApproveVendor(vendor.id, vendor.businessName)}
                              disabled={approveVendorMutation.isPending}
                              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
                              title="Approve Vendor"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleRejectVendor(vendor.id, vendor.businessName)}
                              disabled={rejectVendorMutation.isPending}
                              className="p-2 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors disabled:opacity-50"
                              title="Reject Vendor"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          </>
                        )}
                        {vendor.status === 'APPROVED' && (
                          <button
                            onClick={() => handleRejectVendor(vendor.id, vendor.businessName)}
                            disabled={rejectVendorMutation.isPending}
                            className="p-2 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors disabled:opacity-50"
                            title="Suspend Vendor"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteVendor(vendor.id, vendor.businessName)}
                          disabled={deleteVendorMutation.isPending || !deletionEnabled}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={deletionEnabled ? 'Delete Vendor' : 'Deletion disabled in settings'}
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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

      {/* Approve Vendor Dialog */}
      <ConfirmDialog
        isOpen={approveDialog.open}
        onClose={() => setApproveDialog({ open: false, id: null, name: '' })}
        onConfirm={() => approveDialog.id && approveVendorMutation.mutate(approveDialog.id)}
        title="Approve Vendor"
        message={`Are you sure you want to approve vendor "${approveDialog.name}"? They will be able to list and sell products on the platform.`}
        confirmText="Approve"
        confirmVariant="success"
      />

      {/* Reject Vendor Dialog */}
      <ConfirmDialog
        isOpen={rejectDialog.open}
        onClose={() => setRejectDialog({ open: false, id: null, name: '' })}
        onConfirm={() => rejectDialog.id && rejectVendorMutation.mutate(rejectDialog.id)}
        title="Reject Vendor"
        message={`Are you sure you want to reject vendor "${rejectDialog.name}"? They will not be able to sell products.`}
        confirmText="Reject"
        confirmVariant="warning"
      />

      {/* Delete Vendor Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null, name: '' })}
        onConfirm={() => deleteDialog.id && deleteVendorMutation.mutate(deleteDialog.id)}
        title="⚠️ Permanent Vendor Deletion"
        confirmText="Yes, Delete Permanently"
        confirmVariant="danger"
      >
        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-200 font-semibold mb-2">
              🚨 CRITICAL WARNING - DATA LOSS
            </p>
            <p className="text-sm text-red-700 dark:text-red-300">
              You are about to permanently delete vendor <strong>{deleteDialog.name}</strong> and ALL associated data.
            </p>
          </div>

          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <p className="font-semibold">This will permanently delete:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li className="text-red-600 dark:text-red-400 font-semibold">All vendor products</li>
              <li>Product reviews and ratings</li>
              <li>Vendor profile and business information</li>
              <li>Other associated product data</li>
            </ul>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <p className="text-xs text-amber-800 dark:text-amber-200">
              💡 <strong>Note:</strong> Orders are preserved for business records but product references will be affected.
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
                Vendor Deletion is Currently Disabled
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                Permanent vendor deletion with data loss is disabled. Enable it in{' '}
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

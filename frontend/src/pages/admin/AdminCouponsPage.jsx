import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { couponService } from '../../services/couponService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { showToast } from '../../components/ui/Toast';

export function AdminCouponsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const size = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-coupons', page],
    queryFn: () => couponService.getAllCoupons({ page, size }),
  });

  const coupons = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    maxUses: '',
    validFrom: '',
    validTo: '',
    active: true,
  });

  const createMutation = useMutation({
    mutationFn: (data) => couponService.createCoupon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      showToast('Coupon created successfully!', 'success');
      resetForm();
    },
    onError: (error) => {
      showToast(error.response?.data?.message || 'Failed to create coupon', 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => couponService.updateCoupon(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      showToast('Coupon updated successfully!', 'success');
      resetForm();
    },
    onError: (error) => {
      showToast(error.response?.data?.message || 'Failed to update coupon', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => couponService.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      showToast('Coupon deleted successfully!', 'success');
    },
    onError: (error) => {
      showToast(error.response?.data?.message || 'Failed to delete coupon', 'error');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      code: formData.code.toUpperCase(),
      discountValue: parseFloat(formData.discountValue),
      minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : null,
      maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
      maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
    };

    if (editingCoupon) {
      updateMutation.mutate({ id: editingCoupon.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minOrderAmount: coupon.minOrderAmount?.toString() || '',
      maxDiscountAmount: coupon.maxDiscountAmount?.toString() || '',
      maxUses: coupon.maxUses?.toString() || '',
      validFrom: coupon.validFrom?.split('.')[0] || '',
      validTo: coupon.validTo?.split('.')[0] || '',
      active: coupon.active,
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      minOrderAmount: '',
      maxDiscountAmount: '',
      maxUses: '',
      validFrom: '',
      validTo: '',
      active: true,
    });
    setEditingCoupon(null);
    setShowForm(false);
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Coupon Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Create and manage discount coupons</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Coupon'}
        </Button>
      </div>

      {/* Coupon Form */}
      {showForm && (
        <Card className="p-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
            {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Coupon Code *"
                placeholder="SAVE10"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
              />

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Discount Type *
                </label>
                <div className="relative">
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="appearance-none w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    required
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label={`Discount Value * ${formData.discountType === 'PERCENTAGE' ? '(%)' : '(₹)'}`}
                type="number"
                step="0.01"
                placeholder={formData.discountType === 'PERCENTAGE' ? '10' : '200'}
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                required
              />

              <Input
                label="Min Order Amount (₹)"
                type="number"
                step="0.01"
                placeholder="500"
                value={formData.minOrderAmount}
                onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Max Discount (₹) - For Percentage"
                type="number"
                step="0.01"
                placeholder="1000"
                value={formData.maxDiscountAmount}
                onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
              />

              <Input
                label="Max Uses"
                type="number"
                placeholder="100"
                value={formData.maxUses}
                onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Valid From *"
                type="datetime-local"
                value={formData.validFrom}
                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                required
              />

              <Input
                label="Valid To *"
                type="datetime-local"
                value={formData.validTo}
                onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
              />
              <label htmlFor="active" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Active
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
              </Button>
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Coupons List */}
      {isLoading ? (
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="h-32 animate-pulse bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      ) : coupons.length === 0 ? (
        <Card className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">No coupons yet</h3>
          <p className="text-slate-600 dark:text-slate-400">Create your first coupon to offer discounts</p>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {coupons.map((coupon) => (
              <Card key={coupon.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Coupon Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="px-4 py-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold text-lg">
                        {coupon.code}
                      </div>
                      {coupon.active ? (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300">
                          Active
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300">
                          Inactive
                        </span>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">Discount: </span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {coupon.discountType === 'PERCENTAGE' 
                            ? `${coupon.discountValue}%` 
                            : `₹${coupon.discountValue}`}
                        </span>
                      </div>

                      {coupon.minOrderAmount && (
                        <div>
                          <span className="text-slate-600 dark:text-slate-400">Min Order: </span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            ₹{Number(coupon.minOrderAmount).toLocaleString()}
                          </span>
                        </div>
                      )}

                      {coupon.maxDiscountAmount && (
                        <div>
                          <span className="text-slate-600 dark:text-slate-400">Max Discount: </span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            ₹{Number(coupon.maxDiscountAmount).toLocaleString()}
                          </span>
                        </div>
                      )}

                      {coupon.maxUses && (
                        <div>
                          <span className="text-slate-600 dark:text-slate-400">Usage: </span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {coupon.usedCount} / {coupon.maxUses}
                          </span>
                        </div>
                      )}

                      <div>
                        <span className="text-slate-600 dark:text-slate-400">Valid From: </span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {formatDate(coupon.validFrom)}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-600 dark:text-slate-400">Valid To: </span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {formatDate(coupon.validTo)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => handleEdit(coupon)}
                      className="flex-1 lg:flex-none"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(coupon.id)}
                      disabled={deleteMutation.isPending}
                      className="flex-1 lg:flex-none"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Showing page {page + 1} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="secondary" 
                  disabled={page === 0} 
                  onClick={() => setPage((p) => p - 1)}
                  className="min-w-[100px]"
                >
                  ← Previous
                </Button>
                <Button 
                  variant="secondary" 
                  disabled={page >= totalPages - 1} 
                  onClick={() => setPage((p) => p + 1)}
                  className="min-w-[100px]"
                >
                  Next →
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function formatDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('en-IN', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
}

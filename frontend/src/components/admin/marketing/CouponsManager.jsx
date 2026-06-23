import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Power, PowerOff } from 'lucide-react';
import { couponService } from '../../../services/couponService';
import { formatDiscountLabel } from '../../../utils/promotionUtils';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { showToast } from '../../ui/Toast';

export function CouponsManager() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-coupons-homepage'],
    queryFn: () => couponService.getAllCoupons({ page: 0, size: 50 }),
  });

  const coupons = data?.content ?? [];

  const toggleMutation = useMutation({
    mutationFn: ({ id, coupon }) => couponService.updateCoupon(id, { ...coupon, active: !coupon.active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons-homepage'] });
      queryClient.invalidateQueries({ queryKey: ['active-coupons'] });
      showToast('Coupon status updated', 'success');
    },
    onError: (e) => showToast(e.response?.data?.message || 'Failed to update coupon', 'error'),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Coupon Management</h2>
          <p className="text-sm text-slate-500">Enable or disable coupons shown on the homepage</p>
        </div>
        <Link to="/admin/coupons">
          <Button><Plus className="w-4 h-4 mr-2" /> Create / Edit Coupons</Button>
        </Link>
      </div>

      <Card className="p-6">
        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-14 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />)}</div>
        ) : coupons.length === 0 ? (
          <p className="text-slate-500">No coupons yet. Create coupons to display on the homepage offers section.</p>
        ) : (
          <div className="space-y-2">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{coupon.code}</p>
                  <p className="text-sm text-slate-500">{formatDiscountLabel(coupon)} · {coupon.usedCount ?? 0} uses</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${coupon.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                    {coupon.active ? 'Enabled' : 'Disabled'}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleMutation.mutate({ id: coupon.id, coupon })}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                    aria-label={coupon.active ? 'Disable coupon' : 'Enable coupon'}
                  >
                    {coupon.active ? <PowerOff className="w-4 h-4 text-amber-600" /> : <Power className="w-4 h-4 text-emerald-600" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

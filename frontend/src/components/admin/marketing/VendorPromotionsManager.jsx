import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Pause, X } from 'lucide-react';
import { marketingService } from '../../../services/marketingService';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { showToast } from '../../ui/Toast';

export function VendorPromotionsManager() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('PENDING');
  const [notes, setNotes] = useState({});

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['admin-vendor-promotions', filter],
    queryFn: () => marketingService.listVendorPromotions(filter || undefined),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, status, adminNotes }) =>
      marketingService.reviewVendorPromotion(id, { status, adminNotes }),
    onSuccess: () => {
      showToast('Vendor promotion updated', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin-vendor-promotions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-marketing-analytics'] });
    },
    onError: (e) => showToast(e.response?.data?.message || 'Action failed', 'error'),
  });

  const act = (id, status) => {
    reviewMutation.mutate({ id, status, adminNotes: notes[id] || '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Vendor Promotion Approval</h2>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2">
          <option value="">All</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="PAUSED">Paused</option>
          <option value="REMOVED">Removed</option>
        </select>
      </div>

      <Card className="p-6">
        {isLoading ? (
          <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />)}</div>
        ) : requests.length === 0 ? (
          <p className="text-slate-500">No vendor promotion requests{filter ? ` with status ${filter}` : ''}.</p>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{req.title}</p>
                    <p className="text-sm text-slate-500">Vendor #{req.vendorId} · {req.discountPercent}% off · {req.status}</p>
                    {req.description && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{req.description}</p>}
                  </div>
                </div>
                <textarea
                  value={notes[req.id] ?? req.adminNotes ?? ''}
                  onChange={(e) => setNotes({ ...notes, [req.id]: e.target.value })}
                  placeholder="Admin notes (optional)"
                  rows={2}
                  className="w-full mb-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                />
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => act(req.id, 'APPROVED')}><Check className="w-4 h-4 mr-1" /> Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => act(req.id, 'REJECTED')}><X className="w-4 h-4 mr-1" /> Reject</Button>
                  <Button size="sm" variant="outline" onClick={() => act(req.id, 'PAUSED')}><Pause className="w-4 h-4 mr-1" /> Pause</Button>
                  <Button size="sm" variant="outline" onClick={() => act(req.id, 'REMOVED')}>Remove</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

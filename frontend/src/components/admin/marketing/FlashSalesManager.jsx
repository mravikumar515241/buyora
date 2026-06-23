import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2, Power, PowerOff } from 'lucide-react';
import { marketingService } from '../../../services/marketingService';
import { fromDatetimeLocal, toDatetimeLocal, flashSaleToRequest } from '../../../utils/marketingFormUtils';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { showToast } from '../../ui/Toast';

const EMPTY = {
  title: '',
  description: '',
  startTime: '',
  endTime: '',
  active: true,
  discountPercent: '20',
  stockAllocationLimit: '',
  productIds: '',
};

export function FlashSalesManager() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const { data: flashSales = [], isLoading } = useQuery({
    queryKey: ['admin-marketing-flash-sales'],
    queryFn: () => marketingService.listFlashSales(),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-marketing-flash-sales'] });
    queryClient.invalidateQueries({ queryKey: ['marketing-homepage'] });
  };

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editing ? marketingService.updateFlashSale(editing.id, payload) : marketingService.createFlashSale(payload),
    onSuccess: () => {
      showToast(editing ? 'Flash sale updated' : 'Flash sale created', 'success');
      resetForm();
      invalidate();
    },
    onError: (e) => showToast(e.response?.data?.message || 'Failed to save flash sale', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => marketingService.deleteFlashSale(id),
    onSuccess: () => {
      showToast('Flash sale deleted', 'success');
      invalidate();
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (sale) => marketingService.updateFlashSale(sale.id, flashSaleToRequest(sale, { active: !sale.active })),
    onSuccess: () => {
      showToast('Flash sale status updated', 'success');
      invalidate();
    },
    onError: (e) => showToast(e.response?.data?.message || 'Failed to update flash sale', 'error'),
  });

  const resetForm = () => {
    setForm(EMPTY);
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (sale) => {
    const productIds = (sale.items ?? []).map((i) => i.productId).filter(Boolean).join(', ');
    setEditing(sale);
    setForm({
      title: sale.title || '',
      description: sale.description || '',
      startTime: toDatetimeLocal(sale.startTime),
      endTime: toDatetimeLocal(sale.endTime),
      active: sale.active !== false,
      discountPercent: sale.discountPercent?.toString() || '20',
      stockAllocationLimit: sale.stockAllocationLimit?.toString() || '',
      productIds,
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const ids = form.productIds.split(/[,\s]+/).map((s) => s.trim()).filter(Boolean).map(Number);
    saveMutation.mutate({
      title: form.title,
      description: form.description,
      startTime: fromDatetimeLocal(form.startTime),
      endTime: fromDatetimeLocal(form.endTime),
      active: form.active,
      discountPercent: parseFloat(form.discountPercent) || 20,
      stockAllocationLimit: form.stockAllocationLimit ? parseInt(form.stockAllocationLimit, 10) : null,
      items: ids.map((productId) => ({ productId })),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Flash Sales</h2>
          <p className="text-sm text-slate-500">Assign products by ID (comma-separated)</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}><Plus className="w-4 h-4 mr-2" /> New Flash Sale</Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <Input label="Discount %" type="number" value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: e.target.value })} />
            <Input label="Start Time" type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
            <Input label="End Time" type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
            <Input label="Stock Allocation Limit" type="number" value={form.stockAllocationLimit} onChange={(e) => setForm({ ...form, stockAllocationLimit: e.target.value })} />
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" id="flash-active" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              <label htmlFor="flash-active" className="text-sm font-medium">Active</label>
            </div>
            <div className="md:col-span-2">
              <Input label="Product IDs" value={form.productIds} onChange={(e) => setForm({ ...form, productIds: e.target.value })} placeholder="1, 2, 3" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2" />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <Button type="submit">{editing ? 'Update' : 'Create'}</Button>
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-6">
        {isLoading ? (
          <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        ) : flashSales.length === 0 ? (
          <p className="text-slate-500">No flash sales configured.</p>
        ) : (
          <div className="space-y-3">
            {flashSales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{sale.title}</p>
                  <p className="text-xs text-slate-500">
                    {sale.discountPercent}% off · {(sale.items ?? []).length} products · {sale.active ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => toggleMutation.mutate(sale)} className="p-2 rounded-lg hover:bg-white/50" aria-label={sale.active ? 'Disable' : 'Enable'}>
                    {sale.active ? <PowerOff className="w-4 h-4 text-amber-600" /> : <Power className="w-4 h-4 text-emerald-600" />}
                  </button>
                  <button type="button" onClick={() => handleEdit(sale)} className="p-2 rounded-lg hover:bg-white/50"><Pencil className="w-4 h-4" /></button>
                  <button type="button" onClick={() => window.confirm('Delete flash sale?') && deleteMutation.mutate(sale.id)} className="p-2 rounded-lg hover:bg-red-100 text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

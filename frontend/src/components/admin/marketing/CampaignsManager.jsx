import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { marketingService } from '../../../services/marketingService';
import { CAMPAIGN_STATUSES, CAMPAIGN_TYPES, fromDatetimeLocal, toDatetimeLocal } from '../../../utils/marketingFormUtils';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { showToast } from '../../ui/Toast';

const EMPTY = {
  name: '',
  description: '',
  campaignType: 'PLATFORM_PROMOTION',
  status: 'DRAFT',
  startDate: '',
  endDate: '',
  bannerId: '',
  categoryId: '',
  vendorId: '',
};

export function CampaignsManager() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['admin-marketing-campaigns'],
    queryFn: () => marketingService.listCampaigns(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-marketing-campaigns'] });

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editing ? marketingService.updateCampaign(editing.id, payload) : marketingService.createCampaign(payload),
    onSuccess: () => {
      showToast(editing ? 'Campaign updated' : 'Campaign created', 'success');
      resetForm();
      invalidate();
    },
    onError: (e) => showToast(e.response?.data?.message || 'Failed to save campaign', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => marketingService.deleteCampaign(id),
    onSuccess: () => {
      showToast('Campaign deleted', 'success');
      invalidate();
    },
  });

  const resetForm = () => {
    setForm(EMPTY);
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (c) => {
    setEditing(c);
    setForm({
      name: c.name || '',
      description: c.description || '',
      campaignType: c.campaignType || 'PLATFORM_PROMOTION',
      status: c.status || 'DRAFT',
      startDate: toDatetimeLocal(c.startDate),
      endDate: toDatetimeLocal(c.endDate),
      bannerId: c.bannerId?.toString() || '',
      categoryId: c.categoryId?.toString() || '',
      vendorId: c.vendorId?.toString() || '',
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate({
      name: form.name,
      description: form.description,
      campaignType: form.campaignType,
      status: form.status,
      startDate: fromDatetimeLocal(form.startDate),
      endDate: fromDatetimeLocal(form.endDate),
      bannerId: form.bannerId ? Number(form.bannerId) : null,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      vendorId: form.vendorId ? Number(form.vendorId) : null,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Promotional Campaigns</h2>
        <Button onClick={() => { resetForm(); setShowForm(true); }}><Plus className="w-4 h-4 mr-2" /> New Campaign</Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select value={form.campaignType} onChange={(e) => setForm({ ...form, campaignType: e.target.value })} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2">
                {CAMPAIGN_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2">
                {CAMPAIGN_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <Input label="Start Date" type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            <Input label="End Date" type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            <Input label="Banner ID (optional)" value={form.bannerId} onChange={(e) => setForm({ ...form, bannerId: e.target.value })} />
            <Input label="Category ID (optional)" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} />
            <Input label="Vendor ID (optional)" value={form.vendorId} onChange={(e) => setForm({ ...form, vendorId: e.target.value })} />
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
        ) : campaigns.length === 0 ? (
          <p className="text-slate-500">No campaigns yet.</p>
        ) : (
          <div className="space-y-3">
            {campaigns.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{c.name}</p>
                  <p className="text-xs text-slate-500">{c.campaignType} · {c.status}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => handleEdit(c)} className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"><Pencil className="w-4 h-4" /></button>
                  <button type="button" onClick={() => window.confirm('Delete campaign?') && deleteMutation.mutate(c.id)} className="p-2 rounded-lg hover:bg-red-100 text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

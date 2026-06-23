import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GripVertical, Pencil, Plus, Trash2, Power, PowerOff } from 'lucide-react';
import { marketingService } from '../../../services/marketingService';
import { BANNER_LOCATIONS, fromDatetimeLocal, toDatetimeLocal, bannerToRequest } from '../../../utils/marketingFormUtils';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { showToast } from '../../ui/Toast';

const EMPTY_BANNER = {
  title: '',
  subtitle: '',
  description: '',
  imageUrl: '',
  mobileImageUrl: '',
  gradient: 'from-indigo-600 via-violet-600 to-purple-700',
  buttonText: 'Shop Now',
  buttonLink: '/offers',
  badge: '',
  startDate: '',
  endDate: '',
  priority: 0,
  active: true,
  displayLocation: 'HERO',
};

export function BannersManager() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_BANNER);
  const [dragId, setDragId] = useState(null);

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['admin-marketing-banners'],
    queryFn: () => marketingService.listBanners(),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-marketing-banners'] });
    queryClient.invalidateQueries({ queryKey: ['marketing-homepage'] });
  };

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editing ? marketingService.updateBanner(editing.id, payload) : marketingService.createBanner(payload),
    onSuccess: () => {
      showToast(editing ? 'Banner updated' : 'Banner created', 'success');
      resetForm();
      invalidate();
    },
    onError: (e) => showToast(e.response?.data?.message || 'Failed to save banner', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => marketingService.deleteBanner(id),
    onSuccess: () => {
      showToast('Banner deleted', 'success');
      invalidate();
    },
    onError: (e) => showToast(e.response?.data?.message || 'Failed to delete', 'error'),
  });

  const reorderMutation = useMutation({
    mutationFn: (orderedIds) => marketingService.reorderBanners(orderedIds),
    onSuccess: () => {
      showToast('Banner order saved', 'success');
      invalidate();
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (banner) => marketingService.updateBanner(banner.id, bannerToRequest(banner, { active: !banner.active })),
    onSuccess: () => {
      showToast('Banner status updated', 'success');
      invalidate();
    },
    onError: (e) => showToast(e.response?.data?.message || 'Failed to update banner', 'error'),
  });

  const resetForm = () => {
    setForm(EMPTY_BANNER);
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (banner) => {
    setEditing(banner);
    setForm({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      description: banner.description || '',
      imageUrl: banner.imageUrl || '',
      mobileImageUrl: banner.mobileImageUrl || '',
      gradient: banner.gradient || EMPTY_BANNER.gradient,
      buttonText: banner.buttonText || '',
      buttonLink: banner.buttonLink || '',
      badge: banner.badge || '',
      startDate: toDatetimeLocal(banner.startDate),
      endDate: toDatetimeLocal(banner.endDate),
      priority: banner.priority ?? 0,
      active: banner.active !== false,
      displayLocation: banner.displayLocation || 'HERO',
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate({
      ...form,
      startDate: fromDatetimeLocal(form.startDate),
      endDate: fromDatetimeLocal(form.endDate),
      priority: Number(form.priority) || 0,
    });
  };

  const handleDrop = (targetId) => {
    if (dragId == null || dragId === targetId) return;
    const ids = banners.map((b) => b.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) return;
    ids.splice(from, 1);
    ids.splice(to, 0, dragId);
    reorderMutation.mutate(ids);
    setDragId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Banner Management</h2>
          <p className="text-sm text-slate-500">Drag rows to reorder hero carousel sequence</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" /> New Banner
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4">{editing ? 'Edit Banner' : 'Create Banner'}</h3>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <Input label="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
            <Input label="Badge" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} />
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Display Location</label>
              <select value={form.displayLocation} onChange={(e) => setForm({ ...form, displayLocation: e.target.value })} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2">
                {BANNER_LOCATIONS.map((loc) => <option key={loc.value} value={loc.value}>{loc.label}</option>)}
              </select>
            </div>
            <Input label="Desktop Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
            <Input label="Mobile Image URL" value={form.mobileImageUrl} onChange={(e) => setForm({ ...form, mobileImageUrl: e.target.value })} />
            <Input label="Gradient (Tailwind classes)" value={form.gradient} onChange={(e) => setForm({ ...form, gradient: e.target.value })} />
            <Input label="Button Text" value={form.buttonText} onChange={(e) => setForm({ ...form, buttonText: e.target.value })} />
            <Input label="Button Link" value={form.buttonLink} onChange={(e) => setForm({ ...form, buttonLink: e.target.value })} />
            <Input label="Start Date" type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            <Input label="End Date" type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            <Input label="Display Order" type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} />
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" id="banner-active" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              <label htmlFor="banner-active" className="text-sm font-medium">Active</label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2" />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <Button type="submit" disabled={saveMutation.isPending}>{editing ? 'Update' : 'Create'}</Button>
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-6">
        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />)}</div>
        ) : banners.length === 0 ? (
          <p className="text-slate-500">No banners yet. Create your first promotional banner.</p>
        ) : (
          <div className="space-y-2">
            {banners.map((banner) => (
              <div
                key={banner.id}
                draggable
                onDragStart={() => setDragId(banner.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(banner.id)}
                className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
              >
                <GripVertical className="w-5 h-5 text-slate-400 shrink-0 cursor-grab" />
                <div className={`w-12 h-12 rounded-lg shrink-0 bg-gradient-to-r ${banner.gradient || 'from-indigo-600 to-violet-700'}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 dark:text-white truncate">{banner.title}</p>
                  <p className="text-xs text-slate-500">{banner.displayLocation} · Priority {banner.priority} · {banner.active ? 'Active' : 'Inactive'}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button type="button" onClick={() => toggleMutation.mutate(banner)} className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700" aria-label={banner.active ? 'Disable banner' : 'Enable banner'}>
                    {banner.active ? <PowerOff className="w-4 h-4 text-amber-600" /> : <Power className="w-4 h-4 text-emerald-600" />}
                  </button>
                  <button type="button" onClick={() => handleEdit(banner)} className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700" aria-label="Edit">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => window.confirm('Delete this banner?') && deleteMutation.mutate(banner.id)} className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600" aria-label="Delete">
                    <Trash2 className="w-4 h-4" />
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

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { marketingService } from '../../../services/marketingService';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { showToast } from '../../ui/Toast';

const EMPTY = { name: '', url: '', mediaType: 'IMAGE' };

export function MediaLibraryManager() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const { data: media = [], isLoading } = useQuery({
    queryKey: ['admin-marketing-media'],
    queryFn: () => marketingService.listMedia(),
  });

  const createMutation = useMutation({
    mutationFn: (payload) => marketingService.createMedia(payload),
    onSuccess: () => {
      showToast('Media asset saved', 'success');
      setForm(EMPTY);
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['admin-marketing-media'] });
    },
    onError: (e) => showToast(e.response?.data?.message || 'Failed to save media', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => marketingService.deleteMedia(id),
    onSuccess: () => {
      showToast('Media deleted', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin-marketing-media'] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Media Library</h2>
          <p className="text-sm text-slate-500">Save image URLs for reuse in banners and campaigns</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" /> Add Asset</Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate(form);
            }}
            className="grid md:grid-cols-2 gap-4"
          >
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select value={form.mediaType} onChange={(e) => setForm({ ...form, mediaType: e.target.value })} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2">
                <option value="IMAGE">Image</option>
                <option value="BANNER">Banner</option>
                <option value="LOGO">Logo</option>
                <option value="CAMPAIGN">Campaign Asset</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <Input label="URL" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} required placeholder="https://..." />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <Button type="submit">Save</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-6">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="aspect-video bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />)}
          </div>
        ) : media.length === 0 ? (
          <p className="text-slate-500">No media assets yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {media.map((item) => (
              <div key={item.id} className="group relative rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800">
                {item.url ? (
                  <img src={item.url} alt={item.name} className="aspect-video w-full object-cover" />
                ) : (
                  <div className="aspect-video bg-slate-200 dark:bg-slate-700" />
                )}
                <div className="p-3">
                  <p className="font-semibold text-sm truncate">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.mediaType}</p>
                </div>
                <button
                  type="button"
                  onClick={() => window.confirm('Delete asset?') && deleteMutation.mutate(item.id)}
                  className="absolute top-2 right-2 p-2 rounded-lg bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

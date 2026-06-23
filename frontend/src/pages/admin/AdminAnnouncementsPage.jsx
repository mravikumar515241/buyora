import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Megaphone, Plus, Pencil, Trash2 } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { showToast } from '../../components/ui/Toast';

const AUDIENCES = [
  { value: 'ALL_USERS', label: 'All Users' },
  { value: 'CUSTOMERS_ONLY', label: 'Customers Only' },
  { value: 'VENDORS_ONLY', label: 'Vendors Only' },
  { value: 'ADMINS_ONLY', label: 'Admins Only' },
  { value: 'SPECIFIC_USER', label: 'Specific User' },
  { value: 'SPECIFIC_VENDOR', label: 'Specific Vendor' },
];

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const emptyForm = {
  title: '',
  description: '',
  bannerImageUrl: '',
  priority: 'MEDIUM',
  audience: 'ALL_USERS',
  targetUserId: '',
  targetVendorId: '',
  startDate: '',
  endDate: '',
  active: true,
};

function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toIso(local) {
  return local ? new Date(local).toISOString().slice(0, 19) : null;
}

export function AdminAnnouncementsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['admin-announcements'],
    queryFn: () => notificationService.listAnnouncements(),
  });

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editing
        ? notificationService.updateAnnouncement(editing.id, payload)
        : notificationService.createAnnouncement(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      showToast.success(editing ? 'Announcement updated' : 'Announcement created');
      resetForm();
    },
    onError: (e) => showToast.error(e.response?.data?.message || 'Failed to save announcement'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => notificationService.deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      showToast.success('Announcement deleted');
    },
  });

  const resetForm = () => {
    setForm(emptyForm);
    setEditing(null);
    setShowForm(false);
  };

  const openEdit = (a) => {
    setEditing(a);
    setForm({
      title: a.title || '',
      description: a.description || '',
      bannerImageUrl: a.bannerImageUrl || '',
      priority: a.priority || 'MEDIUM',
      audience: a.audience || 'ALL_USERS',
      targetUserId: a.targetUserId?.toString() || '',
      targetVendorId: a.targetVendorId?.toString() || '',
      startDate: toLocalInput(a.startDate),
      endDate: toLocalInput(a.endDate),
      active: a.active ?? true,
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      description: form.description,
      bannerImageUrl: form.bannerImageUrl || null,
      priority: form.priority,
      audience: form.audience,
      targetUserId: form.targetUserId ? Number(form.targetUserId) : null,
      targetVendorId: form.targetVendorId ? Number(form.targetVendorId) : null,
      startDate: toIso(form.startDate),
      endDate: toIso(form.endDate),
      active: form.active,
    };
    saveMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Megaphone className="w-7 h-7 text-indigo-600" />
            Announcement Center
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Create, schedule, and manage platform-wide announcements delivered to user notification inboxes.
          </p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          New Announcement
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            {editing ? 'Edit Announcement' : 'Create Announcement'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">Banner Image URL</label>
                <Input value={form.bannerImageUrl} onChange={(e) => setForm({ ...form, bannerImageUrl: e.target.value })} placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Audience</label>
                <select
                  value={form.audience}
                  onChange={(e) => setForm({ ...form, audience: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm"
                >
                  {AUDIENCES.map((a) => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
              </div>
              {form.audience === 'SPECIFIC_USER' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Target User ID</label>
                  <Input value={form.targetUserId} onChange={(e) => setForm({ ...form, targetUserId: e.target.value })} type="number" />
                </div>
              )}
              {form.audience === 'SPECIFIC_VENDOR' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Target Vendor ID</label>
                  <Input value={form.targetVendorId} onChange={(e) => setForm({ ...form, targetVendorId: e.target.value })} type="number" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <Input type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <Input type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="active" className="text-sm font-medium">Enabled</label>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving...' : editing ? 'Update' : 'Create'}
              </Button>
              <Button type="button" variant="secondary" onClick={resetForm}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <Card className="text-center py-16">
          <Megaphone className="w-12 h-12 mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600 dark:text-slate-400">No announcements yet. Create your first campaign announcement.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <Card key={a.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              {a.bannerImageUrl && (
                <img src={a.bannerImageUrl} alt="" className="w-full sm:w-24 h-16 object-cover rounded-lg" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-bold text-slate-900 dark:text-white">{a.title}</h3>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    a.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                  }`}>
                    {a.active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-xs text-slate-500">{a.audience?.replace(/_/g, ' ')}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{a.description}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {a.startDate ? `From ${new Date(a.startDate).toLocaleString()}` : 'No start date'}
                  {a.endDate ? ` · Until ${new Date(a.endDate).toLocaleString()}` : ''}
                  {a.dispatched ? ' · Dispatched' : ''}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button variant="secondary" size="sm" onClick={() => openEdit(a)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600"
                  onClick={() => {
                    if (window.confirm('Delete this announcement?')) deleteMutation.mutate(a.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

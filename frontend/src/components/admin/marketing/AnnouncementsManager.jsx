import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2, Power, PowerOff } from 'lucide-react';
import { marketingService } from '../../../services/marketingService';
import { fromDatetimeLocal, toDatetimeLocal, announcementToRequest } from '../../../utils/marketingFormUtils';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { showToast } from '../../ui/Toast';

const EMPTY = {
  text: '',
  link: '',
  backgroundColor: '#4f46e5',
  textColor: '#ffffff',
  priority: 0,
  active: true,
  startTime: '',
  endTime: '',
};

export function AnnouncementsManager() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['admin-marketing-announcements'],
    queryFn: () => marketingService.listAnnouncements(),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-marketing-announcements'] });
    queryClient.invalidateQueries({ queryKey: ['marketing-homepage'] });
  };

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editing ? marketingService.updateAnnouncement(editing.id, payload) : marketingService.createAnnouncement(payload),
    onSuccess: () => {
      showToast(editing ? 'Announcement updated' : 'Announcement created', 'success');
      resetForm();
      invalidate();
    },
    onError: (e) => showToast(e.response?.data?.message || 'Failed to save', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => marketingService.deleteAnnouncement(id),
    onSuccess: () => {
      showToast('Announcement deleted', 'success');
      invalidate();
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (announcement) =>
      marketingService.updateAnnouncement(announcement.id, announcementToRequest(announcement, { active: !announcement.active })),
    onSuccess: () => {
      showToast('Announcement status updated', 'success');
      invalidate();
    },
    onError: (e) => showToast(e.response?.data?.message || 'Failed to update', 'error'),
  });

  const resetForm = () => {
    setForm(EMPTY);
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (a) => {
    setEditing(a);
    setForm({
      text: a.text || '',
      link: a.link || '',
      backgroundColor: a.backgroundColor || '#4f46e5',
      textColor: a.textColor || '#ffffff',
      priority: a.priority ?? 0,
      active: a.active !== false,
      startTime: toDatetimeLocal(a.startTime),
      endTime: toDatetimeLocal(a.endTime),
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate({
      ...form,
      priority: Number(form.priority) || 0,
      startTime: fromDatetimeLocal(form.startTime),
      endTime: fromDatetimeLocal(form.endTime),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Announcement Bar</h2>
        <Button onClick={() => { resetForm(); setShowForm(true); }}><Plus className="w-4 h-4 mr-2" /> New Announcement</Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input label="Text" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} required />
            </div>
            <Input label="Link (optional)" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
            <Input label="Priority" type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} />
            <Input label="Background Color" type="color" value={form.backgroundColor} onChange={(e) => setForm({ ...form, backgroundColor: e.target.value })} />
            <Input label="Text Color" type="color" value={form.textColor} onChange={(e) => setForm({ ...form, textColor: e.target.value })} />
            <Input label="Start Time" type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
            <Input label="End Time" type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
            <div className="flex items-center gap-2">
              <input type="checkbox" id="ann-active" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              <label htmlFor="ann-active" className="text-sm font-medium">Active</label>
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
          <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        ) : announcements.length === 0 ? (
          <p className="text-slate-500">No announcement bars configured.</p>
        ) : (
          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700" style={{ backgroundColor: a.backgroundColor, color: a.textColor }}>
                <span className="font-semibold truncate flex-1">{a.text}</span>
                <div className="flex gap-2 ml-3">
                  <button type="button" onClick={() => toggleMutation.mutate(a)} className="p-2 rounded bg-white/20" aria-label={a.active ? 'Disable' : 'Enable'}>
                    {a.active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                  </button>
                  <button type="button" onClick={() => handleEdit(a)} className="p-2 rounded bg-white/20"><Pencil className="w-4 h-4" /></button>
                  <button type="button" onClick={() => window.confirm('Delete?') && deleteMutation.mutate(a.id)} className="p-2 rounded bg-white/20"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

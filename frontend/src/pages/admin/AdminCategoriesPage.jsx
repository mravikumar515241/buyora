import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../../services/categoryService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{title}</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm}>Delete</Button>
        </div>
      </Card>
    </div>
  );
}

export function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });

  const { data: categoriesRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.list(),
  });
  const categories = Array.isArray(categoriesRes) ? categoriesRes : [];

  const createMutation = useMutation({
    mutationFn: (data) => categoryService.create({ name: data.name, description: data.description || null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }) => categoryService.update(id, { name, description: null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setEditingId(null);
      setEditingName('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => categoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setDeleteDialog({ open: false, id: null, name: '' });
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const handleEdit = (category) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editingName.trim()) return;
    updateMutation.mutate({ id: editingId, name: editingName.trim() });
  };

  const handleDeleteClick = (category) => {
    setDeleteDialog({ open: true, id: category.id, name: category.name });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Category Management</h1>

      {/* Add Category */}
      <Card className="mb-6 max-w-md dark:bg-slate-800 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Add Category</h2>
        <form
          onSubmit={handleSubmit((d) =>
            createMutation.mutate(d, { onSuccess: () => reset() })
          )}
          className="space-y-4"
        >
          <Input
            label="Category Name"
            placeholder="e.g. Electronics"
            error={errors.name?.message}
            {...register('name', { required: 'Name is required' })}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description (optional)</label>
            <textarea
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={2}
              placeholder="Short description"
              {...register('description')}
            />
          </div>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating...' : 'Create Category'}
          </Button>
          {createMutation.isError && (
            <p className="text-red-600 dark:text-red-400 text-sm">
              {createMutation.error?.response?.data?.message || 'Failed to add category'}
            </p>
          )}
          {createMutation.isSuccess && (
            <p className="text-green-600 dark:text-green-400 text-sm">Category created.</p>
          )}
        </form>
      </Card>

      {/* Existing categories */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Existing Categories</h2>
        {categories.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400">No categories yet. Add one above.</p>
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-slate-600">
            {categories.map((c) => (
              <li key={c.id} className="py-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {editingId === c.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        autoFocus
                      />
                      <Button size="sm" onClick={handleSaveEdit} disabled={updateMutation.isPending}>
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => { setEditingId(null); setEditingName(''); }}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="font-medium text-slate-800 dark:text-slate-100">{c.name}</span>
                      <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">
                        ({c.productCount ?? 0} product{(c.productCount ?? 0) !== 1 ? 's' : ''})
                      </span>
                      {c.description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{c.description}</p>
                      )}
                    </>
                  )}
                </div>
                {editingId !== c.id && (
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => handleEdit(c)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDeleteClick(c)}>
                      Delete
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null, name: '' })}
        onConfirm={() => deleteDialog.id && deleteMutation.mutate(deleteDialog.id)}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteDialog.name}"?`}
      />
    </div>
  );
}

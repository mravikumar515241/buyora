import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '../../services/inventoryService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { StockBadge } from '../../components/ui/StockBadge';
import { showToast } from '../../components/ui/Toast';

function StatCard({ title, value, subtitle, color = 'indigo' }) {
  const colors = {
    indigo: 'from-indigo-500 to-blue-600',
    orange: 'from-orange-500 to-amber-600',
    red: 'from-red-500 to-rose-600',
    green: 'from-emerald-500 to-teal-600',
  };
  return (
    <Card className="p-5">
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{title}</p>
      <p className={`text-3xl font-bold bg-gradient-to-r ${colors[color]} bg-clip-text text-transparent`}>
        {value}
      </p>
      {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
    </Card>
  );
}

export function VendorInventoryPage() {
  const queryClient = useQueryClient();
  const [adjustments, setAdjustments] = useState({});
  const [setStockValues, setSetStockValues] = useState({});

  const [bulkRows, setBulkRows] = useState('');
  const fileInputRef = useRef(null);

  const { data: analytics } = useQuery({
    queryKey: ['vendor-inventory-analytics'],
    queryFn: () => inventoryService.getVendorAnalytics(),
  });

  const { data: dashboard } = useQuery({
    queryKey: ['vendor-inventory-dashboard'],
    queryFn: () => inventoryService.getVendorDashboard(),
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['vendor-inventory-products'],
    queryFn: () => inventoryService.getVendorProducts(),
  });

  const { data: notificationsPage } = useQuery({
    queryKey: ['vendor-inventory-notifications'],
    queryFn: () => inventoryService.getNotifications({ page: 0, size: 10 }),
  });

  const { data: historyPage } = useQuery({
    queryKey: ['vendor-inventory-history'],
    queryFn: () => inventoryService.getVendorHistory({ page: 0, size: 10 }),
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['vendor-inventory-dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['vendor-inventory-products'] });
    queryClient.invalidateQueries({ queryKey: ['vendor-inventory-history'] });
    queryClient.invalidateQueries({ queryKey: ['vendor-products'] });
  };

  const increaseMutation = useMutation({
    mutationFn: ({ productId, quantity }) =>
      inventoryService.increaseStock(productId, { quantity, notes: 'Manual increase' }),
    onSuccess: () => {
      showToast.success('Stock increased');
      invalidateAll();
    },
    onError: (e) => showToast.error(e.response?.data?.message || 'Failed to increase stock'),
  });

  const decreaseMutation = useMutation({
    mutationFn: ({ productId, quantity }) =>
      inventoryService.decreaseStock(productId, { quantity, notes: 'Manual decrease' }),
    onSuccess: () => {
      showToast.success('Stock decreased');
      invalidateAll();
    },
    onError: (e) => showToast.error(e.response?.data?.message || 'Failed to decrease stock'),
  });

  const setStockMutation = useMutation({
    mutationFn: ({ productId, stockQuantity }) =>
      inventoryService.setStock(productId, { stockQuantity, notes: 'Manual stock set' }),
    onSuccess: () => {
      showToast.success('Stock updated');
      invalidateAll();
    },
    onError: (e) => showToast.error(e.response?.data?.message || 'Failed to update stock'),
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => inventoryService.markNotificationRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendor-inventory-notifications'] }),
  });

  const bulkMutation = useMutation({
    mutationFn: (items) => inventoryService.bulkUpdate(items),
    onSuccess: () => {
      showToast.success('Bulk stock updated');
      invalidateAll();
      setBulkRows('');
    },
    onError: (e) => showToast.error(e.response?.data?.message || 'Bulk update failed'),
  });

  const uploadMutation = useMutation({
    mutationFn: (csv) => inventoryService.uploadStockSheet(csv),
    onSuccess: () => {
      showToast.success('Stock sheet uploaded');
      invalidateAll();
    },
    onError: (e) => showToast.error(e.response?.data?.message || 'Upload failed'),
  });

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => uploadMutation.mutate(reader.result);
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleBulkSubmit = () => {
    const items = bulkRows
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [id, qty] = line.split(',').map((s) => s.trim());
        return { productId: Number(id), stockQuantity: Number(qty) };
      })
      .filter((row) => row.productId && !Number.isNaN(row.stockQuantity));
    if (!items.length) {
      showToast.error('Enter rows as productId,quantity');
      return;
    }
    bulkMutation.mutate(items);
  };

  const notifications = notificationsPage?.content ?? [];
  const history = historyPage?.content ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Inventory Management</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Track stock levels, reservations, and inventory history
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/vendor/inventory/low-stock">
          <Button variant="outline" size="sm">Low Stock ({dashboard?.lowStockProducts ?? 0})</Button>
        </Link>
        <Link to="/vendor/inventory/out-of-stock">
          <Button variant="outline" size="sm">Out of Stock ({dashboard?.outOfStockProducts ?? 0})</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Products" value={dashboard?.totalProducts ?? 0} color="indigo" />
        <StatCard title="In Stock" value={dashboard?.productsInStock ?? 0} color="green" />
        <StatCard title="Low Stock" value={dashboard?.lowStockProducts ?? 0} color="orange" />
        <StatCard title="Out of Stock" value={dashboard?.outOfStockProducts ?? 0} color="red" />
        <StatCard
          title="Total Units"
          value={dashboard?.totalInventoryUnits ?? 0}
          subtitle={`₹${Number(dashboard?.inventoryValue ?? 0).toLocaleString('en-IN')} value`}
          color="indigo"
        />
      </div>

      {(analytics?.mostSoldProducts?.length > 0 || analytics?.leastSoldProducts?.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">Most Sold</h2>
            <div className="space-y-2">
              {(analytics?.mostSoldProducts ?? []).map((p) => (
                <div key={p.productId} className="flex justify-between text-sm">
                  <span className="text-slate-700 dark:text-slate-300 truncate pr-2">{p.productName}</span>
                  <span className="font-medium text-slate-800 dark:text-slate-100">{p.totalSold}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">Slow Moving</h2>
            <div className="space-y-2">
              {(analytics?.slowMovingProducts ?? []).map((p) => (
                <div key={p.productId} className="flex justify-between text-sm">
                  <span className="text-slate-700 dark:text-slate-300 truncate pr-2">{p.productName}</span>
                  <span className="font-medium text-slate-800 dark:text-slate-100">{p.totalSold}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      <Card className="p-5">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">Bulk Stock Update</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          One row per product: productId,quantity — or upload a CSV sheet
        </p>
        <textarea
          value={bulkRows}
          onChange={(e) => setBulkRows(e.target.value)}
          rows={4}
          placeholder={'12,50\n13,25'}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 text-sm mb-3"
        />
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={handleBulkSubmit} disabled={bulkMutation.isPending}>
            Apply Bulk Update
          </Button>
          <input ref={fileInputRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />
          <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploadMutation.isPending}>
            Upload Stock Sheet
          </Button>
        </div>
      </Card>

      {notifications.length > 0 && (
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Stock Alerts</h2>
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-start justify-between gap-4 p-3 rounded-xl border ${
                  n.read
                    ? 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50'
                    : 'border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/20'
                }`}
              >
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-100">{n.message}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {!n.read && (
                  <Button size="sm" variant="outline" onClick={() => markReadMutation.mutate(n.id)}>
                    Mark read
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-5 overflow-x-auto">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Product Inventory</h2>
        {isLoading ? (
          <div className="animate-pulse h-40 bg-slate-100 dark:bg-slate-700 rounded-xl" />
        ) : products.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-center py-8">No products found.</p>
        ) : (
          <table className="w-full min-w-[800px] text-sm hidden lg:table">
            <thead>
              <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <th className="pb-3 pr-4">Product</th>
                <th className="pb-3 pr-4">SKU</th>
                <th className="pb-3 pr-4">Stock</th>
                <th className="pb-3 pr-4">Reserved</th>
                <th className="pb-3 pr-4">Sold</th>
                <th className="pb-3 pr-4">Available</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Adjust</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.productId} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700" />
                      )}
                      <span className="font-medium text-slate-800 dark:text-slate-100">{p.productName}</span>
                    </div>
                  </td>
                  <td className="py-4 pr-4 text-slate-500 dark:text-slate-400 text-xs">{p.sku || '—'}</td>
                  <td className="py-4 pr-4 text-slate-700 dark:text-slate-300">{p.stockQuantity}</td>
                  <td className="py-4 pr-4 text-slate-700 dark:text-slate-300">{p.reservedQuantity}</td>
                  <td className="py-4 pr-4 text-slate-700 dark:text-slate-300">{p.soldQuantity ?? 0}</td>
                  <td className="py-4 pr-4 font-semibold text-slate-800 dark:text-slate-100">{p.availableQuantity}</td>
                  <td className="py-4 pr-4">
                    <StockBadge available={p.availableQuantity} stockStatus={p.stockStatus} lowStockThreshold={p.lowStockThreshold} />
                  </td>
                  <td className="py-4">
                    <div className="flex flex-wrap items-end gap-2">
                      <Input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={adjustments[p.productId] ?? ''}
                        onChange={(e) =>
                          setAdjustments((prev) => ({ ...prev, [p.productId]: e.target.value }))
                        }
                        className="w-20"
                      />
                      <Button
                        size="sm"
                        onClick={() =>
                          increaseMutation.mutate({
                            productId: p.productId,
                            quantity: Number(adjustments[p.productId] || 1),
                          })
                        }
                      >
                        +
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          decreaseMutation.mutate({
                            productId: p.productId,
                            quantity: Number(adjustments[p.productId] || 1),
                          })
                        }
                      >
                        −
                      </Button>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Set"
                        value={setStockValues[p.productId] ?? ''}
                        onChange={(e) =>
                          setSetStockValues((prev) => ({ ...prev, [p.productId]: e.target.value }))
                        }
                        className="w-24"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setStockMutation.mutate({
                            productId: p.productId,
                            stockQuantity: Number(setStockValues[p.productId]),
                          })
                        }
                        disabled={setStockValues[p.productId] === '' || setStockValues[p.productId] == null}
                      >
                        Set
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && products.length > 0 && (
          <div className="lg:hidden mt-4 space-y-3">
            {products.map((p) => (
              <div key={p.productId} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex gap-3 mb-3">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-700" />
                  )}
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{p.productName}</p>
                    <StockBadge available={p.availableQuantity} stockStatus={p.stockStatus} lowStockThreshold={p.lowStockThreshold} />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mb-2">
                  Stock {p.stockQuantity} · Reserved {p.reservedQuantity} · Sold {p.soldQuantity ?? 0}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => increaseMutation.mutate({ productId: p.productId, quantity: 1 })}>+1</Button>
                  <Button size="sm" variant="secondary" onClick={() => decreaseMutation.mutate({ productId: p.productId, quantity: 1 })}>-1</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-5">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Inventory History</h2>
        {history.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-center py-6">No inventory movements yet.</p>
        ) : (
          <div className="space-y-3">
            {history.map((h) => (
              <div key={h.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-100">
                      {h.productName} — {h.changeType.replace(/_/g, ' ')}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Stock: {h.previousStock} → {h.newStock}
                      {h.previousReserved != null && ` | Reserved: ${h.previousReserved} → ${h.newReserved}`}
                    </p>
                    {h.notes && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{h.notes}</p>}
                  </div>
                  <div className="text-right text-xs text-slate-500 dark:text-slate-400">
                    <p>{h.changedByName || 'System'}</p>
                    <p>{new Date(h.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

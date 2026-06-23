import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '../../services/inventoryService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { StockBadge } from '../../components/ui/StockBadge';
import { showToast } from '../../components/ui/Toast';

function StatCard({ title, value, subtitle }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{title}</p>
      <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
      {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
    </Card>
  );
}

export function AdminInventoryPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [stockEdits, setStockEdits] = useState({});

  const { data: dashboard } = useQuery({
    queryKey: ['admin-inventory-dashboard'],
    queryFn: () => inventoryService.getAdminDashboard(),
  });

  const { data: productsPage, isLoading } = useQuery({
    queryKey: ['admin-inventory-products', page],
    queryFn: () => inventoryService.getAdminProducts({ page, size: 15 }),
  });

  const setStockMutation = useMutation({
    mutationFn: ({ productId, stockQuantity }) =>
      inventoryService.adminSetStock(productId, { stockQuantity, notes: 'Admin adjustment' }),
    onSuccess: () => {
      showToast.success('Stock updated');
      queryClient.invalidateQueries({ queryKey: ['admin-inventory-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-inventory-dashboard'] });
    },
    onError: (e) => showToast.error(e.response?.data?.message || 'Failed to update stock'),
  });

  const products = productsPage?.content ?? [];
  const totalPages = productsPage?.totalPages ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Inventory Control</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Platform-wide stock overview, adjustments, and vendor health
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Products" value={dashboard?.totalProducts ?? 0} />
        <StatCard title="In Stock" value={dashboard?.productsInStock ?? 0} />
        <StatCard title="Low Stock" value={dashboard?.lowStockProducts ?? 0} />
        <StatCard title="Out of Stock" value={dashboard?.outOfStockProducts ?? 0} />
        <StatCard
          title="Stock Value"
          value={`₹${Number(dashboard?.totalInventoryValue ?? 0).toLocaleString('en-IN')}`}
          subtitle={`${dashboard?.totalInventoryUnits ?? 0} units`}
        />
      </div>

      {dashboard?.topSellingProducts?.length > 0 && (
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Top Selling Products</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {dashboard.topSellingProducts.map((p) => (
              <div key={p.productId} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <p className="font-medium text-slate-800 dark:text-slate-100 truncate">{p.productName}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{p.totalSold} sold</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {dashboard?.vendorHealth?.length > 0 && (
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Vendor Inventory Health</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <th className="pb-2 pr-4">Vendor</th>
                  <th className="pb-2 pr-4">Products</th>
                  <th className="pb-2 pr-4">Low Stock</th>
                  <th className="pb-2">Out of Stock</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.vendorHealth.map((v) => (
                  <tr key={v.vendorId} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3 pr-4 font-medium text-slate-800 dark:text-slate-100">{v.vendorName}</td>
                    <td className="py-3 pr-4">{v.totalProducts}</td>
                    <td className="py-3 pr-4 text-orange-600 dark:text-orange-400">{v.lowStockProducts}</td>
                    <td className="py-3 text-red-600 dark:text-red-400">{v.outOfStockProducts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Card className="p-5">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">All Inventory</h2>
        {isLoading ? (
          <div className="animate-pulse h-40 bg-slate-100 dark:bg-slate-700 rounded-xl" />
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                    <th className="pb-3 pr-4">Product</th>
                    <th className="pb-3 pr-4">Vendor</th>
                    <th className="pb-3 pr-4">Available</th>
                    <th className="pb-3 pr-4">Sold</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3">Adjust</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.productId} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-slate-800 dark:text-slate-100">{p.productName}</p>
                        {p.sku && <p className="text-xs text-slate-500">{p.sku}</p>}
                      </td>
                      <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">{p.vendorName}</td>
                      <td className="py-3 pr-4">{p.availableQuantity}</td>
                      <td className="py-3 pr-4">{p.soldQuantity ?? 0}</td>
                      <td className="py-3 pr-4">
                        <StockBadge available={p.availableQuantity} stockStatus={p.stockStatus} />
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            min="0"
                            placeholder={p.stockQuantity}
                            value={stockEdits[p.productId] ?? ''}
                            onChange={(e) =>
                              setStockEdits((prev) => ({ ...prev, [p.productId]: e.target.value }))
                            }
                            className="w-24"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={stockEdits[p.productId] === '' || stockEdits[p.productId] == null}
                            onClick={() =>
                              setStockMutation.mutate({
                                productId: p.productId,
                                stockQuantity: Number(stockEdits[p.productId]),
                              })
                            }
                          >
                            Set
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden space-y-3">
              {products.map((p) => (
                <div key={p.productId} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{p.productName}</p>
                  <p className="text-xs text-slate-500 mt-1">{p.vendorName}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <StockBadge available={p.availableQuantity} stockStatus={p.stockStatus} />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {p.availableQuantity} available
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <span className="px-3 py-1 text-sm text-slate-600 dark:text-slate-400">
                  Page {page + 1} of {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

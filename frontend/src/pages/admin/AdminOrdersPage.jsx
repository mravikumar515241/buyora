import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const STATUS_OPTIONS = ['CREATED', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function StatusBadge({ status }) {
  const config = {
    CREATED: {
      bg: 'bg-slate-100 dark:bg-slate-700/50',
      text: 'text-slate-800 dark:text-slate-200',
      icon: '🆕',
      label: 'Created'
    },
    PAID: {
      bg: 'bg-indigo-100 dark:bg-indigo-900/30',
      text: 'text-indigo-800 dark:text-indigo-300',
      icon: '💳',
      label: 'Paid'
    },
    SHIPPED: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-800 dark:text-blue-300',
      icon: '📦',
      label: 'Shipped'
    },
    DELIVERED: {
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      text: 'text-emerald-800 dark:text-emerald-300',
      icon: '✅',
      label: 'Delivered'
    },
    CANCELLED: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-800 dark:text-red-300',
      icon: '❌',
      label: 'Cancelled'
    },
  };

  const style = config[status] ?? config.CREATED;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${style.bg} ${style.text}`}>
      <span>{style.icon}</span>
      <span>{style.label}</span>
    </span>
  );
}

export function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const size = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page],
    queryFn: () => adminService.orders({ page, size }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => adminService.updateOrderStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-orders'] }),
  });

  const orders = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.id.toString().includes(searchTerm) ||
      order.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: orders.length,
    paid: orders.filter(o => o.status === 'PAID').length,
    shipped: orders.filter(o => o.status === 'SHIPPED').length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Order Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Track and manage all customer orders</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Orders</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center text-2xl">
              📋
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Paid</p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{stats.paid}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-2xl">
              💳
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Shipped</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.shipped}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-2xl">
              📦
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Delivered</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.delivered}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-2xl">
              ✅
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by order ID or customer email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none w-full pl-4 pr-10 py-2.5 rounded-xl 
                  border-2 border-slate-200 dark:border-slate-600 
                  bg-white dark:bg-slate-800 
                  text-slate-900 dark:text-white 
                  font-medium
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                  dark:focus:ring-indigo-400 
                  transition-all duration-200
                  hover:border-indigo-300 dark:hover:border-indigo-500
                  cursor-pointer"
              >
                <option value="ALL">All Status</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                <svg className="w-5 h-5 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Orders List */}
      {isLoading ? (
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="h-32 animate-pulse bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">No orders found</h3>
          <p className="text-slate-600 dark:text-slate-400">
            {searchTerm || filterStatus !== 'ALL' ? 'Try adjusting your filters' : 'Orders will appear here once customers start placing them'}
          </p>
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <Card className="overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Order</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                              #{order.id}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">Order #{order.id}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{formatTime(order.createdAt)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-sm font-semibold">
                              {order.userEmail?.[0]?.toUpperCase() ?? '?'}
                            </div>
                            <span className="text-sm text-slate-700 dark:text-slate-300">{order.userEmail ?? '—'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600 dark:text-slate-400">{formatDate(order.createdAt)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-lg font-bold text-slate-900 dark:text-white">₹{Number(order.totalAmount).toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative inline-block">
                            <select
                              className="appearance-none pl-4 pr-10 py-2.5 rounded-xl 
                                border-2 border-slate-200 dark:border-slate-600 
                                bg-white dark:bg-slate-700 
                                text-slate-900 dark:text-white 
                                text-sm font-semibold
                                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                dark:focus:ring-indigo-400 
                                transition-all duration-200
                                hover:border-indigo-300 dark:hover:border-indigo-500
                                hover:shadow-md
                                cursor-pointer"
                              value={order.status}
                              onChange={(e) => updateStatusMutation.mutate({ id: order.id, status: e.target.value })}
                              disabled={updateStatusMutation.isPending}
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                              <svg className="w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        #{order.id}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">Order #{order.id}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  {/* Customer */}
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-slate-700 dark:text-slate-300">{order.userEmail ?? '—'}</span>
                  </div>

                  {/* Amount */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Amount</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-white">₹{Number(order.totalAmount).toLocaleString()}</span>
                  </div>

                  {/* Status Update */}
                  <div className="relative">
                    <select
                      className="appearance-none w-full pl-4 pr-10 py-3 rounded-xl 
                        border-2 border-slate-200 dark:border-slate-600 
                        bg-white dark:bg-slate-700 
                        text-slate-900 dark:text-white 
                        font-semibold
                        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                        dark:focus:ring-indigo-400 
                        transition-all duration-200
                        hover:border-indigo-300 dark:hover:border-indigo-500
                        hover:shadow-md
                        cursor-pointer"
                      value={order.status}
                      onChange={(e) => updateStatusMutation.mutate({ id: order.id, status: e.target.value })}
                      disabled={updateStatusMutation.isPending}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                      <svg className="w-5 h-5 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Showing page {page + 1} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="secondary" 
                  disabled={page === 0} 
                  onClick={() => setPage((p) => p - 1)}
                  className="min-w-[100px]"
                >
                  ← Previous
                </Button>
                <Button 
                  variant="secondary" 
                  disabled={page >= totalPages - 1} 
                  onClick={() => setPage((p) => p + 1)}
                  className="min-w-[100px]"
                >
                  Next →
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

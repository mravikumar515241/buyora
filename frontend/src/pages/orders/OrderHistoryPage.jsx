import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '../../services/orderService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

function getStatusBadgeClass(status) {
  const classes = {
    CREATED: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
    PAID: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    CONFIRMED: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
    SHIPPED: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
    DELIVERED: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  };
  return classes[status] || 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
}

function formatDate(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function Pagination({ page, totalPages, onPageChange }) {
  const pages = useMemo(() => {
    const arr = [];
    const show = 5;
    let start = Math.max(0, page - Math.floor(show / 2));
    let end = Math.min(totalPages, start + show);
    if (end - start < show) start = Math.max(0, end - show);
    for (let i = start; i < end; i++) arr.push(i);
    return arr;
  }, [page, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
      <Button
        variant="secondary"
        size="sm"
        disabled={page === 0}
        onClick={() => onPageChange(0)}
      >
        Previous
      </Button>
      <div className="flex items-center gap-1">
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`min-w-[2.25rem] h-9 px-2 rounded-lg text-sm font-medium transition-colors ${
              p === page
                ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            {p + 1}
          </button>
        ))}
      </div>
      <Button
        variant="secondary"
        size="sm"
        disabled={page >= totalPages - 1}
        onClick={() => onPageChange(totalPages - 1)}
      >
        Next
      </Button>
      <span className="text-slate-500 dark:text-slate-400 text-sm ml-2">
        Page {page + 1} of {totalPages}
      </span>
    </div>
  );
}

export function OrderHistoryPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['orders', page],
    queryFn: () => orderService.myOrders({ page, size: pageSize }),
  });

  const orders = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Card className="text-center py-16">
          <div className="max-w-md mx-auto">
            <svg
              className="mx-auto h-24 w-24 text-slate-300 dark:text-slate-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-6 text-2xl font-semibold text-slate-800 dark:text-slate-100">
              You haven't placed any orders yet
            </h3>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Start shopping to place your first order
            </p>
            <div className="mt-8">
              <Button onClick={() => navigate('/products')}>
                Browse Products
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">My Orders</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          {data?.totalElements || 0} order{data?.totalElements !== 1 ? 's' : ''} in total
        </p>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => {
          const itemCount = order.items?.length || 0;
          const totalQuantity = order.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

          return (
            <Link key={order.id} to={`/orders/${order.id}`}>
              <Card hover className="p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  {/* Left Side - Order Info */}
                  <div className="flex-1 w-full sm:min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                        Order #{order.id}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Placed on {formatDate(order.createdAt)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span>{totalQuantity} item{totalQuantity !== 1 ? 's' : ''} ({itemCount} product{itemCount !== 1 ? 's' : ''})</span>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    {order.items && order.items.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                          {order.items.slice(0, 2).map(item => item.productName).join(', ')}
                          {order.items.length > 2 && ` +${order.items.length - 2} more`}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Side - Amount & Action */}
                  <div className="text-center sm:text-right w-full sm:w-auto flex-shrink-0">
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                      ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                    </p>
                    <span className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium group-hover:underline">
                      View Details
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Pagination */}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

function getStatusBadgeClass(status) {
  const styles = {
    PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
    MODIFICATION_REQUESTED: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
    APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  };
  return styles[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
}

function getStatusLabel(status) {
  const labels = {
    PENDING_APPROVAL: 'PENDING',
    MODIFICATION_REQUESTED: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
  };
  return labels[status] ?? status;
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      <Button
        size="sm"
        variant="secondary"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
      >
        Previous
      </Button>
      <span className="text-sm text-slate-600 dark:text-slate-400">
        Page {currentPage + 1} of {totalPages}
      </span>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
      >
        Next
      </Button>
    </div>
  );
}

const FILTERS = [
  { key: '', label: 'All Products' },
  { key: 'PENDING_APPROVAL', label: 'Pending' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'REJECTED', label: 'Rejected' },
];

export function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const size = 20;

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'products', page, statusFilter],
    queryFn: () => adminService.products({ page, size, status: statusFilter || undefined }),
  });

  const approveMutation = useMutation({
    mutationFn: (id) => adminService.approveProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => adminService.rejectProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });

  const products = data?.content || [];
  const totalPages = data?.totalPages || 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Product Moderation</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Review and manage vendor product submissions</p>
      </div>

      {/* Moderation Filters: All Products, Pending, Approved, Rejected */}
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((tab) => (
          <button
            key={tab.key || 'all'}
            onClick={() => {
              setStatusFilter(tab.key);
              setPage(0);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              statusFilter === tab.key
                ? 'bg-indigo-600 text-white shadow-md dark:bg-indigo-500'
                : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-slate-200 dark:bg-slate-600 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-1/3"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-1/4"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-1/2"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="p-6 text-center">
          <p className="text-red-600 dark:text-red-400">Failed to load products: {error.message}</p>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && products.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-slate-400 text-5xl mb-4">📦</div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">No products found</h3>
          <p className="text-slate-600 dark:text-slate-400">
            {statusFilter ? `No products with status "${FILTERS.find((f) => f.key === statusFilter)?.label ?? statusFilter}"` : 'No products available'}
          </p>
        </Card>
      )}

      {/* Products List */}
      {!isLoading && !error && products.length > 0 && (
        <div className="space-y-4">
          {products.map((product) => (
            <Card key={product.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex gap-4">
                {/* Product Image */}
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 flex-shrink-0">
                  {product.imageUrls && product.imageUrls.length > 0 ? (
                    <img
                      src={product.imageUrls[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/96?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-3xl">
                      📦
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 truncate">{product.name}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        by <span className="font-medium">{product.vendorBusinessName}</span>
                        {product.vendorEmail && <span className="text-slate-400"> ({product.vendorEmail})</span>}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusBadgeClass(product.status)}`}>
                      {getStatusLabel(product.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                    <div className="flex flex-col">
                      <span className="text-slate-500 dark:text-slate-400 text-xs">Price</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">${product.price}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-500 dark:text-slate-400 text-xs">Category</span>
                      <span className="text-slate-800 dark:text-slate-200 truncate" title={product.categoryName || 'N/A'}>{product.categoryName || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-500 dark:text-slate-400 text-xs">Stock</span>
                      <span className="text-slate-800 dark:text-slate-200">{product.stock}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-500 dark:text-slate-400 text-xs">Submitted</span>
                      <span className="text-slate-800 dark:text-slate-200 text-xs md:text-sm">{formatDate(product.createdAt)}</span>
                    </div>
                  </div>

                  {/* Admin Comments or Rejection Reason */}
                  {product.adminComments && (
                    <div className="mb-3 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded text-sm">
                      <span className="font-medium text-orange-800 dark:text-orange-300">Admin Comments:</span>
                      <p className="text-orange-700 dark:text-orange-400 mt-1">{product.adminComments}</p>
                    </div>
                  )}
                  {product.rejectionReason && (
                    <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm">
                      <span className="font-medium text-red-800 dark:text-red-300">Rejection Reason:</span>
                      <p className="text-red-700 dark:text-red-400 mt-1">{product.rejectionReason}</p>
                    </div>
                  )}

                  {/* Moderation Actions: Approve Product, Reject Product */}
                  <div className="flex flex-wrap items-center gap-2 justify-end">
                    <Link to={`/admin/products/${product.id}/review`}>
                      <Button size="sm" variant="ghost">Review</Button>
                    </Link>
                    <Button
                      size="sm"
                      onClick={() => approveMutation.mutate(product.id)}
                      disabled={product.status === 'APPROVED' || approveMutation.isPending}
                    >
                      Approve Product
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => rejectMutation.mutate(product.id)}
                      disabled={product.status === 'REJECTED' || rejectMutation.isPending}
                    >
                      Reject Product
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

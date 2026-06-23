import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../../services/productService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

function getStatusBadgeClass(status) {
  const classes = {
    APPROVED: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    PENDING_APPROVAL: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    MODIFICATION_REQUESTED: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
    REJECTED: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    INACTIVE: 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300',
  };
  return classes[status] || 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300';
}

function getStockStatus(product) {
  const available = product.availableQuantity ?? product.stock ?? 0;
  if (available <= 0) return { label: 'OUT OF STOCK', class: 'text-red-600 dark:text-red-400' };
  if (available <= 10) return { label: 'LOW STOCK', class: 'text-orange-600 dark:text-orange-400' };
  return { label: 'IN STOCK', class: 'text-green-600 dark:text-green-400' };
}

function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full p-6 shadow-xl">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{title}</h3>
        <p className="text-slate-600 dark:text-slate-300 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm} className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800">
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Button
        variant="secondary"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
      >
        Previous
      </Button>
      <span className="text-sm text-slate-600 dark:text-slate-400">
        Page {page + 1} of {totalPages}
      </span>
      <Button
        variant="secondary"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
      >
        Next
      </Button>
    </div>
  );
}

export function VendorProductListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, productId: null, productName: '' });
  const pageSize = 12;

  const { data, isLoading } = useQuery({
    queryKey: ['vendor-products', page],
    queryFn: () => productService.myProducts({ page, size: pageSize }),
  });

  const deleteMutation = useMutation({
    mutationFn: (productId) => productService.delete(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-products'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-products-stats'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-recent-products'] });
      setDeleteDialog({ isOpen: false, productId: null, productName: '' });
    },
  });

  const products = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  const handleDeleteClick = (product) => {
    setDeleteDialog({
      isOpen: true,
      productId: product.id,
      productName: product.name,
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.productId) {
      deleteMutation.mutate(deleteDialog.productId);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">My Products</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {data?.totalElements || 0} product{data?.totalElements !== 1 ? 's' : ''} in your inventory
          </p>
        </div>
        <Link to="/dashboard/products/new">
          <Button size="lg" className="shadow-lg">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </Button>
        </Link>
      </div>

      {/* Empty State */}
      {products.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">No Products Yet</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Start building your inventory by adding your first product. 
              All products will be reviewed by admins before going live.
            </p>
            <Link to="/dashboard/products/new">
              <Button size="lg">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Your First Product
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <>
          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const stockStatus = getStockStatus(product);
              const firstImage = product.imageUrls?.[0];

              return (
                <Card key={product.id} className="overflow-hidden flex flex-col">
                  {/* Product Image */}
                  <div className="aspect-square bg-slate-100 dark:bg-slate-700 relative overflow-hidden">
                    {firstImage ? (
                      <img
                        src={firstImage}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(product.status)}`}>
                        {product.status === 'PENDING_APPROVAL' && 'PENDING'}
                        {product.status === 'MODIFICATION_REQUESTED' && 'NEEDS CHANGES'}
                        {product.status === 'APPROVED' && 'APPROVED'}
                        {product.status === 'REJECTED' && 'REJECTED'}
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg mb-2 line-clamp-2">
                      {product.name}
                    </h3>

                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">
                      {product.description || 'No description provided'}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                          ₹{Number(product.price).toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Stock:</span>
                        <span className={`font-semibold ${stockStatus.class}`}>
                          {product.stock} units
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Status:</span>
                        <span className={stockStatus.class}>
                          {stockStatus.label}
                        </span>
                      </div>

                      {product.categoryName && (
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs font-medium">
                            {product.categoryName}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Admin Comments Alert */}
                    {product.status === 'MODIFICATION_REQUESTED' && product.adminComments && (
                      <div className="mb-3 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded text-xs">
                        <span className="font-semibold text-orange-800 dark:text-orange-200">Admin: </span>
                        <span className="text-orange-700 dark:text-orange-300">{product.adminComments}</span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3 mt-auto">
                      <Button
                        variant="secondary"
                        onClick={() => navigate(`/dashboard/products/edit/${product.id}`)}
                        className="w-full"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteClick(product)}
                        className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, productId: null, productName: '' })}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteDialog.productName}"? This action cannot be undone.`}
      />

      {/* Delete Error Message */}
      {deleteMutation.isError && (
        <div className="fixed bottom-4 right-4 max-w-md animate-fade-in">
          <Card className="p-4 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold text-red-800 dark:text-red-200">Failed to delete product</p>
                <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                  {deleteMutation.error?.response?.data?.message || 'Please try again.'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
